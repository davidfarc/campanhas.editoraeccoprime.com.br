/* =========================================================
   Recebe o formulário das páginas e cadastra o lead no Exact Spotter.
   Fica aqui, e não no navegador, para a chave nunca ficar exposta.

   Segredo:   SPOTTER_TOKEN        (wrangler secret / painel)
   Opcionais: SPOTTER_FUNNEL_NAME  nome do funil de destino (resolvido na API)
              SPOTTER_FUNNEL_ID    id do funil, se preferir fixar
              SPOTTER_STAGE        nome da etapa (exige o funil)
              SPOTTER_SDR_EMAIL    pré-vendedor responsável
              SPOTTER_DUPLICIDADE  "true" bloqueia duplicados
   ========================================================= */

const API = "https://api.exactspotter.com/v3";

const ORIGENS = {
  "Aula experimental: Cosmovisão (Jaidson)": true,
  "Apresentação do material (Ana)": true
};

function json(dados, status) {
  return new Response(JSON.stringify(dados), {
    status: status || 200,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}

function texto(v, max) {
  return String(v == null ? "" : v).trim().slice(0, max || 200);
}

/* "Recife, PE" -> { city: "Recife", state: "PE" }
   O Spotter exige state e country junto com city; sem UF, melhor
   não mandar cidade nenhuma e guardar o texto na descrição. */
function cidadeUf(v) {
  const m = texto(v, 120).match(/^(.+?)[,\/-]\s*([A-Za-zÀ-ÿ]{2})\s*$/);
  if (!m) return null;
  return { city: m[1].trim(), state: m[2].toUpperCase(), country: "Brasil" };
}

/* Acentos e maiúsculas fora, para comparar nome de funil e de etapa. */
function chave(v) {
  return String(v == null ? "" : v)
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .trim().toLowerCase();
}

async function spotterGet(caminho, token) {
  const r = await fetch(API + caminho, { headers: { token_exact: token } });
  if (!r.ok) return null;
  try { return await r.json(); } catch (e) { return null; }
}

/* Resolve o funil pelo nome uma vez e guarda enquanto a instância viver. */
let funilCache = null;

async function resolverFunil(token, nome) {
  if (funilCache && funilCache.nome === nome) return funilCache;

  const funis = await spotterGet("/Funnels", token);
  const lista = (funis && funis.value) || [];
  const achado = lista.find((f) => chave(f.value) === chave(nome));
  if (!achado) {
    console.error(
      "Funil nao encontrado: " + nome +
      " | disponiveis: " + lista.map((f) => f.value).join(" / ")
    );
    return null;
  }

  const etapas = await spotterGet("/stages", token);
  const doFunil = (((etapas && etapas.value) || [])
    .filter((e) => e.funnelId === achado.id)
    .map((e) => e.value));

  funilCache = { nome: nome, id: achado.id, etapas: doFunil };
  return funilCache;
}

async function spotter(caminho, token, corpo) {
  const r = await fetch(API + caminho, {
    method: "POST",
    headers: { "Content-Type": "application/json", token_exact: token },
    body: JSON.stringify(corpo)
  });
  const txt = await r.text();
  let dados = null;
  try { dados = txt ? JSON.parse(txt) : null; } catch (e) { /* resposta não-JSON */ }
  return { ok: r.ok, status: r.status, dados, txt };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname !== "/api/lead") return new Response("Not found", { status: 404 });
    if (request.method !== "POST") {
      return json({ erro: "metodo_nao_permitido" }, 405);
    }

    // Só aceita envio das próprias páginas.
    const origem = request.headers.get("Origin");
    if (origem && new URL(origem).host !== url.host) {
      return json({ erro: "origem_nao_permitida" }, 403);
    }

    if (!env.SPOTTER_TOKEN) {
      console.error("SPOTTER_TOKEN ausente: lead nao cadastrado");
      return json({ erro: "integracao_nao_configurada" }, 503);
    }

    let d;
    try { d = await request.json(); } catch (e) {
      return json({ erro: "json_invalido" }, 400);
    }

    const nome = texto(d.nome, 120);
    const escola = texto(d.escola, 150);
    const email = texto(d.email, 150);
    const fone = texto(d.whatsapp_numeros, 20).replace(/\D/g, "");

    if (!nome || !escola) return json({ erro: "faltou_nome_ou_escola" }, 400);
    if (!/^\S+@\S+\.\S+$/.test(email)) return json({ erro: "email_invalido" }, 400);
    if (fone.length < 12 || fone.length > 13) return json({ erro: "whatsapp_invalido" }, 400);
    if (texto(d.consentimento, 10).toLowerCase() !== "sim") {
      return json({ erro: "sem_consentimento" }, 400);
    }

    const origemLead = ORIGENS[d.origem] ? d.origem : "Páginas de captação SEE";

    const descricao = [
      "Contato: " + nome,
      "Cargo: " + (texto(d.cargo, 80) || "não informado"),
      "Cidade/UF: " + (texto(d.cidade_uf, 120) || "não informado"),
      "Alunos: " + (texto(d.alunos, 40) || "não informado"),
      "Consentimento: sim",
      "Página: " + texto(d.pagina, 300),
      "Enviado em: " + texto(d.enviado_em, 40),
      "UTMs: " + ["utm_source", "utm_medium", "utm_campaign", "utm_content"]
        .map((k) => k + "=" + (texto(d[k], 80) || "-")).join(" | ")
    ].join("\n");

    const lead = {
      name: escola,
      source: origemLead,
      ddiPhone: fone.slice(0, 2),
      phone: fone.slice(2),
      description: descricao
    };

    const local = cidadeUf(d.cidade_uf);
    if (local) Object.assign(lead, local);
    if (env.SPOTTER_FUNNEL_ID) {
      lead.funnelId = Number(env.SPOTTER_FUNNEL_ID);
    } else if (env.SPOTTER_FUNNEL_NAME) {
      const funil = await resolverFunil(env.SPOTTER_TOKEN, env.SPOTTER_FUNNEL_NAME);
      if (funil) lead.funnelId = funil.id;
    }

    // O Spotter so aceita etapa junto com o funil.
    if (lead.funnelId && env.SPOTTER_STAGE) {
      lead.stage = env.SPOTTER_STAGE;
      if (funilCache && funilCache.id === lead.funnelId &&
          funilCache.etapas.length &&
          !funilCache.etapas.some((e) => chave(e) === chave(env.SPOTTER_STAGE))) {
        console.error(
          "Etapa '" + env.SPOTTER_STAGE + "' nao existe nesse funil | etapas: " +
          funilCache.etapas.join(" / ")
        );
      }
    }
    if (env.SPOTTER_SDR_EMAIL) lead.sdrEmail = env.SPOTTER_SDR_EMAIL;

    const r1 = await spotter("/LeadsAdd", env.SPOTTER_TOKEN, {
      duplicityValidation: env.SPOTTER_DUPLICIDADE === "true",
      lead: lead
    });

    if (!r1.ok) {
      console.error("LeadsAdd falhou", r1.status, r1.txt.slice(0, 300));
      return json({ erro: "spotter_recusou", status: r1.status }, 502);
    }

    const leadId = r1.dados && r1.dados.value;

    // O lead no Spotter é a ESCOLA. A pessoa entra como contato.
    let contatoOk = false;
    if (leadId) {
      const r2 = await spotter("/personsAdd", env.SPOTTER_TOKEN, {
        leadId: leadId,
        name: nome,
        email: email,
        ddiPhone1: fone.slice(0, 2),
        phone1: fone.slice(2),
        jobTitle: texto(d.cargo, 80),
        mainContact: true
      });
      contatoOk = r2.ok;
      if (!r2.ok) console.error("personsAdd falhou", r2.status, r2.txt.slice(0, 300));
    }

    // O lead entrou; se o contato falhou, não vale barrar a pessoa.
    return json({ ok: true, leadId: leadId, contato: contatoOk });
  }
};

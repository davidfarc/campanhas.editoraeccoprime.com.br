# Publicação — Cloudflare Workers

Site estático servido pelo Workers Static Assets. Só o conteúdo de `public/`
vai ao ar; o resto do repositório não é publicado.

```
public/          o site (é isto que vira o domínio)
wrangler.jsonc   configuração do Worker
LEIA-ME.txt      instruções de conteúdo (não publicado)
```

## Rodar local

```
npx wrangler dev
```

## Publicar à mão

```
npx wrangler deploy
```

Na primeira vez pede login no navegador (`npx wrangler login`).

## Publicar a cada push (recomendado)

No painel da Cloudflare: **Workers & Pages → Create → Workers → Import a
repository**, escolher `davidfarc/campanhas.editoraeccoprime.com.br`,
branch `main`, sem comando de build. A partir daí todo push em `main`
publica sozinho.

## Domínio

Já declarado em `wrangler.jsonc`:

```jsonc
"routes": [
  { "pattern": "campanhas.editoraeccoprime.com.br", "custom_domain": true }
]
```

A zona `editoraeccoprime.com.br` já usa os nameservers da Cloudflare
(`tom` e `connie`), e o subdomínio `campanhas.` ainda não existe. No
primeiro deploy o registro é criado sozinho, com certificado.

## Os vídeos NÃO vão no Workers

Limite do Workers Static Assets: **25 MiB por arquivo**. Os vídeos têm
45,8 MiB e 47,8 MiB. Além do tamanho, static assets não respondem a
requisições `Range`: devolve 200 com o arquivo inteiro em vez de 206, o
que quebra o avanço na linha do tempo e a reprodução no Safari/iPhone.

Por isso `public/.assetsignore` exclui `*.mp4`.

**Decidido: YouTube, com vídeos não listados.**

Subir cada vídeo ao canal como **Não listado** e colar o link em
`public/assets/config.js`:

```js
videos: {
  "aula-experimental": "https://youtu.be/XXXXXXXXXXX",
  "apresentacao-material": "https://youtu.be/YYYYYYYYYYY"
}
```

Qualquer formato de link serve (`watch?v=`, `youtu.be/`, `embed/`,
`shorts/`, ou só o ID de 11 caracteres). O `app.js` converte sozinho para
`youtube-nocookie.com/embed/...?rel=0&modestbranding=1&playsinline=1`.

Os `.mp4` continuam no repositório como originais, mas não são publicados.
As capas `.jpg` continuam em uso: são os cards da página inicial.

## Envio dos leads para o Exact Spotter

O formulário envia para `/api/lead`, no próprio domínio. Quem atende é o
Worker em `src/index.js`, que chama a API do Spotter. A chave fica como
secret na Cloudflare e **nunca** aparece no navegador.

### Variáveis

| Nome | Obrigatório | Para que serve |
|---|---|---|
| `SPOTTER_TOKEN` | sim | Token Exact API (Configurações → Integrações) |
| `SPOTTER_FUNNEL_ID` | não | Funil de destino; sem ele, vai para o funil padrão |
| `SPOTTER_STAGE` | não | Nome da etapa (exige o funil) |
| `SPOTTER_SDR_EMAIL` | não | Pré-vendedor responsável; sem ele o Spotter sorteia |
| `SPOTTER_DUPLICIDADE` | não | `"true"` faz o Spotter recusar duplicados |

O token entra como **secret** (fica oculto). Os demais podem ser
variáveis de texto comuns.

Pelo painel: Worker → Settings → Variables and Secrets.
Pela linha de comando:

```
npx wrangler secret put SPOTTER_TOKEN
```

### Como o lead é montado

No Spotter o "lead" é a **escola**, e a pessoa é um **contato** dela.
Então são duas chamadas:

1. `POST /v3/LeadsAdd` — `name` = nome da escola, `source` = a origem que
   distingue Academy de editora, telefone com DDI separado, cidade/UF
   quando dá para ler a sigla, e uma `description` com cargo, número de
   alunos, consentimento, página e UTMs.
2. `POST /v3/personsAdd` — nome, e-mail, telefone e cargo da pessoa,
   como contato principal (`mainContact: true`).

Se a segunda falhar, a primeira já valeu: o Worker responde sucesso para
não travar a pessoa na frente do vídeo, e registra o erro no log.

### Ligar e desligar

Enquanto `endpoint` estiver vazio no `config.js`, o site nem chama o
Worker (modo de teste). Para ligar:

```js
endpoint: "/api/lead",
```

Só fazer isso **depois** de cadastrar o `SPOTTER_TOKEN` — sem ele o
Worker responde 503 e a pessoa vê erro no formulário.

Os logs ficam em Workers → Logs (observability está ligado). O Worker
nunca grava os dados do lead no log, só os erros da API.

## Tags

Ver o bloco `tags` em `public/assets/config.js`. Instalação direta, sem
contêiner do GTM — não acrescentar o `GTM-NQQBDZ2` da raiz, senão tudo
dispara em dobro.

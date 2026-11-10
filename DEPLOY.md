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

Depois do primeiro deploy, em **Settings → Domains & Routes → Add custom
domain**, usar `campanhas.editoraeccoprime.com.br`. O DNS já está na
Cloudflare, então o registro é criado automaticamente.

## Os vídeos NÃO vão no Workers

Limite do Workers Static Assets: **25 MiB por arquivo**. Os vídeos têm
45,8 MiB e 47,8 MiB. Além do tamanho, static assets não respondem a
requisições `Range`: devolve 200 com o arquivo inteiro em vez de 206, o
que quebra o avanço na linha do tempo e a reprodução no Safari/iPhone.

Por isso `public/.assetsignore` exclui `*.mp4`.

Onde hospedar, em ordem de preferência:

1. **R2 com bucket público** em `videos.editoraeccoprime.com.br`.
   Precisa habilitar o R2 no painel primeiro (ainda não está ativo).
2. **Cloudflare Stream** — resolve sozinho, mas é pago por minuto.
3. **Panda Video / YouTube não listado** — trocar por uma URL de player.

Escolhido o destino, apontar em `public/assets/config.js`:

```js
videos: {
  "aula-experimental": "https://videos.editoraeccoprime.com.br/aula-experimental.mp4",
  "apresentacao-material": "https://videos.editoraeccoprime.com.br/apresentacao-material.mp4"
}
```

O `app.js` já aceita tanto `.mp4` direto quanto URL de player em iframe.

## Tags

Ver o bloco `tags` em `public/assets/config.js`. Instalação direta, sem
contêiner do GTM — não acrescentar o `GTM-NQQBDZ2` da raiz, senão tudo
dispara em dobro.

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

## Tags

Ver o bloco `tags` em `public/assets/config.js`. Instalação direta, sem
contêiner do GTM — não acrescentar o `GTM-NQQBDZ2` da raiz, senão tudo
dispara em dobro.

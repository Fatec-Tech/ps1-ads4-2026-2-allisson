# Atividade prática CRUD de pacientes

Projeto-base da atividade de Express, CRUD completo e deploy no Render. A API usa dados em memória, como solicitado no material da aula; os registros voltam aos dados iniciais quando o processo reinicia. Não use dados pessoais reais.

## Estrutura

- `backend/`: API Node.js + Express, com GET, POST, PUT e DELETE.
- `frontend/`: página HTML/CSS/JavaScript que consome a API usando Fetch.
- `github-issues/`: textos prontos para abrir as duas issues pedidas na orientação.

## Executar localmente

1. Abra um terminal na pasta `backend/`.
2. Rode `npm install`.
3. Rode `npm run dev` (ou `npm start`). A API ficará em `http://localhost:3000`.
4. Abra `frontend/index.html` no navegador. O frontend já aponta para `http://localhost:3000/pacientes`.

Rotas: `GET /pacientes`, `GET /pacientes/:id`, `POST /pacientes`, `PUT /pacientes/:id` e `DELETE /pacientes/:id`.

## Publicar no GitHub e Render

1. Crie um repositório GitHub e envie o conteúdo desta pasta, incluindo `/backend` e `/frontend`. O `.gitignore` impede enviar `node_modules`.
2. No Render, crie um **Web Service** ligado ao repositório. Configure Root Directory `backend`, Build Command `npm install`, Start Command `npm start`. Nomeie `api-clinica-SEU_IDENTIFICADOR`.
3. Depois do deploy, confirme a API abrindo `https://SUA-URL-DA-API/pacientes`.
4. No arquivo `frontend/js/app.js`, troque `URL_API` pela URL de produção da API, acrescida de `/pacientes`, e envie essa alteração ao GitHub.
5. No Render, crie um **Static Site** ligado ao mesmo repositório. Configure Root Directory `frontend`, Build Command vazio e Publish Directory `.`. Nomeie `app-clinica-SEU_IDENTIFICADOR`.
6. Abra o endereço do Static Site e confira cadastro, edição, exclusão e listagem.
7. Responda à publicação da atividade com os três links: repositório GitHub, endpoint `/pacientes` em produção e endereço do frontend.

O plano gratuito do Render pode suspender serviços inativos; a primeira chamada após a suspensão pode demorar. Como a API é pública, qualquer visitante pode alterar os registros temporários.

## Issues solicitadas

Abra no repositório duas issues usando os textos em `github-issues/issue-exercicios-item-8.md` e `github-issues/issue-discussao-item-11.md`.

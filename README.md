# 🎧 Playlist AI – Geração de Playlist Inteligente com base em 4 músicas

Este projeto é uma aplicação web composta por Node.js (backend) e React (frontend) que permite ao usuário digitar 4 músicas e receber como resultado uma playlist com músicas semelhantes.

## Tecnologias Utilizadas

- [Node.js](https://nodejs.org/) – Ambiente de execução do backend.
- [Express](https://expressjs.com/) – Framework web para criação das rotas e middlewares.
- [TypeScript](https://www.typescriptlang.org/) – Tipagem estática para maior robustez.
- [Prisma ORM](https://www.prisma.io/) – Mapeamento objeto-relacional para acesso ao banco de dados PostgreSQL.
- [PostgreSQL](https://www.postgresql.org/) – Banco de dados relacional.
- [Zod](https://zod.dev/) – Validação de dados e schemas.
- [Docker Compose](https://docs.docker.com/compose/) – Orquestração de containers para ambiente de desenvolvimento.
- [ESLint](https://eslint.org/) & [Prettier](https://prettier.io/) – Padronização e formatação de código.
- [Spotify Web API](https://developer.spotify.com/documentation/web-api) – Busca e validação de músicas.
- [LLM (OpenAI/Gemini)](https://gemini.google.com/app) – Geração de recomendações inteligentes.

## Organização e Arquitetura de Pastas

```
playlist-ai-api/
│
├── src/
│   ├── controllers/      # Lógica dos endpoints (camada de controle)
│   ├── lib/              # Bibliotecas utilitárias (ex: conexão Prisma)
│   ├── middleware/       # Middlewares globais (ex: tratamento de erros)
│   ├── models/           # Tipos, enums e validações (Zod)
│   ├── repositories/     # Acesso e manipulação de dados no banco
│   ├── routes/           # Definição das rotas da API
│   ├── services/         # Regras de negócio e integrações externas
│   └── index.ts          # Ponto de entrada da aplicação
│
├── prisma/               # Schema do banco e migrações
│
├── generated/            # Código gerado automaticamente pelo Prisma
│
├── .github/              # Workflows de CI/CD
│
├── docker-compose.yaml   # Orquestração dos containers
├── package.json          # Dependências e scripts
├── tsconfig.json         # Configuração do TypeScript
├── .env.example          # Exemplo de variáveis de ambiente
└── README.md
```

## Arquitetura

O projeto segue uma arquitetura baseada em camadas:

- **Controller:** Recebe as requisições HTTP, valida dados e aciona os serviços.
- **Service:** Implementa as regras de negócio e integrações externas (ex: Spotify, LLM).
- **Repository:** Responsável pelo acesso ao banco de dados via Prisma.
- **Model:** Define tipos, enums e validações de dados.
- **Middleware:** Tratamento de erros, autenticação, etc.

## Como Rodar o Projeto

### Pré-requisitos

- [Node.js](https://nodejs.org/) (v18+ recomendado)
- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)

### Instalação e Configuração

1. Clonar o repositório

   ```sh
   git clone https://github.com/Hildon27/playlist-ai-api
   cd playlist-ai-api
   ```

2. Configurar variáveis de ambiente

   Copie o arquivo `.env.example` para `.env` e ajuste as variáveis conforme necessário:

   ```sh
   cp .env.example .env
   ```

   Certifique-se de configurar as chaves da [Spotify Web API](https://developer.spotify.com/documentation/web-api) e do [Gemini](https://ai.google.dev/) ou OpenAI no arquivo `.env`.

   > **Obs:** Para rodar com Docker Compose, a variável `DATABASE_URL` já está configurada para usar o PostgreSQL do container.

### Opção 1: Execução Total via Docker (API e Banco de Dados)

Esta opção automatiza todo o processo, subindo a aplicação e o banco de dados em containers.

1. Suba os serviços:

   ```sh
   docker-compose up -d
   ```

A API estará disponível em `http://localhost:3000/api`.

### Opção 2: Execução Híbrida (Banco no Docker e API Manual)

Ideal para desenvolvimento, onde o banco de dados roda em container e a API roda diretamente na sua máquina para facilitar o debug.

1. Inicie apenas o banco de dados:

   ```sh
   docker-compose up -d db
   ```

2. Instale as dependências locais:

   ```sh
   npm install
   ```

3. Execute as migrações e gere o client do [Prisma ORM](https://www.prisma.io/):

   ```sh
   npm run migrate:deploy
   npm run prisma:generate
   ```

4. Inicie a API em modo de desenvolvimento:

   ```sh
   npm run dev
   ```

A API estará disponível em `http://localhost:3000/api`.

## Testando a API

- Utilize o arquivo [postman-collection.json](./postman-collection.json) para importar a coleção de requisições no [Postman](https://www.postman.com/).

### 🔎 Health & Info

- `GET    /api/health` – Verificar saúde da API
- `GET    /api` – Buscar informações da API (Nome, endpoints, etc)

### Auth

- `POST   /api/auth/register` – Criar usuário
- `POST   /api/auth/login` – Iniciar sessão de usuário

### Users

- `GET    /api/users` – Listar todos usuários
- `GET    /api/users/me` – Buscar usuário por ID
- `PUT    /api/users/me` – Atualizar usuário
- `DELETE /api/users/me` – Remover usuário

### Playlists

- `POST   /api/playlists` – Criar playlist
- `GET    /api/playlists/:id` – Buscar playlist por ID
- `PUT    /api/playlists/:id` – Atualizar playlist
- `DELETE /api/playlists/:id` – Deletar playlist
- `GET    /api/playlists/user` – Listar playlists do usuário logado
- `GET    /api/playlists/public/all` – Listar todas playlists públicas

### Playlist Musics

- `POST   /api/playlists/:id/musics` – Adicionar música à playlist
- `DELETE /api/playlists/:id/musics` – Remover música da playlist
- `GET    /api/playlists/:id/musics` – Listar músicas da playlist

### Comments

- `POST   /api/comments` – Adicionar comentário a uma playlist
- `GET    /api/comments/:commentId` – Buscar comentário por ID
- `PUT    /api/comments/:commentId` – Editar um comentário
- `DELETE /api/comments/:commentId` – Deletar comentário
- `GET    /api/comments/playlists/:playlistId` – Buscar todos os comentário de uma playlists
- `GET    /api/comments/user` – Buscar todos os comentário feitos pelo usuário logado

### Follows

- `GET    /api/follows/followers` – Listar seguidores do usuário
- `GET    /api/follows/followeds` – Listar pessoas seguindas do usuário
- `DELETE /api/follows/:followedId/unfollow` – Deixar de seguir usuário
- `DELETE /api/follows/:followerId/remove` – Remover seguidor

### Follow Requests

- `POST   /api/follow-requests/register` – Solicitar seguir usuário
- `GET    /api/follow-requests/sent` – Listar solicitações feitas
- `GET    /api/follow-requests/received` – Listar solicitações recebidas
- `DELETE /api/follow-requests/:id` – Cancelar solicitação de seguir
- `PATCH  /api/follow-requests/:id/process` – Processar solicitação (aprovar/rejeitar)

### Spotify

- `GET    /api/spotify/search` – Buscar músicas no Spotify
- `GET    /api/spotify/tracks/:trackId` – Buscar música específica no Spotify
- `POST   /api/spotify/validate` – Validação de músicas no Spotify
- `POST   /api/spotify/recommendations` – Buscar recomendações de músicas no Spotify

### AI Playlist

- `POST    /api/ai/generate-playlist` – Geração de playlist com IA

## Considerações

Este projeto foi desenvolvido como parte da disciplina **Programação Para Web II** do curso de [Ciência da Computação](https://www.computacao.ufcg.edu.br/) da [UFCG](https://portal.ufcg.edu.br/).

- 💻 Desenvolvedores: [Hildon Neto](https://github.com/Hildon27) e [Marcos Antonio](https://github.com/MarcosAntonio15243).
- 📚 Projeto acadêmico com foco em aplicar conceitos práticos da disciplina sobre o ambiente web em um sistema funcional.
- 🚀 Sempre aberto a sugestões, melhorias ou feedback!

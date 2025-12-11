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

### 1. Pré-requisitos

- [Node.js](https://nodejs.org/) (v18+ recomendado)
- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)

### 2. Clonar o repositório

```sh
git clone https://github.com/Hildon27/playlist-ai-api
cd playlist-ai-api
```

### 3. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env` e ajuste as variáveis conforme necessário:

```sh
cp .env.example .env
```

> **Obs:** Para rodar com Docker Compose, a variável `DATABASE_URL` já está configurada para usar o PostgreSQL do container.

### 4. Subir o banco de dados com Docker Compose

```sh
docker-compose up -d
```

Isso irá iniciar um container PostgreSQL acessível na porta 5432.

### 5. Instalar dependências

```sh
npm install
```

### 6. Rodar as migrações e gerar o client Prisma

```sh
npm run migrate:deploy
npm run prisma:generate
```

### 7. Rodar o projeto em modo desenvolvimento

```sh
npm run dev
```

A API estará disponível em [http://localhost:3000/api](http://localhost:3000/api).

## Testando a API

- Utilize o arquivo [postman-collection.json](./postman-collection.json) para importar a coleção de requisições no [Postman](https://www.postman.com/).

### 🔎 Health

- `GET    /api/health` – Verificar saúde da API

### Users

- `GET    /api/users` – Listar todos usuários
- `GET    /api/users/:id` – Buscar usuário por ID
- `POST   /api/users` – Criar usuário
- `PUT    /api/users/:id` – Atualizar usuário
- `DELETE /api/users/:id` – Remover usuário

### Follow Requests

- `POST   /api/follow-requests/register` – Solicitar seguir usuário
- `GET    /api/follow-requests/by-follower/:id` – Listar solicitações por seguidor
- `GET    /api/follow-requests/by-followed/:id` – Listar solicitações por seguido
- `DELETE /api/follow-requests/:id` – Cancelar solicitação de seguir
- `PATCH  /api/follow-requests/:id/process` – Processar solicitação (aprovar/rejeitar)

### Follows

- `GET    /api/follows/:userId/followers` – Listar seguidores do usuário
- `DELETE /api/follows/:followedId/unfollow` – Deixar de seguir usuário
- `DELETE /api/follows/:followerId/remove` – Remover seguidor

### Playlists

- `GET    /api/playlists/:id` – Buscar playlist por ID
- `GET    /api/playlists/user/:userId` – Listar playlists de um usuário
- `GET    /api/playlists/public/all` – Listar todas playlists públicas
- `POST   /api/playlists` – Criar playlist
- `PUT    /api/playlists/:id` – Atualizar playlist
- `DELETE /api/playlists/:id` – Deletar playlist
- `POST   /api/playlists/:id/musics` – Adicionar música à playlist
- `DELETE /api/playlists/:id/musics` – Remover música da playlist
- `GET    /api/playlists/:id/musics` – Listar músicas da playlist

## Considerações

Este projeto foi desenvolvido como parte da disciplina **Programação Para Web II** do curso de [Ciência da Computação](https://www.computacao.ufcg.edu.br/) da [UFCG](https://portal.ufcg.edu.br/).

- 💻 Desenvolvedores: [Hildon Neto](https://github.com/Hildon27) e [Marcos Antonio](https://github.com/MarcosAntonio15243).
- 📚 Projeto acadêmico com foco em aplicar conceitos práticos da disciplina sobre o ambiente web em um sistema funcional.
- 🚀 Sempre aberto a sugestões, melhorias ou feedback!

# 🎧 Playlist AI – Geração de Playlist Inteligente com base em 4 músicas

Este projeto é uma aplicação web composta por Node.js (backend) e React (frontend) que permite ao usuário digitar 4 músicas e receber como resultado uma playlist com músicas semelhantes.

## A aplicação combina:

- [Spotify Web API](https://developer.spotify.com/) para buscar músicas e validar resultados
- LLM (IA – ex: [OpenAI](https://openai.com/) / [Gemini](https://gemini.google.com/)) para gerar recomendações inteligentes
- Possibilidade de exportar a playlist para o [Spotify](https://open.spotify.com/) do usuário

## Como o sistema funciona

1. **O usuário escolhe as 4 músicas**

    - No `frontend`, o usuário começa a digitar o nome de uma música.
    - A cada letra digitada, a aplicação consulta a Spotify Web API.
    - A API retorna sugestões reais do catálogo do Spotify, permitindo ao usuário selecionar com precisão as músicas desejadas.
    - Quando 4 músicas são escolhidas, o usuário envia para o `backend`.

2. **O backend recebe as músicas**

    - O `backend` recebe os nomes das 4 músicas escolhidas.
    - Ele é responsável por processar a geração da playlist inteligente.

3. **A IA gera recomendações**

    - O `backend` envia essas músicas para uma LLM (ex: OpenAI GPT-4o-mini ou Google Gemini).
    - A IA interpreta estilo, clima, energia e contexto musical.
    - Ela gera uma lista de músicas semelhantes ou relacionadas tematicamente.
    - Essa geração acontece em texto (nome da faixa + artista).
    - Essa etapa traz criatividade e flexibilidade:
    - Pode gerar músicas com a mesma vibe, energia ou emoção
    - Pode sugerir faixas de diferentes épocas e gêneros, desde que ainda relacionadas

4. **As recomendações são validadas no Spotify**

    - Como a IA pode sugerir músicas que não existem ou com nomes incorretos, o backend valida cada uma delas usando novamente a Spotify Web API.
    - Apenas músicas realmente existentes no catálogo são mantidas.
    - A playlist final inclui:
      - `nome da música`
      - `artista`
      - `imagem da capa`

5. **A playlist é enviada de volta ao usuário**

    - O `backend` devolve a lista final com as músicas validadas.
    - O `frontend` exibe as capas, nomes, artistas e prévias para o usuário.

6. **Exportar para o Spotify do usuário**

    - Após receber a playlist, é possivel exporta-la para o spotify do usuario
    - Para isso, o usuario deve logar com a sua conta
    - Assim, com o token de permissao, é possivel adicionar a playlist gerada para o spotify pessoal do usuario por meio da API do proprio spotify

## Considerações

Este projeto foi desenvolvido como parte da disciplina **Programação Para Web II** do curso de [Ciência da Computação](https://www.computacao.ufcg.edu.br/) da [UFCG](https://portal.ufcg.edu.br/).

- 💻 Desenvolvedores: [Hildon Neto](https://github.com/Hildon27) e [Marcos Antonio](https://github.com/MarcosAntonio15243).
- 📚 Projeto acadêmico com foco em aplicar conceitos práticos da disciplina sobre o ambiente web em um sistema funcional.
- 🚀 Sempre aberto a sugestões, melhorias ou feedback!

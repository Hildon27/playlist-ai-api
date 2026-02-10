# Especificação de Testes Unitários - Services

Este documento descreve os cenários de testes unitários para os serviços do sistema playlist-ai-api.

---

## 📋 Índice

1. [AuthService](#1-authservice)
2. [UserService](#2-userservice)
3. [UserPlaylistService](#3-userplaylistservice)
4. [AIPlaylistService](#4-aiplaylistservice)
5. [SpotifyService](#5-spotifyservice)
6. [FollowService](#6-followservice)
7. [FollowRequestService](#7-followrequestservice)
8. [PlaylistCommentService](#8-playlistcommentservice)

---

## 1. AuthService

### 1.1 `register(data: CreateUserDTO)`

| ID | Cenário | Entrada | Resultado Esperado |
|----|---------|---------|-------------------|
| AUTH-REG-01 | Registro com dados válidos | `{ firstName: "John", lastName: "Doe", email: "john@test.com", password: "123456", privacity: "public" }` | Retorna `UserResponseDTO` com id gerado |
| AUTH-REG-02 | Registro com email já existente | Email já cadastrado no banco | Lança `ApiError(USER_EMAIL_IN_USE)` |
| AUTH-REG-03 | Senha é hasheada antes de salvar | Password plaintext | Repository recebe password hasheado (não igual ao original) |
| AUTH-REG-04 | Registro com email em formato inválido | `email: "invalid-email"` | Lança erro de validação |

### 1.2 `authenticate(email: string, password: string)`

| ID | Cenário | Entrada | Resultado Esperado |
|----|---------|---------|-------------------|
| AUTH-LOGIN-01 | Login com credenciais válidas | Email e senha corretos | Retorna `{ user: UserResponseDTO, token: string }` |
| AUTH-LOGIN-02 | Login com email inexistente | Email não cadastrado | Lança `ApiError(INVALID_CREDENTIALS)` |
| AUTH-LOGIN-03 | Login com senha incorreta | Email correto, senha errada | Lança `ApiError(INVALID_CREDENTIALS)` |
| AUTH-LOGIN-04 | Login com email vazio | `email: ""` | Lança `ApiError(VALIDATION_EMAIL_INVALID)` |
| AUTH-LOGIN-05 | Token JWT é gerado corretamente | Credenciais válidas | Token contém userId e email no payload |

---

## 2. UserService

### 2.1 `findById(id: string)`

| ID | Cenário | Entrada | Resultado Esperado |
|----|---------|---------|-------------------|
| USER-FIND-01 | Buscar usuário existente | `id: "valid-uuid"` | Retorna `UserResponseDTO` |
| USER-FIND-02 | Buscar usuário inexistente | `id: "non-existent-uuid"` | Retorna `null` |
| USER-FIND-03 | Buscar com id vazio | `id: ""` | Lança `ApiError(VALIDATION_USER_ID_REQUIRED)` |
| USER-FIND-04 | Buscar com id apenas espaços | `id: "   "` | Lança `ApiError(VALIDATION_USER_ID_REQUIRED)` |

### 2.2 `findByEmail(email: string)`

| ID | Cenário | Entrada | Resultado Esperado |
|----|---------|---------|-------------------|
| USER-EMAIL-01 | Buscar por email existente | `email: "john@test.com"` | Retorna `UserResponseDTO` |
| USER-EMAIL-02 | Buscar por email inexistente | `email: "notfound@test.com"` | Retorna `null` |
| USER-EMAIL-03 | Buscar com email vazio | `email: ""` | Lança `ApiError(VALIDATION_EMAIL_INVALID)` |

### 2.3 `findAll()`

| ID | Cenário | Entrada | Resultado Esperado |
|----|---------|---------|-------------------|
| USER-ALL-01 | Listar todos os usuários | - | Retorna array de `UserResponseDTO[]` |
| USER-ALL-02 | Banco sem usuários | - | Retorna array vazio `[]` |

### 2.4 `update(id: string, data: UpdateUserDTO)`

| ID | Cenário | Entrada | Resultado Esperado |
|----|---------|---------|-------------------|
| USER-UPD-01 | Atualizar nome do usuário | `{ firstName: "Jane" }` | Retorna usuário com nome atualizado |
| USER-UPD-02 | Atualizar email para um disponível | `{ email: "newemail@test.com" }` | Retorna usuário com email atualizado |
| USER-UPD-03 | Atualizar email para um já em uso | `{ email: "existing@test.com" }` | Lança `ApiError(USER_EMAIL_IN_USE)` |
| USER-UPD-04 | Atualizar usuário inexistente | `id: "non-existent"` | Lança `ApiError(USER_NOT_FOUND)` |
| USER-UPD-05 | Atualizar com id vazio | `id: ""` | Lança `ApiError(VALIDATION_USER_ID_REQUIRED)` |
| USER-UPD-06 | Atualizar múltiplos campos | `{ firstName: "Jane", lastName: "Smith" }` | Retorna usuário com ambos campos atualizados |

### 2.5 `delete(id: string)`

| ID | Cenário | Entrada | Resultado Esperado |
|----|---------|---------|-------------------|
| USER-DEL-01 | Deletar usuário existente | `id: "valid-uuid"` | Executa sem erro |
| USER-DEL-02 | Deletar usuário inexistente | `id: "non-existent"` | Lança `ApiError(USER_NOT_FOUND)` |
| USER-DEL-03 | Deletar com id vazio | `id: ""` | Lança `ApiError(VALIDATION_USER_ID_REQUIRED)` |

---

## 3. UserPlaylistService

### 3.1 `createPlaylist(userId: string, data: CreateUserPlaylistDTO)`

| ID | Cenário | Entrada | Resultado Esperado |
|----|---------|---------|-------------------|
| PLAYLIST-CREATE-01 | Criar playlist pública | `{ name: "My Playlist", privacity: "public" }` | Retorna `UserPlaylistDTO` com dados preenchidos |
| PLAYLIST-CREATE-02 | Criar playlist privada | `{ name: "Private", privacity: "private" }` | Retorna playlist com privacity = "private" |
| PLAYLIST-CREATE-03 | Criar playlist com aiMessage | `{ name: "AI Playlist", privacity: "public", aiMessage: "Based on your taste..." }` | Retorna playlist com aiMessage salvo |

### 3.2 `updatePlaylist(userId: string, id: string, data: UpdateUserPlaylistDTO)`

| ID | Cenário | Entrada | Resultado Esperado |
|----|---------|---------|-------------------|
| PLAYLIST-UPD-01 | Atualizar nome da playlist | `{ name: "New Name" }` | Retorna playlist atualizada |
| PLAYLIST-UPD-02 | Atualizar privacity | `{ privacity: "private" }` | Retorna playlist com nova privacidade |
| PLAYLIST-UPD-03 | Atualizar playlist inexistente | `id: "non-existent"` | Lança `NotFoundError` |
| PLAYLIST-UPD-04 | Atualizar playlist de outro usuário | `userId` diferente do owner | Lança `NotFoundError` |

### 3.3 `deletePlaylist(userId: string, id: string)`

| ID | Cenário | Entrada | Resultado Esperado |
|----|---------|---------|-------------------|
| PLAYLIST-DEL-01 | Deletar playlist existente | Playlist do próprio usuário | Retorna `true` |
| PLAYLIST-DEL-02 | Deletar playlist inexistente | `id: "non-existent"` | Lança `NotFoundError` |
| PLAYLIST-DEL-03 | Deletar playlist de outro usuário | `userId` diferente do owner | Lança `NotFoundError` |

### 3.4 `getPlaylistById(userId: string, id: string)`

| ID | Cenário | Entrada | Resultado Esperado |
|----|---------|---------|-------------------|
| PLAYLIST-GET-01 | Buscar playlist existente | Playlist do usuário | Retorna `UserPlaylistDTO` |
| PLAYLIST-GET-02 | Buscar playlist inexistente | `id: "non-existent"` | Lança `NotFoundError` |
| PLAYLIST-GET-03 | Buscar playlist de outro usuário | `userId` diferente do owner | Lança `NotFoundError` |

### 3.5 `getPlaylistWithMusics(userId: string, id: string)`

| ID | Cenário | Entrada | Resultado Esperado |
|----|---------|---------|-------------------|
| PLAYLIST-MUSICS-01 | Buscar playlist com músicas | Playlist com músicas adicionadas | Retorna `PlaylistWithMusicsDTO` com array de músicas |
| PLAYLIST-MUSICS-02 | Buscar playlist sem músicas | Playlist vazia | Retorna playlist com array `musics: []` |
| PLAYLIST-MUSICS-03 | Buscar playlist inexistente | `id: "non-existent"` | Lança `NotFoundError` |

### 3.6 `getPlaylistsByUserId(userId: string)`

| ID | Cenário | Entrada | Resultado Esperado |
|----|---------|---------|-------------------|
| PLAYLIST-USER-01 | Listar playlists do usuário | Usuário com playlists | Retorna array de `UserPlaylistDTO[]` |
| PLAYLIST-USER-02 | Usuário sem playlists | Usuário sem playlists | Retorna array vazio `[]` |

### 3.7 `getPublicPlaylists()`

| ID | Cenário | Entrada | Resultado Esperado |
|----|---------|---------|-------------------|
| PLAYLIST-PUBLIC-01 | Listar playlists públicas | Existem playlists públicas | Retorna array de playlists públicas |
| PLAYLIST-PUBLIC-02 | Sem playlists públicas | Todas privadas | Retorna array vazio `[]` |

### 3.8 `addMusicToPlaylist(userId: string, playlistId: string, musicData: AddMusicToPlaylistDTO)`

| ID | Cenário | Entrada | Resultado Esperado |
|----|---------|---------|-------------------|
| PLAYLIST-ADD-01 | Adicionar música nova | `{ externalId: "spotify-id-123" }` | Retorna `true` |
| PLAYLIST-ADD-02 | Adicionar música duplicada | Música já existe na playlist | Lança `BadRequestError` |
| PLAYLIST-ADD-03 | Adicionar em playlist inexistente | `playlistId: "non-existent"` | Lança `NotFoundError` |
| PLAYLIST-ADD-04 | Adicionar em playlist de outro usuário | `userId` diferente do owner | Lança `NotFoundError` |

### 3.9 `removeMusicFromPlaylist(userId: string, playlistId: string, musicId: string)`

| ID | Cenário | Entrada | Resultado Esperado |
|----|---------|---------|-------------------|
| PLAYLIST-REM-01 | Remover música existente | Música está na playlist | Retorna `true` |
| PLAYLIST-REM-02 | Remover música inexistente | Música não está na playlist | Lança `BadRequestError` |
| PLAYLIST-REM-03 | Remover de playlist inexistente | `playlistId: "non-existent"` | Lança `NotFoundError` |

### 3.10 `getPlaylistMusics(userId: string, playlistId: string)`

| ID | Cenário | Entrada | Resultado Esperado |
|----|---------|---------|-------------------|
| PLAYLIST-GETM-01 | Listar músicas da playlist | Playlist com músicas | Retorna array de `MusicDTO[]` |
| PLAYLIST-GETM-02 | Playlist vazia | Playlist sem músicas | Retorna array vazio `[]` |
| PLAYLIST-GETM-03 | Playlist inexistente | `playlistId: "non-existent"` | Lança `NotFoundError` |

### 3.11 `validatePlaylistOwnership(playlistId: string, userId: string)`

| ID | Cenário | Entrada | Resultado Esperado |
|----|---------|---------|-------------------|
| PLAYLIST-OWN-01 | Usuário é dono da playlist | userId = owner | Retorna `true` |
| PLAYLIST-OWN-02 | Usuário não é dono | userId != owner | Retorna `false` |
| PLAYLIST-OWN-03 | Playlist inexistente | `playlistId: "non-existent"` | Retorna `false` |

### 3.12 `canAccessPlaylist(playlistId: string, userId?: string)`

| ID | Cenário | Entrada | Resultado Esperado |
|----|---------|---------|-------------------|
| PLAYLIST-ACC-01 | Playlist pública, sem userId | Playlist pública | Retorna `true` |
| PLAYLIST-ACC-02 | Playlist privada, sem userId | Playlist privada | Retorna `false` |
| PLAYLIST-ACC-03 | Playlist privada, userId = owner | Owner tenta acessar | Retorna `true` |
| PLAYLIST-ACC-04 | Playlist privada, userId != owner | Outro usuário tenta acessar | Retorna `false` |

---

## 4. AIPlaylistService

### 4.1 `generatePlaylist(data: GeneratePlaylistDTO)`

| ID | Cenário | Entrada | Resultado Esperado |
|----|---------|---------|-------------------|
| AI-GEN-01 | Gerar playlist com tracks válidas | `{ seedTracks: [{ name: "Song", artist: "Artist" }], limit: 10 }` | Retorna `GeneratedPlaylist` com tracks validadas |
| AI-GEN-02 | Todas sugestões válidas no Spotify | AI retorna 10 músicas, todas existem | `stats.found === 10`, `stats.notFound === 0` |
| AI-GEN-03 | Algumas sugestões inválidas | AI retorna 10 músicas, 3 não existem no Spotify | `stats.found === 7`, `stats.notFound === 3` |
| AI-GEN-04 | Nenhuma sugestão válida | Nenhuma música encontrada no Spotify | `generatedTracks: []`, `invalidSuggestions` com todas |
| AI-GEN-05 | Limite de tracks respeitado | `limit: 5` | Máximo 5 tracks retornadas |
| AI-GEN-06 | Evita tracks duplicadas | AI sugere mesma música 2x | Apenas 1 track na lista final |
| AI-GEN-07 | Mensagem da AI é retornada | - | Campo `message` contém texto da AI |
| AI-GEN-08 | Erro na API Gemini | Gemini falha | Propaga o erro |
| AI-GEN-09 | Erro parcial no Spotify | Algumas buscas falham | Continua com tracks válidas, adiciona falhas em `invalidSuggestions` |

---

## 5. SpotifyService

### 5.1 `searchTracks(data: SearchTracksDTO)`

| ID | Cenário | Entrada | Resultado Esperado |
|----|---------|---------|-------------------|
| SPOTIFY-SEARCH-01 | Busca com resultados | `{ query: "Bohemian Rhapsody", limit: 5 }` | Retorna array de `TrackDTO[]` |
| SPOTIFY-SEARCH-02 | Busca sem resultados | `{ query: "xyzabc123nonexistent" }` | Retorna array vazio `[]` |
| SPOTIFY-SEARCH-03 | Limite padrão aplicado | `{ query: "Queen" }` (sem limit) | Usa limit = 10 |
| SPOTIFY-SEARCH-04 | Limite customizado | `{ query: "Queen", limit: 3 }` | Retorna máximo 3 tracks |

### 5.2 `getTrack(trackId: string)`

| ID | Cenário | Entrada | Resultado Esperado |
|----|---------|---------|-------------------|
| SPOTIFY-GET-01 | Track existente | `trackId: "valid-spotify-id"` | Retorna `TrackDTO` |
| SPOTIFY-GET-02 | Track inexistente | `trackId: "invalid-id"` | Retorna `null` |
| SPOTIFY-GET-03 | ID vazio | `trackId: ""` | Retorna `null` ou lança erro |

### 5.3 `validateTracks(data: ValidateTracksDTO)`

| ID | Cenário | Entrada | Resultado Esperado |
|----|---------|---------|-------------------|
| SPOTIFY-VAL-01 | Todas tracks válidas | `{ trackIds: ["id1", "id2"] }` | `valid: [2 tracks]`, `invalidIds: []` |
| SPOTIFY-VAL-02 | Algumas tracks inválidas | `{ trackIds: ["id1", "invalid"] }` | `valid: [1 track]`, `invalidIds: ["invalid"]` |
| SPOTIFY-VAL-03 | Todas tracks inválidas | `{ trackIds: ["invalid1", "invalid2"] }` | `valid: []`, `invalidIds: ["invalid1", "invalid2"]` |
| SPOTIFY-VAL-04 | Limite de 50 tracks | `{ trackIds: [51 ids] }` | Processa apenas os primeiros 50 |

### 5.4 `getRecommendations(data: GetRecommendationsDTO)`

| ID | Cenário | Entrada | Resultado Esperado |
|----|---------|---------|-------------------|
| SPOTIFY-REC-01 | Recomendações com seeds válidos | `{ seedTrackIds: ["id1", "id2"], limit: 10 }` | Retorna array de `TrackDTO[]` |
| SPOTIFY-REC-02 | Limite de 5 seeds | `{ seedTrackIds: [7 ids] }` | Usa apenas os 5 primeiros seeds |
| SPOTIFY-REC-03 | Limite padrão de resultados | `{ seedTrackIds: ["id1"] }` (sem limit) | Usa limit = 20 |
| SPOTIFY-REC-04 | Limite customizado | `{ seedTrackIds: ["id1"], limit: 5 }` | Retorna máximo 5 recomendações |

---

## 6. FollowService

### 6.1 `create(followerId: string, followedId: string)`

| ID | Cenário | Entrada | Resultado Esperado |
|----|---------|---------|-------------------|
| FOLLOW-CREATE-01 | Criar follow válido | IDs de usuários existentes | Retorna `FollowDto` |
| FOLLOW-CREATE-02 | Follower inexistente | `followerId: "non-existent"` | Lança `ApiError(FOLLOWER_NOT_FOUND)` |
| FOLLOW-CREATE-03 | Followed inexistente | `followedId: "non-existent"` | Lança `ApiError(FOLLOWED_NOT_FOUND)` |

### 6.2 `findAllUserFollowers(userId: string)`

| ID | Cenário | Entrada | Resultado Esperado |
|----|---------|---------|-------------------|
| FOLLOW-LIST-01 | Usuário com seguidores | Usuário com follows | Retorna array de `FollowDto[]` |
| FOLLOW-LIST-02 | Usuário sem seguidores | Usuário sem follows | Retorna array vazio `[]` |

### 6.3 `deleteFollowByFollowerAndFollowedId(followerId: string, followedId: string)`

| ID | Cenário | Entrada | Resultado Esperado |
|----|---------|---------|-------------------|
| FOLLOW-DEL-01 | Deletar follow existente | Follow existe | Executa sem erro |
| FOLLOW-DEL-02 | Deletar follow inexistente | Follow não existe | Lança `ApiError(FOLLOW_NOT_FOUND)` |

---

## 7. FollowRequestService

### 7.1 `requestToFollowUser(followerId: string, followedUserEmail: string)`

| ID | Cenário | Entrada | Resultado Esperado |
|----|---------|---------|-------------------|
| FR-CREATE-01 | Criar request para usuário público | Usuário destino é público | Retorna `FollowRequestDto` com status pending |
| FR-CREATE-02 | Usuário destino não encontrado | Email inexistente | Lança `ApiError(FOLLOW_REQUEST_PUBLIC_FOLLOWED_USER_NOT_FOUND)` |
| FR-CREATE-03 | Usuário destino é privado | Usuário com privacity = private | Lança `ApiError(FOLLOW_REQUEST_PUBLIC_FOLLOWED_USER_NOT_FOUND)` |
| FR-CREATE-04 | Tentar seguir a si mesmo | followerId = followedId | Lança `ApiError(FOLLOWER_ID_AND_FOLLOWED_ID_CAN_NOT_BE_EQUALS)` |
| FR-CREATE-05 | Já está seguindo | Follow já existe | Lança `ApiError(FOLLOW_ALREADY_EXISTS)` |
| FR-CREATE-06 | Request já pendente | FollowRequest pendente existe | Lança `ApiError(FOLLOW_REQUEST_ALREADY_EXISTS)` |

### 7.2 `findSentFollowRequests(userId: string)`

| ID | Cenário | Entrada | Resultado Esperado |
|----|---------|---------|-------------------|
| FR-SENT-01 | Usuário com requests enviados | Usuário enviou requests | Retorna array de `FollowRequestDto[]` |
| FR-SENT-02 | Usuário sem requests enviados | Não enviou requests | Retorna array vazio `[]` |

### 7.3 `findReceivedFollowRequests(userId: string)`

| ID | Cenário | Entrada | Resultado Esperado |
|----|---------|---------|-------------------|
| FR-RECV-01 | Usuário com requests recebidos | Usuário recebeu requests | Retorna array de `FollowRequestDto[]` |
| FR-RECV-02 | Usuário sem requests recebidos | Não recebeu requests | Retorna array vazio `[]` |

### 7.4 `cancelFollowRequest(followRequestId: string, followerId: string)`

| ID | Cenário | Entrada | Resultado Esperado |
|----|---------|---------|-------------------|
| FR-CANCEL-01 | Cancelar request próprio pendente | Request pendente do usuário | Executa sem erro |
| FR-CANCEL-02 | Cancelar request de outro usuário | followerId != owner | Lança `ApiError(FOLLOW_REQUEST_NOT_FOUND)` |
| FR-CANCEL-03 | Cancelar request já processado | Status != pending | Lança `ApiError(FOLLOW_REQUEST_NOT_PENDING)` |

### 7.5 `processFollowRequest(followRequestId: string, followedId: string, action: FollowRequestProcessingAction)`

| ID | Cenário | Entrada | Resultado Esperado |
|----|---------|---------|-------------------|
| FR-PROC-01 | Aceitar request pendente | `action: ACCEPT` | Retorna request com status approved, cria Follow |
| FR-PROC-02 | Rejeitar request pendente | `action: REJECT` | Retorna request com status rejected |
| FR-PROC-03 | Processar request de outro usuário | followedId != owner | Lança `ApiError(FOLLOW_REQUEST_NOT_FOUND)` |
| FR-PROC-04 | Processar request já processado | Status != pending | Lança `ApiError(FOLLOW_REQUEST_NOT_PENDING)` |
| FR-PROC-05 | Aceitar cria relacionamento Follow | `action: ACCEPT` | Verifica que FollowService.create foi chamado |

---

## 8. PlaylistCommentService

### 8.1 `createComment(userId: string, playlistId: string, data: CreatePlaylistCommentDTO)`

| ID | Cenário | Entrada | Resultado Esperado |
|----|---------|---------|-------------------|
| COMMENT-CREATE-01 | Criar comentário válido | `{ content: "Great playlist!" }` | Retorna `PlaylistCommentDTO` |
| COMMENT-CREATE-02 | Playlist não existe | `playlistId: "non-existent"` | Lança `NotFoundError` |

### 8.2 `updateComment(userId: string, id: string, data: UpdatePlaylistCommentDTO)`

| ID | Cenário | Entrada | Resultado Esperado |
|----|---------|---------|-------------------|
| COMMENT-UPD-01 | Atualizar próprio comentário | Owner edita | Retorna comentário atualizado |
| COMMENT-UPD-02 | Comentário não existe | `id: "non-existent"` | Lança `NotFoundError` |
| COMMENT-UPD-03 | Editar comentário de outro usuário | userId != owner | Lança `ForbiddenError` |

### 8.3 `deleteComment(userId: string, id: string)`

| ID | Cenário | Entrada | Resultado Esperado |
|----|---------|---------|-------------------|
| COMMENT-DEL-01 | Deletar próprio comentário | Owner deleta | Retorna `true` |
| COMMENT-DEL-02 | Comentário não existe | `id: "non-existent"` | Lança `NotFoundError` |
| COMMENT-DEL-03 | Deletar comentário de outro usuário | userId != owner | Lança `ForbiddenError` |

### 8.4 `getCommentById(id: string)`

| ID | Cenário | Entrada | Resultado Esperado |
|----|---------|---------|-------------------|
| COMMENT-GET-01 | Buscar comentário existente | ID válido | Retorna `PlaylistCommentWithUserDTO` |
| COMMENT-GET-02 | Comentário inexistente | `id: "non-existent"` | Retorna `null` |

### 8.5 `getCommentsByPlaylistId(playlistId: string)`

| ID | Cenário | Entrada | Resultado Esperado |
|----|---------|---------|-------------------|
| COMMENT-LIST-01 | Playlist com comentários | Playlist tem comentários | Retorna array de comentários |
| COMMENT-LIST-02 | Playlist sem comentários | Playlist vazia | Retorna array vazio `[]` |
| COMMENT-LIST-03 | Playlist não existe | `playlistId: "non-existent"` | Lança `NotFoundError` |

### 8.6 `getCommentsByUserId(userId: string)`

| ID | Cenário | Entrada | Resultado Esperado |
|----|---------|---------|-------------------|
| COMMENT-USER-01 | Usuário com comentários | Usuário fez comentários | Retorna array de `PlaylistCommentWithUserAndPlaylistDTO[]` |
| COMMENT-USER-02 | Usuário sem comentários | Usuário não comentou | Retorna array vazio `[]` |

### 8.7 `isCommentOwner(id: string, userId: string)`

| ID | Cenário | Entrada | Resultado Esperado |
|----|---------|---------|-------------------|
| COMMENT-OWN-01 | Usuário é dono do comentário | userId = owner | Retorna `true` |
| COMMENT-OWN-02 | Usuário não é dono | userId != owner | Retorna `false` |

---

## 🔧 Configuração de Mocks

Para cada service, os seguintes mocks devem ser configurados:

### Dependências a Mockar por Service

| Service | Dependências |
|---------|-------------|
| AuthService | `UserRepository`, `hashPassword`, `comparePassword`, `generateToken` |
| UserService | `UserRepository` |
| UserPlaylistService | `UserPlaylistRepository` |
| AIPlaylistService | `SpotifyService`, `generateMusicRecommendations` (Gemini) |
| SpotifyService | `spotifyFetch` |
| FollowService | `FollowRepository`, `UserService` |
| FollowRequestService | `FollowRequestRepository`, `UserService`, `FollowService` |
| PlaylistCommentService | `PlaylistCommentRepository`, `UserPlaylistRepository` |

---

## 📊 Resumo de Testes

| Service | Métodos | Total de Cenários |
|---------|---------|-------------------|
| AuthService | 2 | 9 |
| UserService | 5 | 16 |
| UserPlaylistService | 12 | 32 |
| AIPlaylistService | 1 | 9 |
| SpotifyService | 4 | 14 |
| FollowService | 3 | 7 |
| FollowRequestService | 5 | 17 |
| PlaylistCommentService | 7 | 15 |
| **Total** | **39** | **119** |

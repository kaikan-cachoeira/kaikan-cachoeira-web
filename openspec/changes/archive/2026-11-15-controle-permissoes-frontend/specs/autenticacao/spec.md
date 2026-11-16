# Spec Delta

## ADDED Requirements

### Requirement: Permissões do usuário publicadas para a interface

Ao estabelecer ou restaurar a sessão, o cliente SHALL publicar as permissões do usuário autenticado para a interface. Ao encerrar a sessão, por logout, expiração ou alteração em outra aba, o cliente SHALL remover as permissões publicadas, de modo que nenhuma tela continue exibindo ações permitidas ao usuário anterior.

#### Scenario: Login publica permissões

- **WHEN** o login responde com `usuario.permissoes`
- **THEN** a interface passa a considerar exatamente essas permissões nas verificações de acesso

#### Scenario: Restauração publica permissões

- **WHEN** a aplicação é recarregada com uma sessão persistida que contém as permissões do usuário
- **THEN** a interface restaura as mesmas permissões antes de renderizar as rotas protegidas

#### Scenario: Logout remove permissões

- **WHEN** o usuário encerra a sessão
- **THEN** nenhuma permissão permanece publicada para a interface

#### Scenario: Sessão alterada em outra aba

- **WHEN** outra aba encerra ou substitui a sessão
- **THEN** a interface desta aba passa a refletir as permissões da sessão resultante
- **AND** rotas que deixaram de ser permitidas passam a responder não encontrada

### Requirement: Sessão restaurada sem permissões é descartada

Quando a sessão persistida não contiver a lista de permissões do usuário — como em sessões gravadas antes desta capacidade — o cliente MUST NOT restaurá-la: SHALL descartar as credenciais e encaminhar o usuário ao login. Uma lista vazia SHALL ser considerada válida e MUST NOT provocar descarte.

#### Scenario: Sessão anterior à existência de permissões

- **WHEN** a aplicação é recarregada com uma sessão persistida cujo usuário não possui lista de permissões
- **THEN** o cliente descarta a sessão e as credenciais persistidas
- **AND** encaminha o usuário ao login

#### Scenario: Lista de permissões vazia

- **WHEN** a sessão persistida contém uma lista de permissões vazia
- **THEN** o cliente restaura a sessão normalmente
- **AND** o usuário permanece autenticado com acesso apenas às rotas que não exigem permissão

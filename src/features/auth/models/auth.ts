export interface Usuario {
  nome: string;
  cargo: string;
  permissoes: string[]
}

export interface Sessao {
  accessToken: string;
  refreshToken: string;
  usuario: Usuario;
}

export interface Credenciais {
  email: string;
  senha: string;
}

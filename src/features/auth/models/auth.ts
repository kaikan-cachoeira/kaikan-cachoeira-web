export interface Usuario {
  id?: string;
  name: string;
  email: string;
  initials?: string;
  accountLabel?: string;
  role?: string;
}

export interface Sessao {
  token: string;
  user: Usuario;
}

export interface Credenciais {
  email: string;
  password: string;
}

export interface RedefinirSenhaPayload {
  token?: string;
  novaSenha: string;
}

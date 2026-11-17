export interface DadosPerfil {
  nome: string;
  email: string;
  telefone: string;
  dataNascimento: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  cargo: string;
}

export const DADOS_INICIAIS: DadosPerfil = {
  nome: "Administrador Demo",
  email: "demo@kaikan.org.br",
  telefone: "(11) 99999-9999",
  dataNascimento: "1995-06-15",
  endereco: "Rua das Flores, 120",
  cidade: "São Paulo",
  estado: "SP",
  cep: "01000-000",
  cargo: "Administrador",
};

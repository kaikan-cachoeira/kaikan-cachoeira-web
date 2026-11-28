export interface ClimaHora {
  dataHoraPrevista: string;
  temperatura: number;
  sensacaoTermica: number;
  chuvaMm: number;
  probabilidadeChuva: number;
  ventoVelocidade: number;
  codigoClima: number;
  descricaoClima: string;
}

export interface ResumoClimatico {
  temperaturaMedia: number;
  temperaturaMinima: number;
  temperaturaMaxima: number;
  chuvaAcumulada: number;
  ventoMaximo: number;
}

export interface ClimaEventoResponse {
  resumo: ResumoClimatico;
  itens: ClimaHora[];
}

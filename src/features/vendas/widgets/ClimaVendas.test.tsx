import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ClimaEventoResponse, Evento } from "@/features/eventos";
import { PermissoesProvider } from "@/shared/permissoes/PermissoesProvider";
import { useClimaVendas } from "../hooks/useClimaVendas";
import ClimaVendas from "./ClimaVendas";

vi.mock("../hooks/useClimaVendas", () => ({ useClimaVendas: vi.fn() }));

const evento: Evento = {
  id: 1, nome: "Evento de teste", tipoEvento: "EVENTO",
  status: { id: 2, codigo: "EM_ANDAMENTO", descricao: "Em andamento" },
  dataHoraInicio: "2026-11-21T17:00:00Z",
  dataHoraEncerramento: "2026-11-21T20:00:00Z",
};
const dados: ClimaEventoResponse = {
  resumo: {
    temperaturaMedia: 24, temperaturaMinima: 22, temperaturaMaxima: 27,
    chuvaAcumulada: 3.2, ventoMaximo: 18,
  },
  itens: [{
    dataHoraPrevista: "2026-11-21T17:00:00Z", temperatura: 26,
    sensacaoTermica: 27, chuvaMm: 0.4, probabilidadeChuva: 65,
    ventoVelocidade: 18, codigoClima: 61, descricaoClima: "Chuva fraca",
  }],
};

function preparar({
  clima = dados,
  carregando = false,
  erroClima = false,
  erroVendas = false,
} = {}) {
  vi.mocked(useClimaVendas).mockReturnValue({
    climaQuery: { data: carregando ? undefined : clima, isError: erroClima },
    vendasQuery: { isError: erroVendas },
    pontos: [{ dataHora: "2026-11-21T17:00:00.000Z", quantidadeVendas: 2, clima: dados.itens[0] }],
  } as ReturnType<typeof useClimaVendas>);
}

function renderizar(permissoes = ["EVENTOS_MENU", "RELATORIOS_MENU"], tipoEvento = evento.tipoEvento) {
  return renderToStaticMarkup(
    <PermissoesProvider permissoes={permissoes}>
      <ClimaVendas evento={{ ...evento, tipoEvento }} />
    </PermissoesProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  preparar();
});

describe("seção Clima x Vendas", () => {
  it("oculta a seção e não monta a consulta sem RELATORIOS_MENU", () => {
    expect(renderizar(["EVENTOS_MENU"])).toBe("");
    expect(useClimaVendas).not.toHaveBeenCalled();
  });

  it("não mostra clima para reuniões", () => {
    expect(renderizar(undefined, "REUNIAO")).toBe("");
    expect(useClimaVendas).not.toHaveBeenCalled();
  });

  it("mostra o gráfico e os cinco indicadores com suas unidades", () => {
    const html = renderizar();
    for (const texto of ["Clima x Vendas", "Temperatura média", "Temperatura mínima", "Temperatura máxima", "Chuva acumulada", "Vento máximo", "3,2 mm", "18 km/h"]) {
      expect(html).toContain(texto);
    }
    expect(html).toContain("Temperatura prevista (°C)");
    expect(html).not.toContain("Tentar novamente");
    expect(html).not.toContain("<form");
  });

  it("apresenta o carregamento antes de receber o clima", () => {
    preparar({ carregando: true });
    expect(renderizar()).toContain("Carregando clima do evento...");
  });

  it("exibe o erro climático sem botão de sincronização", () => {
    preparar({ erroClima: true });
    const html = renderizar();
    expect(html).toContain("Não foi possível carregar o clima do evento.");
    expect(html).not.toContain("Tentar novamente");
  });

  it("mantém o estado vazio sem apresentar temperaturas zero", () => {
    preparar({ clima: { ...dados, itens: [] } });
    const html = renderizar();
    expect(html).toContain("Ainda não há dados climáticos para este evento.");
    expect(html).not.toContain("Temperatura média");
  });

  it("mantém os indicadores de clima quando a consulta das vendas falha", () => {
    preparar({ erroVendas: true });
    const html = renderizar();
    expect(html).toContain("Não foi possível carregar as vendas para comparar com o clima.");
    expect(html).toContain("Temperatura média");
    expect(html).toContain("24 °C");
  });
});

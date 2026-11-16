import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PERMISSOES } from "./permissoes";
import Permissao from "./Permissao";
import { PermissoesProvider } from "./PermissoesProvider";

function renderizar(permissoes: string[], precisa: (typeof PERMISSOES)[keyof typeof PERMISSOES]) {
  return renderToStaticMarkup(
    <PermissoesProvider permissoes={permissoes}>
      <Permissao precisa={precisa}>
        <span>conteúdo protegido</span>
      </Permissao>
    </PermissoesProvider>,
  );
}

describe("Permissao", () => {
  it("renderiza os filhos quando a permissão está presente", () => {
    expect(renderizar(["CAIXA_MENU"], PERMISSOES.caixaMenu)).toBe(
      "<span>conteúdo protegido</span>",
    );
  });

  it("não renderiza os filhos quando a permissão está ausente", () => {
    expect(renderizar(["VENDAS_MENU"], PERMISSOES.caixaMenu)).toBe("");
  });

  it("não renderiza os filhos com lista vazia", () => {
    expect(renderizar([], PERMISSOES.eventosMenu)).toBe("");
  });
});

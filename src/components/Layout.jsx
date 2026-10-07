import Sidebar from "./Sidebar.jsx";
import Cabecalho from "./Cabecalho.jsx";

// Estrutura padrão das telas internas: menu + cabeçalho + conteúdo
function Layout({ titulo, children }) {
  return (
    <div className="layout">
      <Sidebar />

      <div className="layout-direita">
        <Cabecalho titulo={titulo} />
        <main className="layout-conteudo">{children}</main>
      </div>
    </div>
  );
}

export default Layout;

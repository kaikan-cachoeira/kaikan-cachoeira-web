import { NavLink } from "react-router-dom";
import Logo from "./Logo.jsx";
import { menu, usuario } from "../data/dados.js";


function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-topo">
        <Logo />
      </div>

      <nav className="sidebar-menu">
        {menu.map((item) => {
          const Icone = item.icone;
          return (
            <NavLink
              key={item.texto}
              to={item.caminho}
              className={({ isActive }) =>
                isActive ? "menu-item menu-item-ativo" : "menu-item"
              }
            >
              <Icone size={16} />
              <span>{item.texto}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-rodape">
        <div className="sidebar-usuario">
      
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;

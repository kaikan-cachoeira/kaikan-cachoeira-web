import Layout from "../components/Layout.jsx";
import EventoAtual from "../components/EventoAtual.jsx";
import CardAtalho from "../components/CardAtalho.jsx";
import CardEstatistica from "../components/CardEstatistica.jsx";
import { usuario, atalhos, estatisticas, eventoAtual } from "../data/dados.js";

function Home() {
  const hoje = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Layout titulo="Início">
      <div className="home">
        <h2 className="home-ola">Olá, {usuario.primeiroNome}!</h2>
        <p className="home-data">{hoje}</p>

        <EventoAtual nome={eventoAtual.nome} inicio={eventoAtual.inicio} />

        <div className="home-grade-cards">
          {atalhos.map((item) => (
            <CardAtalho
              key={item.titulo}
              titulo={item.titulo}
              descricao={item.descricao}
              icone={item.icone}
              cor={item.cor}
              caminho={item.caminho}
            />
          ))}
        </div>

      </div>
    </Layout>
  );
}

export default Home;



import {
  House,
  Calendar,
  Package,
  Heart,
  ChartColumn,
  Users,
  User,
  CircleDollarSign,
} from "lucide-react";

export const usuario = {
  nome: "Ana Kimura",
  primeiroNome: "Ana",
  iniciais: "AN",
  email: "ana.kimura@kaikan.org.br",
};

export const menu = [
  { texto: "Início", caminho: "/inicio", icone: House },
  { texto: "Eventos", caminho: "/eventos", icone: Calendar },
  { texto: "Estoque", caminho: "/estoque", icone: Package },
  { texto: "Doações", caminho: "/doacoes", icone: Heart },
  { texto: "Financeiro", caminho: "/financeiro", icone: CircleDollarSign },
];

export const atalhos = [
  {
    titulo: "Estoque",
    descricao: "Gerencie produtos, movimentações e controle de inventário",
    icone: Package,
    cor: "verde",
    caminho: "/estoque",
  },
  {
    titulo: "Eventos",
    descricao: "Crie e gerencie eventos, produtos vinculados e vendas",
    icone: Calendar,
    cor: "vermelho",
    caminho: "/eventos",
  },
  {
    titulo: "Doações",
    descricao: "Registre doações em dinheiro e produtos da comunidade",
    icone: Heart,
    cor: "azul",
    caminho: "/doacoes",
  },
  {
    titulo: "Painel de controle",
    descricao: "Visualize indicadores, rankings e análises de desempenho",
    icone: ChartColumn,
    cor: "verde",
    caminho: "/painel",
  },
  {
    titulo: "Operadores",
    descricao: "Administre usuários, permissões e cargos do sistema",
    icone: Users,
    cor: "vermelho",
    caminho: "/operadores",
  },
  {
    titulo: "Associados",
    descricao: "Cadastro de associados, dependentes e controle de anuidades",
    icone: User,
    cor: "azul",
    caminho: "/associados",
  },
];

export const estatisticas = [
  { valor: "3", titulo: "Eventos este ano", detalhe: "1 em andamento" },
  { valor: "11", titulo: "Produtos no estoque", detalhe: "2 insumos" },
  { valor: "R$ 1.950", titulo: "Total de doações", detalhe: "5 registros" },
  { valor: "6", titulo: "Associados", detalhe: "4 titulares" },
];

export const eventoAtual = {
  nome: "Undokai 2024",
  inicio: "10/08, 09:00",
};

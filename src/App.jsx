import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout/AppLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import LoginPage from "./pages/auth/LoginPage";
import RecoverPage from "./pages/auth/RecoverPage";
import RecoverConfirmationPage from "./pages/auth/RecoverConfirmationPage";
import HomePage from "./pages/home/HomePage";
import InventoryPage from "./pages/inventory/InventoryPage";
import DonationsPage from "./pages/donations/DonationsPage";
import EventsPage from "./pages/events/EventsPage";
import EventDetailsPage from "./pages/events/EventDetailsPage";
import EventMenuPage from "./pages/events/EventMenuPage";
import EventSalesPage from "./pages/events/EventSalesPage";
import SalesPage from "./pages/sales/SalesPage";
import SalesHistoryPage from "./pages/sales/SalesHistoryPage";
import CashPage from "./pages/cash/CashPage";
import FiadosPage from "./pages/cash/FiadosPage";
import PendingPage from "./pages/pending/PendingPage";
import NotFoundPage from "./pages/pending/NotFoundPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/recuperar-senha" element={<RecoverPage />} />
      <Route
        path="/confirmacao-recuperacao"
        element={<RecoverConfirmationPage />}
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/inicio" replace />} />
          <Route path="/inicio" element={<HomePage />} />
          <Route path="/estoque" element={<InventoryPage />} />
          <Route path="/doacoes" element={<DonationsPage />} />
          <Route path="/eventos" element={<EventsPage />} />
          <Route path="/eventos/:id" element={<EventDetailsPage />} />
          <Route path="/eventos/:id/cardapio" element={<EventMenuPage />} />
          <Route path="/eventos/:id/vendas" element={<EventSalesPage />} />
          <Route path="/registro-vendas" element={<SalesPage />} />
          <Route
            path="/registro-vendas/historico"
            element={<SalesHistoryPage />}
          />
          <Route path="/caixa" element={<CashPage />} />
          <Route path="/caixa/fiado" element={<CashPage />} />
          <Route path="/caixa/fiados" element={<FiadosPage />} />
          <Route
            path="/em-definicao/:slug"
            element={<PendingPage />}
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

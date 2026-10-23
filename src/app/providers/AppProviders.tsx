import type { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/features/auth";
import { ToastProvider } from "@/shared/components/Toast/ToastProvider";
import { VendaProvider } from "@/features/vendas";
import { QueryProvider } from "./QueryProvider";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryProvider>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <VendaProvider>{children}</VendaProvider>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryProvider>
  );
}

import type { Metadata } from "next";

import { ClientsView } from "@/components/clients/clients-view";

export const metadata: Metadata = {
  title: "Clientes",
  description: "Gerencie os clientes da sua barbearia.",
};

export default function ClientsPage() {
  return <ClientsView />;
}

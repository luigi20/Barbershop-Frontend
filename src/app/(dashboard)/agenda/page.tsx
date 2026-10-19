import type { Metadata } from "next";

import { AgendaAccess } from "@/components/appointments/agenda-access";

export const metadata: Metadata = {
  title: "Agenda",
};

export default function AgendaPage() {
  return <AgendaAccess />;
}

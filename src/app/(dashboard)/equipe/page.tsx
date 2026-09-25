import type { Metadata } from "next";

import { MembersView } from "@/components/members/members-view";

export const metadata: Metadata = {
  title: "Equipe",
  description: "Consulte os membros da sua equipe no BarberPro.",
};

export default function MembersPage() {
  return <MembersView />;
}

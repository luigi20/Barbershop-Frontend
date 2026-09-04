import type { Metadata } from "next";

import { ProfileView } from "@/components/profile/profile-view";

export const metadata: Metadata = {
  title: "Meu perfil",
  description: "Consulte seus dados pessoais no BarberPro.",
};

export default function ProfilePage() {
  return <ProfileView />;
}

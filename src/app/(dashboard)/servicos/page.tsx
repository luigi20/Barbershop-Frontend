import type { Metadata } from "next";

import { ServicesView } from "@/components/services/services-view";

export const metadata: Metadata = {
  title: "Serviços",
};

export default function ServicesPage() {
  return <ServicesView />;
}

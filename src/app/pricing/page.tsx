import type { Metadata } from "next";
import { PricingPage } from "./components/PricingPage";

export const metadata: Metadata = {
  title: "Pricing - Nano Banana",
  description:
    "Choose the perfect Nano Banana plan for your needs. Flexible pricing for individuals and teams. Start editing with AI today.",
};

export default function Pricing() {
  return <PricingPage />;
}

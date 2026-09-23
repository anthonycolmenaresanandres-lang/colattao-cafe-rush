import type { Metadata } from "next";
import StarterDemo from "@/components/demo/StarterDemo";

export const metadata: Metadata = {
  title: "Try your menu | Colattao Starter demo",
  description: "Personalize a fictional menu preview. No account or payment required.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/demo" },
};

export default function DemoPage() {
  return <StarterDemo />;
}

import type { Metadata } from "next";
import OpsBoard from "./OpsBoard";

// Internal owner board (PIN-gated): full money detail, staff pay, risks.
export const metadata: Metadata = {
  title: "Colattao Market — Internal Board",
  robots: { index: false, follow: false },
};

export default function MarketOpsPage() {
  return <OpsBoard />;
}

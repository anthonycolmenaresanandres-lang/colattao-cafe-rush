import SiteTemplate from "@/components/template/SiteTemplate";
import colattaoGoConfig from "@/config/templates/colattao-go";

export const metadata = {
  title: "Colattao Go · R&D template demo",
  description: "Internal template demo.",
  // Internal only.
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function ColattaoGoPage() {
  return <SiteTemplate config={colattaoGoConfig} />;
}

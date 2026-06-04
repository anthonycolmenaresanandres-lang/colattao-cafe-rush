/**
 * new-client.ts — scaffold a new white-label storefront client.
 *
 * Usage:
 *   npm run new-client -- --slug acme-coffee --domain getacme.com --name "Acme Coffee" --city "Norfolk" --region VA
 *
 * What this script DOES (safe, local, idempotent-ish):
 *   1. Creates src/clients/<slug>/site.config.ts from the template
 *   2. Creates src/clients/<slug>/assets/ and a menu stub
 *   3. Prints the registry entry to paste into CLONE_CONTROL
 *   4. Prints the exact machine + human steps that remain
 *
 * What this script does NOT do (on purpose — these are live infra / human-gated):
 *   - It does not register the domain (Cloudflare — billing + human confirm)
 *   - It does not create the Vercel project or set DNS (needs API tokens)
 *   - It does not touch Google Search Console or Business Profile
 *   Those are printed as a checklist so a human runs them deliberately.
 */

import { mkdir, writeFile, readFile, access } from "node:fs/promises";
import { join } from "node:path";

interface Args {
  slug?: string;
  domain?: string;
  name?: string;
  city?: string;
  region?: string;
}

function parseArgs(): Args {
  const argv = process.argv.slice(2);
  const out: Args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    const val = argv[i + 1];
    if (key === "--slug") out.slug = val;
    if (key === "--domain") out.domain = val;
    if (key === "--name") out.name = val;
    if (key === "--city") out.city = val;
    if (key === "--region") out.region = val;
  }
  return out;
}

function siteConfigTemplate(a: Required<Pick<Args, "slug" | "domain" | "name" | "city" | "region">>) {
  const siteUrl = `https://${a.domain.replace(/^https?:\/\//, "").replace(/\/$/, "")}`;
  return `import type { ClientSite } from "@/config/client-types";

const ${camel(a.slug)}: ClientSite = {
  slug: "${a.slug}",
  defaultSiteUrl: "${siteUrl}",
  name: ${JSON.stringify(a.name)},
  tagline: "Digital Menu",
  locality: ${JSON.stringify(a.city)},
  region: ${JSON.stringify(a.region)},
  country: "US",
  brandLinks: {
    website: "",
    instagram: "",
  },
  googleSiteVerification: "",
};

export default ${camel(a.slug)};
`;
}

function menuStubTemplate() {
  return `// Menu data for this client. Replace with the client's VERIFIED items + prices.
// Accuracy is a human sign-off gate before go-live.
import type { MenuCategory } from "@/data/colattaoMenu";

export const menuCategories: MenuCategory[] = [
  {
    id: "espresso",
    title: "Espresso & Coffee",
    items: [{ name: "House Brew", price: null, needsConfirmation: true }],
  },
];
`;
}

function camel(slug: string) {
  return slug.replace(/[-_]([a-z])/g, (_, c) => c.toUpperCase()).replace(/[^a-zA-Z0-9]/g, "");
}

async function exists(path: string) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const a = parseArgs();
  if (!a.slug || !a.domain || !a.name || !a.city || !a.region) {
    console.error(
      "Usage: npm run new-client -- --slug <slug> --domain <domain> --name <name> --city <city> --region <region>",
    );
    process.exit(1);
  }

  const root = process.cwd();
  const clientDir = join(root, "src", "clients", a.slug);
  const configPath = join(clientDir, "site.config.ts");

  if (await exists(configPath)) {
    console.error(`Client "${a.slug}" already exists at ${configPath}. Aborting.`);
    process.exit(1);
  }

  await mkdir(join(clientDir, "assets"), { recursive: true });
  await writeFile(
    configPath,
    siteConfigTemplate({ slug: a.slug, domain: a.domain, name: a.name, city: a.city, region: a.region }),
    "utf8",
  );
  await writeFile(join(clientDir, "menu.ts"), menuStubTemplate(), "utf8");

  const siteUrl = `https://${a.domain.replace(/^https?:\/\//, "").replace(/\/$/, "")}`;

  // Registry entry the human pastes into CLONE_CONTROL/PROJECT_REGISTRY.json
  const registryEntry = {
    projectName: `storefront-${a.slug}`,
    projectType: "white-label-storefront",
    client: a.name,
    slug: a.slug,
    domain: a.domain,
    siteUrl,
    vercelProject: `storefront-${a.slug}`,
    status: "scaffolded",
    onboarding: {
      domainRegistered: false,
      dnsConnected: false,
      sslActive: false,
      gscVerified: false,
      sitemapSubmitted: false,
      gbpClaimed: false,
      napConsistent: false,
      menuVerifiedByClient: false,
      liveAt: null,
    },
  };

  console.log(`\n✓ Scaffolded client "${a.slug}"`);
  console.log(`  - ${configPath}`);
  console.log(`  - ${join(clientDir, "menu.ts")}`);
  console.log(`  - ${join(clientDir, "assets")}/`);

  console.log(`\n── Next: register in src/config/site.ts ──`);
  console.log(`  import ${camel(a.slug)} from "@/clients/${a.slug}/site.config";`);
  console.log(`  Add to CLIENTS: { colattao, ${camel(a.slug)} }`);

  console.log(`\n── Paste into CLONE_CONTROL/PROJECT_REGISTRY.json ──`);
  console.log(JSON.stringify(registryEntry, null, 2));

  console.log(`\n── MACHINE steps (run with tokens set) ──`);
  console.log(`  Cloudflare: register ${a.domain} (semi-manual) → DNS to Vercel`);
  console.log(`  vercel project add storefront-${a.slug}`);
  console.log(`  vercel env add CLIENT  → ${a.slug}`);
  console.log(`  vercel env add NEXT_PUBLIC_SITE_URL → ${siteUrl}`);
  console.log(`  vercel domains add ${a.domain} storefront-${a.slug}`);
  console.log(`  vercel deploy --prod`);
  console.log(`  GSC: submit ${siteUrl}/sitemap.xml`);

  console.log(`\n── HUMAN steps (no script can do these) ──`);
  console.log(`  [ ] Signed brand-use + domain-ownership agreement`);
  console.log(`  [ ] Collect + VERIFY menu items & prices with client`);
  console.log(`  [ ] Collect NAP (address, phone, hours), logo, colors, photos`);
  console.log(`  [ ] Google Search Console: add property + click Verify`);
  console.log(`  [ ] Google Business Profile: claim/verify, add website + menu link`);
  console.log(`  [ ] Go-live QA sign-off`);
  console.log("");
}

main().catch((err) => {
  console.error("[new-client] Fatal:", err instanceof Error ? err.message : err);
  process.exit(1);
});

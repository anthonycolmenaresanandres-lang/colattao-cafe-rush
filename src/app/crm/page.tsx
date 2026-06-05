import type { Metadata } from "next";
import {
  fetchLeads,
  fetchRequests,
  isRequestsDbEnabled,
  type LeadRecord,
  type RequestRecord,
} from "@/lib/supabaseServer";

// Internal sales dashboard — never index, always fresh (renders PII server-side).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Colattao CRM",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

// Brand palette
const ESPRESSO = "#1b0e08";
const CREAM = "#F8EDD7";
const GOLD = "#DAAE4F";

const LEAD_STATUS_COLORS: Record<string, string> = {
  new: "#6b7280",
  contacted: "#2563eb",
  demo: "#DAAE4F",
  won: "#15803d",
  lost: "#b91c1c",
};

const REQUEST_STATUS_COLORS: Record<string, string> = {
  open: "#DAAE4F",
  in_progress: "#2563eb",
  done: "#15803d",
};

function StatusChip({ value, colors }: { value: string; colors: Record<string, string> }) {
  const bg = colors[value] ?? "#6b7280";
  return (
    <span
      className="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize text-white"
      style={{ backgroundColor: bg }}
    >
      {value?.replace("_", " ") || "—"}
    </span>
  );
}

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen px-4 py-8 sm:px-8" style={{ backgroundColor: ESPRESSO, color: CREAM }}>
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-between border-b pb-4" style={{ borderColor: `${GOLD}33` }}>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: GOLD }}>
            Colattao CRM
          </h1>
          <span className="text-xs uppercase tracking-widest" style={{ color: `${CREAM}99` }}>
            Internal · Sales
          </span>
        </header>
        {children}
      </div>
    </main>
  );
}

function Locked({ message, showForm }: { message: string; showForm: boolean }) {
  return (
    <Shell>
      <div className="mx-auto max-w-sm rounded-2xl p-8 text-center" style={{ border: `1px solid ${GOLD}33` }}>
        <p className="mb-6 text-sm" style={{ color: `${CREAM}cc` }}>
          {message}
        </p>
        {showForm && (
          <form method="get" className="flex flex-col gap-3">
            <input
              type="password"
              name="code"
              placeholder="Access code"
              autoComplete="off"
              className="rounded-lg px-4 py-2 text-sm outline-none"
              style={{ backgroundColor: "#120a04", color: CREAM, border: `1px solid ${GOLD}44` }}
            />
            <button
              type="submit"
              className="rounded-lg px-4 py-2 text-sm font-semibold"
              style={{ background: `linear-gradient(135deg,${GOLD},#F8EDD7,${GOLD})`, color: "#1D1108" }}
            >
              Unlock
            </button>
          </form>
        )}
      </div>
    </Shell>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: `${GOLD}cc` }}>
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-3 py-2 align-top text-sm" style={{ color: CREAM }}>{children}</td>;
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold" style={{ color: CREAM }}>
        {title}
        <span className="rounded-full px-2 py-0.5 text-xs" style={{ backgroundColor: `${GOLD}22`, color: GOLD }}>
          {count}
        </span>
      </h2>
      <div className="overflow-x-auto rounded-xl" style={{ border: `1px solid ${GOLD}22` }}>
        {children}
      </div>
    </section>
  );
}

export default async function CrmPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const accessCode = process.env.CRM_ACCESS_CODE;
  const provided = (await searchParams)?.code;

  // Safe-by-default: no server-only access code configured => never show data.
  if (!accessCode) {
    return (
      <Locked
        showForm={false}
        message="CRM access is not configured. Set the CRM_ACCESS_CODE environment variable to enable the dashboard."
      />
    );
  }
  if (provided !== accessCode) {
    return <Locked showForm message="Enter the sales access code to view leads and requests." />;
  }

  if (!isRequestsDbEnabled()) {
    return (
      <Locked
        showForm={false}
        message="Database persistence is off. Set REQUESTS_DB_ENABLED=true with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to populate the CRM."
      />
    );
  }

  const [leads, requests]: [LeadRecord[], RequestRecord[]] = await Promise.all([
    fetchLeads(),
    fetchRequests(),
  ]);

  return (
    <Shell>
      <Section title="Leads" count={leads.length}>
        <table className="w-full border-collapse">
          <thead style={{ backgroundColor: "#120a04" }}>
            <tr>
              <Th>Café</Th>
              <Th>Contact</Th>
              <Th>Plan</Th>
              <Th>City</Th>
              <Th>Status</Th>
              <Th>Missing</Th>
              <Th>File</Th>
              <Th>Received</Th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 && (
              <tr>
                <Td>No leads yet.</Td>
              </tr>
            )}
            {leads.map((l) => (
              <tr key={l.id} style={{ borderTop: `1px solid ${GOLD}14` }}>
                <Td>{l.cafe_name}</Td>
                <Td>{l.contact || "—"}</Td>
                <Td>{l.plan_type || "—"}</Td>
                <Td>{l.city || "—"}</Td>
                <Td>
                  <StatusChip value={l.status} colors={LEAD_STATUS_COLORS} />
                </Td>
                <Td>
                  {l.missing_fields && l.missing_fields.length ? (
                    <span style={{ color: "#e8a366" }}>{l.missing_fields.length} item(s)</span>
                  ) : (
                    <span style={{ color: "#7bbf7b" }}>complete</span>
                  )}
                </Td>
                <Td>
                  {l.blob_url ? (
                    <a href={l.blob_url} style={{ color: GOLD, textDecoration: "underline" }}>
                      open
                    </a>
                  ) : (
                    "—"
                  )}
                </Td>
                <Td>{fmtDate(l.created_at)}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="Requests" count={requests.length}>
        <table className="w-full border-collapse">
          <thead style={{ backgroundColor: "#120a04" }}>
            <tr>
              <Th>Type</Th>
              <Th>Priority</Th>
              <Th>Status</Th>
              <Th>Message</Th>
              <Th>Contact</Th>
              <Th>File</Th>
              <Th>Received</Th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 && (
              <tr>
                <Td>No requests yet.</Td>
              </tr>
            )}
            {requests.map((r) => (
              <tr key={r.id} style={{ borderTop: `1px solid ${GOLD}14` }}>
                <Td>{r.request_type || "—"}</Td>
                <Td>{r.priority || "—"}</Td>
                <Td>
                  <StatusChip value={r.status} colors={REQUEST_STATUS_COLORS} />
                </Td>
                <Td>
                  <span className="line-clamp-2 block max-w-xs">{r.message || "—"}</span>
                </Td>
                <Td>{r.contact || "—"}</Td>
                <Td>
                  {r.blob_url ? (
                    <a href={r.blob_url} style={{ color: GOLD, textDecoration: "underline" }}>
                      open
                    </a>
                  ) : (
                    "—"
                  )}
                </Td>
                <Td>{fmtDate(r.created_at)}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
    </Shell>
  );
}

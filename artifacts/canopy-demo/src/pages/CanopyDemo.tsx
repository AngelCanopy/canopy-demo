import { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";

const GEO_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

/* ─── app flow ───────────────────────────────────────────────────────── */
type View = "signin" | "setup" | "restaurants" | "portfolio";

/* ─── types ──────────────────────────────────────────────────────────── */
interface PlaybookCard { text: string; accent: string; }
interface Location {
  id: string; name: string; city: string; state: string; cuisine: string;
  gm: string; regionalVp: string; status: "on" | "attn";
  coordinates: [number, number];
  sales: string; targetDelta: string; labor: string; laborTarget: string;
  covers: number; coversCap: number; summary: string;
  playbook: PlaybookCard[]; prompts: string[];
}
interface Integration { id: string; label: string; enabled: boolean; }
interface IntegrationGroup { category: string; items: Integration[]; }

/* brand metadata — Logo stored as component reference, not JSX element */
type BrandEntry = { color: string; description: string; Logo: () => JSX.Element };
const BRAND: Record<string, BrandEntry> = {
  toast:         { color: "#F94416", description: "Sales by daypart, covers, check average, and menu mix",           Logo: ToastLogo },
  square:        { color: "#1A1A1A", description: "Transactions, items sold, and location performance",               Logo: SquareLogo },
  clover:        { color: "#00A650", description: "POS data including sales trends and item performance",              Logo: CloverLogo },
  "7shifts":     { color: "#11B5E4", description: "Scheduled and actual labor, overtime, and labor by role",          Logo: SevenShiftsLogo },
  opentable:     { color: "#DA3743", description: "Booked covers, pacing, cancellations, and no-show rate",           Logo: OpenTableLogo },
  resy:          { color: "#1C1C1C", description: "Reservation demand, day-of cover flow, and pacing signals",        Logo: ResyLogo },
  marginedge:    { color: "#009448", description: "Vendor invoices, ingredient cost movement, and COGS trends",       Logo: MarginEdgeLogo },
  restaurant365: { color: "#1565C0", description: "Cost categories, margin pressure, and menu item exposure",         Logo: R365Logo },
  google:        { color: "#4285F4", description: "Review sentiment, dish mentions, and service feedback",             Logo: GoogleLogo },
};

/* ─── brand logo components ───────────────────────────────────────────── */
function LogoBox({ color, border, children }: { color: string; border?: string; children: React.ReactNode }) {
  return (
    <div style={{
      width: 40, height: 40, borderRadius: 10,
      background: color,
      border: border ?? "none",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0, overflow: "hidden",
    }}>
      {children}
    </div>
  );
}

/* ─── shared image helper: full-bleed square fills the 40×40 box ─────── */
function ImgIcon({ src, alt }: { src: string; alt: string }) {
  return <img src={src} alt={alt} width={40} height={40} style={{ display: "block", objectFit: "cover" }} />;
}
/* contained icon: sits on a white tile with padding */
function ImgContained({ src, alt, size = 26 }: { src: string; alt: string; size?: number }) {
  return <img src={src} alt={alt} width={size} height={size} style={{ display: "block", objectFit: "contain" }} />;
}

function ToastLogo() {
  /* Full-bleed square: orange bg + bread slice fills the whole box */
  return <LogoBox color="#FF4713"><ImgIcon src={`${import.meta.env.BASE_URL}icon-toast.png`} alt="Toast" /></LogoBox>;
}

function SquareLogo() {
  /* SVG: white square-in-square mark on black */
  return (
    <LogoBox color="#111111">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="3.5" stroke="white" strokeWidth="2.5"/>
        <rect x="7" y="7" width="10" height="10" rx="1.5" fill="white"/>
      </svg>
    </LogoBox>
  );
}

function CloverLogo() {
  /* White tile: the brand image already has white bg + green clover mark with padding */
  return (
    <LogoBox color="#FFFFFF" border="1px solid #E4E0D8">
      <ImgContained src={`${import.meta.env.BASE_URL}icon-clover.png`} alt="Clover" size={28} />
    </LogoBox>
  );
}

function SevenShiftsLogo() {
  /* SVG: dark tile, orange arc sweeps over bold white "7" */
  return (
    <LogoBox color="#111111">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M4 22 A12 12 0 1 1 24 22" stroke="#FF6808" strokeWidth="3" strokeLinecap="round"/>
        <text x="14" y="20" textAnchor="middle" dominantBaseline="auto"
          fontSize="15" fontWeight="900" fill="white"
          fontFamily="-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif">7</text>
      </svg>
    </LogoBox>
  );
}

function OpenTableLogo() {
  /* Full-bleed square: red tile, white dot·circle mark fills the box */
  return <LogoBox color="#E8002D"><ImgIcon src={`${import.meta.env.BASE_URL}icon-opentable.png`} alt="OpenTable" /></LogoBox>;
}

function ResyLogo() {
  /* Full-bleed square: red-orange tile fills the whole box */
  return <LogoBox color="#FF3C2F"><ImgIcon src={`${import.meta.env.BASE_URL}icon-resy.png`} alt="Resy" /></LogoBox>;
}

function MarginEdgeLogo() {
  /* White tile: wide wordmark — full-width, auto height so the aspect ratio is preserved */
  return (
    <LogoBox color="#FFFFFF" border="1px solid #E4E0D8">
      <img
        src={`${import.meta.env.BASE_URL}icon-marginedge.png`}
        alt="MarginEdge"
        style={{ display: "block", width: "100%", height: "auto" }}
      />
    </LogoBox>
  );
}

function R365Logo() {
  /* White tile: R365 apple-touch-icon contained */
  return (
    <LogoBox color="#FFFFFF" border="1px solid #E4E0D8">
      <ImgContained src={`${import.meta.env.BASE_URL}icon-r365.png`} alt="Restaurant365" size={30} />
    </LogoBox>
  );
}

function GoogleLogo() {
  /* White tile: official multicolor Google G */
  return (
    <LogoBox color="#FFFFFF" border="1px solid #E4E0D8">
      <svg width="24" height="24" viewBox="0 0 48 48">
        <path d="M43.6 20H24v8h11.1c-1 4-4 7-8.6 8.4v7h7.3C38.7 39 43.6 32.1 43.6 24c0-1.3-.1-2.7-.4-4z" fill="#4285F4"/>
        <path d="M24 44c6.5 0 12-2.2 16-5.9l-7.3-7C30.7 32.7 27.5 34 24 34c-5.4 0-10-3.6-11.7-8.6H4.7v7.2C8.7 40.1 15.8 44 24 44z" fill="#34A853"/>
        <path d="M12.3 25.4a12 12 0 0 1 0-7.8V10.4H4.7A20 20 0 0 0 4 24c0 3.2.8 6.3 2.1 9l6.2-7.6z" fill="#FBBC05"/>
        <path d="M24 12c3.3 0 6.2 1.1 8.5 3.3l6.4-6.4C34.8 5.3 29.7 4 24 4 15.8 4 8.7 7.9 4.7 14l7.6 5.4C14 14.9 18.6 12 24 12z" fill="#EA4335"/>
      </svg>
    </LogoBox>
  );
}


/* ─── Sleek toggle ────────────────────────────────────────────────────── */
function SleekToggle({ on, onClick }: { on: boolean; onClick: (e: React.MouseEvent) => void }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      style={{
        width: 44, height: 24, borderRadius: 12, padding: 0, border: "none",
        background: on ? C.forest : "#CCC9C0",
        cursor: "pointer", position: "relative", flexShrink: 0,
        transition: "background 0.22s ease",
        outline: "none",
      }}
    >
      <div style={{
        width: 18, height: 18, borderRadius: "50%", background: "#fff",
        position: "absolute", top: 3,
        left: on ? 23 : 3,
        transition: "left 0.22s ease",
        boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
      }} />
    </button>
  );
}

/* ─── palette ────────────────────────────────────────────────────────── */
const C = {
  bg:       "#F7F5F0",
  surface:  "#FFFFFF",
  border:   "#E4E0D8",
  borderLt: "#EDEBE5",
  text:     "#1A1917",
  muted:    "#8C887E",
  mutedLt:  "#B8B4AB",
  forest:   "#1C4A40",
  forestLt: "#EBF3F0",
  attn:     "#92600A",
  attnLt:   "#FDF0D5",
  mapLand:  "#E2DDD5",
  mapBdr:   "#CBC6BD",
  mapWater: "#EDEAE4",
};

const AG = "#B8935A";
const AT = "#1C4A40";
const AB = "#4A7BA8";

/* single font throughout */
const CG = "'Cormorant Garamond', Georgia, serif";
const f   = (extra?: React.CSSProperties): React.CSSProperties => ({ fontFamily: CG, ...extra });

/* ─── data ───────────────────────────────────────────────────────────── */
const LOCATIONS: Location[] = [
  {
    id: "oak", name: "Oak Collective", city: "San Francisco", state: "CA",
    cuisine: "New American", gm: "Priya Sharma", regionalVp: "Ryan O'Brien",
    status: "on", coordinates: [-122.4194, 37.7749],
    sales: "$3,120,000", targetDelta: "+4.0%", labor: "27.9%", laborTarget: "28.5%",
    covers: 245, coversCap: 260,
    summary: "Oak Collective is +4.0% ahead of plan. Tech sector hiring recovery is lifting Tue–Thu corporate covers. The SF Chronicle wine preview has elevated weekend demand.",
    playbook: [
      { text: "Chronicle recognition is a leverage moment — coordinate follow-up media with Priya this week.", accent: AG },
      { text: "Tech sector recovery is driving Tue–Thu corporate covers. Evaluate private dining minimums.", accent: AT },
      { text: "Oak is a model unit at +4% vs plan. Extract best practices for the rest of the portfolio.", accent: AB },
    ],
    prompts: ["How is the tech sector recovery showing up in covers?", "What's driving average check growth?", "What are the private dining opportunities?"],
  },
  {
    id: "marrow", name: "Marrow House", city: "Chicago", state: "IL",
    cuisine: "Modern American", gm: "Daniel Reyes", regionalVp: "Ryan O'Brien",
    status: "on", coordinates: [-87.6298, 41.8781],
    sales: "$2,840,000", targetDelta: "+1.8%", labor: "29.1%", laborTarget: "29.0%",
    covers: 218, coversCap: 240,
    summary: "Marrow House is tracking slightly ahead of plan. Strong weekend brunch performance is offsetting a softer midweek. Staffing stability is a competitive advantage heading into Q2.",
    playbook: [
      { text: "Weekend brunch is outperforming — evaluate a second seating to capture unmet demand.", accent: AG },
      { text: "Midweek covers are soft. Consider a limited prix-fixe to drive Tuesday traffic.", accent: AT },
      { text: "Labor is 10 bps over target. Review scheduling efficiency with Daniel before month-end.", accent: AB },
    ],
    prompts: ["What's driving the weekend brunch outperformance?", "How can we improve midweek cover counts?", "Where is the labor variance coming from?"],
  },
  {
    id: "cedar", name: "Cedar Room", city: "New York", state: "NY",
    cuisine: "Contemporary Coastal", gm: "Sophie Laurent", regionalVp: "Marcus Webb",
    status: "attn", coordinates: [-74.006, 40.7128],
    sales: "$2,560,000", targetDelta: "-2.1%", labor: "31.4%", laborTarget: "29.5%",
    covers: 190, coversCap: 250,
    summary: "Cedar Room is trailing plan by 2.1% with labor running 190 bps above target. Cover volume is below capacity — a combination of slower walk-in traffic and a reservation gap on Sundays.",
    playbook: [
      { text: "Sunday reservation gap is the primary revenue leak. Launch a targeted outreach campaign this week.", accent: AG },
      { text: "Labor at 31.4% requires immediate review. Sophie should audit Thursday and Friday scheduling.", accent: "#B84040" },
      { text: "Walk-in capture is low vs. comp set. Evaluate host greeting and wait-list strategy.", accent: AB },
    ],
    prompts: ["What's causing the Sunday reservation gap?", "How do we close the labor variance at Cedar Room?", "What's the comp set doing that we're not?"],
  },
  {
    id: "paloma", name: "Paloma Grill", city: "Houston", state: "TX",
    cuisine: "Mexican Contemporary", gm: "Carlos Vega", regionalVp: "Marcus Webb",
    status: "on", coordinates: [-95.3698, 29.7604],
    sales: "$2,990,000", targetDelta: "+2.6%", labor: "28.2%", laborTarget: "28.5%",
    covers: 232, coversCap: 245,
    summary: "Paloma Grill continues to outperform. Energy sector clients are driving private dining revenue. Labor is well-managed and Carlos has built a high-retention team heading into a strong spring season.",
    playbook: [
      { text: "Energy sector private dining is a standout driver — create a dedicated corporate program with Carlos.", accent: AG },
      { text: "Spring patio season opens in 3 weeks. Begin outdoor cover planning and staffing now.", accent: AT },
      { text: "Paloma is a talent pipeline model. Consider Carlos for regional leadership mentorship.", accent: AB },
    ],
    prompts: ["How much of Paloma's growth is energy sector driven?", "What's the private dining revenue mix?", "How is Carlos building team retention?"],
  },
  {
    id: "harbor", name: "Harbor Table", city: "Miami", state: "FL",
    cuisine: "Coastal Seafood", gm: "Natalie Cruz", regionalVp: "Marcus Webb",
    status: "on", coordinates: [-80.1918, 25.7617],
    sales: "$3,340,000", targetDelta: "+5.2%", labor: "27.1%", laborTarget: "28.0%",
    covers: 258, coversCap: 260,
    summary: "Harbor Table is the portfolio leader at +5.2% vs plan. Winter season tourism has driven record cover volume. Natalie's team is running lean on labor while maintaining strong guest scores.",
    playbook: [
      { text: "Harbor is at 99% capacity on peak nights — evaluate a soft cap lift or extended service window.", accent: AG },
      { text: "Winter tourism tailwind will soften in May. Begin building a local repeat-guest strategy now.", accent: AT },
      { text: "Labor efficiency at 27.1% is the best in portfolio — document Natalie's scheduling approach for replication.", accent: AB },
    ],
    prompts: ["How much of Harbor's success is seasonal vs. structural?", "What's driving guest score performance?", "How do we maintain momentum heading into summer?"],
  },
];

const INIT_GROUPS: IntegrationGroup[] = [
  {
    category: "Point of Sale",
    items: [
      { id: "toast",  label: "Toast",  enabled: true  },
      { id: "square", label: "Square", enabled: false },
      { id: "clover", label: "Clover", enabled: false },
    ],
  },
  {
    category: "Labor",
    items: [
      { id: "7shifts", label: "7shifts", enabled: false },
    ],
  },
  {
    category: "Reservations",
    items: [
      { id: "opentable", label: "OpenTable", enabled: false },
      { id: "resy",      label: "Resy",      enabled: false },
    ],
  },
  {
    category: "Cost & Accounting",
    items: [
      { id: "marginedge",    label: "MarginEdge",    enabled: false },
      { id: "restaurant365", label: "Restaurant365", enabled: false },
    ],
  },
  {
    category: "Reviews",
    items: [
      { id: "google", label: "Google Reviews", enabled: false },
    ],
  },
];

/* ─── Toggle ─────────────────────────────────────────────────────────── */
function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} aria-pressed={on} style={{
      width: 34, height: 20, borderRadius: 10, padding: 0, border: "none",
      background: on ? C.forest : C.border,
      cursor: "pointer", position: "relative", flexShrink: 0,
      transition: "background 0.18s",
    }}>
      <div style={{
        width: 14, height: 14, borderRadius: "50%", background: "#fff",
        position: "absolute", top: 3, left: on ? 17 : 3,
        transition: "left 0.18s",
        boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
      }} />
    </button>
  );
}

/* ─── Pin icon ───────────────────────────────────────────────────────── */
function PinIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill={C.forest}>
      <path d="M10 2C7.24 2 5 4.24 5 7c0 3.75 5 11 5 11s5-7.25 5-11c0-2.76-2.24-5-5-5zm0 6.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
    </svg>
  );
}

/* ─── Sign In ────────────────────────────────────────────────────────── */
function SignInView({ onSignIn }: { onSignIn: () => void }) {
  const [email,    setEmail]    = useState("angel@canopyso.com");
  const [password, setPassword] = useState("•••••••••");
  const [loading,  setLoading]  = useState(false);

  const inp: React.CSSProperties = {
    width: "100%", padding: "10px 13px", boxSizing: "border-box",
    border: `1px solid ${C.border}`, borderRadius: 6,
    fontSize: 16, color: C.text, background: C.surface, outline: "none",
    fontFamily: CG, letterSpacing: "0.01em",
  };

  function go(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); onSignIn(); }, 700);
  }

  return (
    <div style={{ height: "100%", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .cg-inp:focus { border-color: ${C.forest} !important; outline: none !important; }
      `}</style>
      <div style={{ width: 380, padding: "0 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 44, justifyContent: "center" }}>
          <PinIcon size={18} />
          <span style={f({ fontSize: 24, fontWeight: 500, color: C.text, letterSpacing: "-0.01em" })}>Canopy</span>
        </div>

        <h1 style={f({ fontSize: 34, fontWeight: 400, color: C.text, margin: "0 0 8px", letterSpacing: "-0.01em", lineHeight: 1.1 })}>
          Welcome back
        </h1>
        <p style={f({ fontSize: 18, color: C.muted, margin: "0 0 32px", fontWeight: 300 })}>
          Sign in to access your portfolio
        </p>

        <form onSubmit={go} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={f({ display: "block", fontSize: 13, fontWeight: 500, color: C.muted, marginBottom: 6 })}>
              Email address
            </label>
            <input className="cg-inp" type="email" value={email} onChange={e => setEmail(e.target.value)} style={inp} />
          </div>
          <div>
            <label style={f({ display: "block", fontSize: 13, fontWeight: 500, color: C.muted, marginBottom: 6 })}>
              Password
            </label>
            <input className="cg-inp" type="password" value={password} onChange={e => setPassword(e.target.value)} style={inp} />
          </div>
          <button type="submit" disabled={loading} style={{
            marginTop: 6, padding: "12px 0",
            background: loading ? "#2d6b5e" : C.forest,
            color: "#fff", border: "none", borderRadius: 6,
            fontSize: 17, cursor: loading ? "not-allowed" : "pointer",
            fontFamily: CG, fontWeight: 500, letterSpacing: "0.02em",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "background 0.15s",
          }}>
            {loading ? (
              <>
                <svg style={{ animation: "spin 0.8s linear infinite" }} width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                Signing in…
              </>
            ) : "Continue →"}
          </button>
        </form>

        <p style={f({ textAlign: "center", fontSize: 13, color: C.mutedLt, marginTop: 32, fontWeight: 300 })}>
          Demo environment · no real authentication
        </p>
      </div>
    </div>
  );
}

/* ─── Integration Setup ──────────────────────────────────────────────── */
function SetupView({ groups, onToggle, onContinue }: {
  groups: IntegrationGroup[];
  onToggle: (id: string) => void;
  onContinue: () => void;
}) {
  const connectedCount = groups.reduce((n, g) => n + g.items.filter(i => i.enabled).length, 0);

  return (
    <div style={{ height: "100%", background: C.bg, overflowY: "auto" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 32px 60px" }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 34, justifyContent: "center" }}>
          <PinIcon size={18} />
          <span style={f({ fontSize: 24, fontWeight: 500, color: C.text, letterSpacing: "-0.01em" })}>Canopy</span>
        </div>

        {/* Heading */}
        <h1 style={f({ fontSize: 34, fontWeight: 400, color: C.text, margin: "0 0 8px", letterSpacing: "-0.01em", lineHeight: 1.1 })}>
          Connect your stack
        </h1>
        <p style={f({ fontSize: 17, color: C.muted, margin: "0 0 18px", fontWeight: 300, lineHeight: 1.55 })}>
          Canopy pulls from the systems you already run on. This is a one-time setup — once connected, data flows automatically.
        </p>

        {/* Security notice */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "9px 13px", marginBottom: 26,
          border: `1px solid ${C.forestLt}`,
          borderRadius: 6, background: "#F5FAF8",
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.forest} strokeWidth="2" strokeLinecap="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <span style={f({ fontSize: 13, color: C.forest })}>
            Credentials are encrypted in transit and never stored in plain text
          </span>
        </div>

        {/* Integration groups — 2-column grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18, marginBottom: 36 }}>
          {groups.map(group => (
            <div key={group.category}>
              {/* Category label + rule */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={f({ fontSize: 10, fontWeight: 600, color: C.mutedLt, letterSpacing: "0.10em", textTransform: "uppercase", whiteSpace: "nowrap" })}>
                  {group.category}
                </span>
                <div style={{ flex: 1, height: 1, background: C.borderLt }} />
              </div>

              {/* 2-column grid of integration tiles */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                {group.items.map(item => {
                  const { Logo } = BRAND[item.id];
                  return (
                    <div
                      key={item.id}
                      onClick={() => onToggle(item.id)}
                      style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "9px 10px",
                        background: item.enabled ? "#F6FAF7" : "transparent",
                        borderRadius: 8,
                        border: `1px solid ${item.enabled ? "#BED9D1" : "transparent"}`,
                        cursor: "pointer",
                        transition: "background 0.12s, border-color 0.12s",
                      }}
                    >
                      <Logo />
                      <span style={f({ flex: 1, fontSize: 14, fontWeight: 400, color: C.text, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" })}>
                        {item.label}
                      </span>
                      {item.enabled
                        ? <span style={{ fontSize: 11, color: C.forest, fontFamily: CG, whiteSpace: "nowrap" }}>● Connected</span>
                        : <span style={{ fontSize: 11, color: C.mutedLt, fontFamily: CG, whiteSpace: "nowrap" }}>Connect →</span>
                      }
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Request integration */}
        <div style={{ marginBottom: 28, paddingTop: 20, borderTop: `1px solid ${C.borderLt}` }}>
          <span style={f({ fontSize: 13, color: C.muted })}>Don't see your integration?{" "}</span>
          <a
            href="mailto:support@canopyso.com?subject=Integration%20Request"
            style={f({ fontSize: 13, color: C.forest, textDecoration: "none", cursor: "pointer" })}
          >
            Request one →
          </a>
        </div>

        {/* Footer CTA */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={f({ fontSize: 15, color: C.muted, fontStyle: "italic" })}>
            {connectedCount === 0
              ? "Connect at least one integration to continue"
              : `${connectedCount} integration${connectedCount !== 1 ? "s" : ""} connected`}
          </span>
          <button
            onClick={connectedCount > 0 ? onContinue : undefined}
            style={{
              padding: "11px 26px",
              background: connectedCount > 0 ? C.forest : C.border,
              color: connectedCount > 0 ? "#fff" : C.muted,
              border: "none", borderRadius: 6,
              fontSize: 17, fontFamily: CG, fontWeight: 500,
              cursor: connectedCount > 0 ? "pointer" : "not-allowed",
              letterSpacing: "0.02em",
              transition: "all 0.15s",
            }}
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── US Map ─────────────────────────────────────────────────────────── */
function USMap({ locations, selectedId, onMarkerClick }: {
  locations: Location[];
  selectedId: string | null;
  onMarkerClick: (id: string) => void;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <ComposableMap
      projection="geoAlbersUsa"
      style={{ width: "100%", height: "100%" }}
      projectionConfig={{ scale: 900 }}
    >
      <Geographies geography={GEO_URL}>
        {({ geographies }) =>
          geographies.map(geo => (
            <Geography
              key={geo.rsmKey}
              geography={geo}
              fill={C.mapLand}
              stroke={C.mapBdr}
              strokeWidth={0.6}
              style={{
                default: { outline: "none" },
                hover:   { outline: "none", fill: "#D8D3CA" },
                pressed: { outline: "none" },
              }}
            />
          ))
        }
      </Geographies>

      {locations.map(loc => {
        const sel  = loc.id === selectedId;
        const hov  = loc.id === hoveredId;
        const attn = loc.status === "attn";
        const fill = attn ? C.attn : C.forest;
        const ring = attn ? C.attnLt : C.forestLt;
        const r    = sel || hov ? 11 : 9;

        return (
          <Marker
            key={loc.id}
            coordinates={loc.coordinates}
            onClick={() => onMarkerClick(loc.id)}
            onMouseEnter={() => setHoveredId(loc.id)}
            onMouseLeave={() => setHoveredId(null)}
            style={{ cursor: "pointer" }}
          >
            {sel  && <circle r={19} fill={ring} opacity={0.5} />}
            {hov && !sel && <circle r={14} fill={ring} opacity={0.4} />}
            <circle r={r + 1} fill="rgba(0,0,0,0.10)" cy={1.5} />
            <circle r={r} fill={fill} stroke="white" strokeWidth={1.8} />
            <circle r={3} fill="white" />
            <text
              textAnchor="middle" y={r + 15}
              style={{ fontFamily: CG, fontSize: 11, fontWeight: 400, fill: C.text, pointerEvents: "none", letterSpacing: "0.01em" }}
            >
              {loc.city}
            </text>
          </Marker>
        );
      })}
    </ComposableMap>
  );
}

/* ─── Detail Panel ───────────────────────────────────────────────────── */
function DetailPanel({ loc, onClose }: { loc: Location; onClose: () => void }) {
  const [chatInput, setChatInput] = useState("");
  const [activeChip, setActiveChip] = useState<string | null>(null);

  return (
    <div style={{
      width: 348, flexShrink: 0,
      display: "flex", flexDirection: "column",
      borderLeft: `1px solid ${C.border}`,
      background: C.surface,
      overflowY: "auto",
      animation: "panelIn 0.18s ease-out",
    }}>
      <style>{`@keyframes panelIn { from { opacity:0; transform:translateX(12px); } to { opacity:1; transform:translateX(0); } }`}</style>

      {/* Header */}
      <div style={{
        padding: "16px 18px 13px",
        borderBottom: `1px solid ${C.borderLt}`,
        position: "sticky", top: 0, background: C.surface, zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h2 style={f({ fontSize: 22, fontWeight: 500, color: C.text, margin: "0 0 3px", lineHeight: 1.15 })}>
              {loc.name}
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
              <span style={f({ fontSize: 14, color: C.muted, fontStyle: "italic" })}>{loc.city}, {loc.state}</span>
              <span style={{
                fontFamily: CG, fontSize: 12, padding: "2px 8px", borderRadius: 4,
                background: C.forestLt, color: C.forest, fontWeight: 500,
              }}>{loc.cuisine}</span>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "none", cursor: "pointer",
            padding: 4, color: C.mutedLt, fontSize: 16, lineHeight: 1,
            fontFamily: CG,
          }}>✕</button>
        </div>
        <div style={{ marginTop: 7, display: "flex", gap: 12 }}>
          <span style={f({ fontSize: 13, color: C.muted })}>GM · {loc.gm}</span>
          <span style={{ color: C.borderLt }}>·</span>
          <span style={f({ fontSize: 13, color: C.muted })}>RVP · {loc.regionalVp}</span>
        </div>
      </div>

      <div style={{ flex: 1, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Playbook */}
        <section>
          <p style={f({ fontSize: 11, fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase", color: C.mutedLt, margin: "0 0 9px" })}>
            Playbook
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {loc.playbook.map((card, i) => (
              <div key={i} style={{
                padding: "10px 12px",
                background: C.bg,
                border: `1px solid ${C.border}`,
                borderLeft: `2.5px solid ${card.accent}`,
                borderRadius: 4,
              }}>
                <p style={f({ fontSize: 15, color: C.text, margin: 0, lineHeight: 1.6 })}>{card.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Performance */}
        <section>
          <p style={f({ fontSize: 11, fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase", color: C.mutedLt, margin: "0 0 9px" })}>
            Performance
          </p>
          <div style={{ background: C.bg, border: `1px solid ${C.border}`, padding: "13px 14px", marginBottom: 7, borderRadius: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <p style={f({ fontSize: 11, color: C.muted, margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.07em" })}>YTD Sales</p>
                <p style={f({ fontSize: 26, fontWeight: 500, color: C.text, margin: 0, lineHeight: 1 })}>{loc.sales}</p>
              </div>
              <span style={{
                fontFamily: CG, fontSize: 13, fontWeight: 500, padding: "3px 9px", borderRadius: 4,
                background: loc.targetDelta.startsWith("+") ? C.forestLt : C.attnLt,
                color: loc.targetDelta.startsWith("+") ? C.forest : C.attn,
              }}>
                {loc.targetDelta.startsWith("+") ? "▲" : "▼"} {loc.targetDelta} vs target
              </span>
            </div>
            <svg width="100%" height="22" viewBox="0 0 240 22" preserveAspectRatio="none" style={{ marginBottom: 10, display: "block" }}>
              <defs>
                <linearGradient id={`sg-${loc.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.forest} stopOpacity="0.12"/>
                  <stop offset="100%" stopColor={C.forest} stopOpacity="0"/>
                </linearGradient>
              </defs>
              <path d="M0,18 L35,15 L70,13 L105,10 L140,8 L175,6 L210,4 L240,2 L240,22 L0,22 Z" fill={`url(#sg-${loc.id})`}/>
              <path d="M0,18 L35,15 L70,13 L105,10 L140,8 L175,6 L210,4 L240,2" fill="none" stroke={C.forest} strokeWidth="1.2" opacity="0.5"/>
            </svg>
            <p style={f({ fontSize: 15, color: C.muted, margin: 0, lineHeight: 1.65 })}>{loc.summary}</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
            {[
              { label: "Labor", value: loc.labor, sub: `target ${loc.laborTarget}`, pct: (parseFloat(loc.labor) / parseFloat(loc.laborTarget)) * 100, color: parseFloat(loc.labor) <= parseFloat(loc.laborTarget) ? C.forest : "#B84040" },
              { label: "Covers", value: String(loc.covers), sub: `of ${loc.coversCap} cap`, pct: (loc.covers / loc.coversCap) * 100, color: AB },
            ].map(m => (
              <div key={m.label} style={{ background: C.bg, border: `1px solid ${C.border}`, padding: "10px 12px", borderRadius: 4 }}>
                <p style={f({ fontSize: 11, color: C.muted, margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.07em" })}>{m.label}</p>
                <p style={f({ fontSize: 22, fontWeight: 500, color: C.text, margin: "0 0 7px", lineHeight: 1 })}>{m.value}</p>
                <div style={{ height: 2, background: C.border, borderRadius: 1, marginBottom: 4 }}>
                  <div style={{ height: 2, borderRadius: 1, width: `${Math.min(m.pct, 100)}%`, background: m.color }} />
                </div>
                <span style={f({ fontSize: 13, color: C.muted })}>{m.sub}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Ask Canopy */}
        <section>
          <p style={f({ fontSize: 11, fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase", color: C.mutedLt, margin: "0 0 9px" })}>
            Ask Canopy
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 8 }}>
            {loc.prompts.map(chip => (
              <button key={chip} onClick={() => { setActiveChip(chip); setChatInput(chip); }} style={{
                textAlign: "left", padding: "8px 11px", borderRadius: 4,
                border: `1px solid ${activeChip === chip ? C.forest : C.border}`,
                background: activeChip === chip ? C.forestLt : C.bg,
                color: activeChip === chip ? C.forest : C.muted,
                fontFamily: CG, fontSize: 15, cursor: "pointer", transition: "all 0.12s",
              }}>{chip}</button>
            ))}
          </div>
          <div style={{
            display: "flex", gap: 8, border: `1px solid ${C.border}`,
            padding: "9px 12px", background: C.bg, borderRadius: 4,
          }}>
            <input
              type="text" value={chatInput} onChange={e => setChatInput(e.target.value)}
              placeholder={`Ask about ${loc.name}…`}
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontFamily: CG, fontSize: 15, color: C.text }}
            />
            <button style={{
              width: 24, height: 24, borderRadius: 999, border: "none",
              background: chatInput ? C.forest : C.border,
              cursor: chatInput ? "pointer" : "default",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </section>
        <div style={{ height: 8 }} />
      </div>
    </div>
  );
}

/* ─── Portfolio ──────────────────────────────────────────────────────── */
function PortfolioView({ locations, liveCount }: { locations: Location[]; liveCount: number }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const sel = locations.find(l => l.id === selectedId) ?? null;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.bg }}>

      {/* Top bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 20px", height: 48, flexShrink: 0,
        borderBottom: `1px solid ${C.border}`,
        background: C.surface,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <PinIcon size={15} />
          <span style={f({ fontSize: 19, fontWeight: 500, color: C.text, letterSpacing: "-0.01em" })}>Canopy</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {liveCount > 0 && (
            <div style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "4px 10px", border: `1px solid ${C.border}`,
              borderRadius: 6, background: C.bg,
            }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.forest }} />
              <span style={f({ fontSize: 14, color: C.forest })}>
                {liveCount} integration{liveCount !== 1 ? "s" : ""} live
              </span>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={f({ fontSize: 15, color: C.muted })}>Angel</span>
            <div style={{
              width: 27, height: 27, borderRadius: "50%",
              background: C.forestLt, color: C.forest,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: CG, fontSize: 13, fontWeight: 600,
            }}>A</div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Sidebar */}
        <div style={{
          width: 196, flexShrink: 0,
          display: "flex", flexDirection: "column",
          borderRight: `1px solid ${C.border}`,
          background: C.surface,
        }}>
          <div style={{ padding: "6px 8px", borderBottom: `1px solid ${C.borderLt}` }}>
            {[
              { label: "Map",       active: true  },
              { label: "Locations", active: false },
              { label: "Reports",   active: false },
              { label: "Settings",  active: false },
            ].map(item => (
              <button key={item.label} style={{
                width: "100%", textAlign: "left", padding: "7px 10px",
                background: item.active ? C.bg : "transparent",
                border: "none", cursor: "pointer", borderRadius: 5,
                fontFamily: CG, fontSize: 15,
                fontWeight: item.active ? 500 : 400,
                color: item.active ? C.text : C.muted,
              }}>{item.label}</button>
            ))}
          </div>

          <div style={{ padding: "12px 8px 6px" }}>
            <p style={f({ fontSize: 10, fontWeight: 600, color: C.mutedLt, letterSpacing: "0.10em", textTransform: "uppercase", padding: "0 10px 6px", margin: 0 })}>
              Locations
            </p>
            {locations.map(loc => (
              <button key={loc.id}
                onClick={() => setSelectedId(loc.id === selectedId ? null : loc.id)}
                style={{
                  width: "100%", textAlign: "left",
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "6px 10px",
                  background: selectedId === loc.id ? C.bg : "transparent",
                  border: "none", cursor: "pointer", borderRadius: 5,
                }}
              >
                <div style={{ width: 5, height: 5, borderRadius: "50%", flexShrink: 0, background: loc.status === "on" ? C.forest : C.attn }} />
                <span style={f({ fontSize: 14, color: selectedId === loc.id ? C.text : C.muted })}>{loc.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Map + panel */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: C.mapWater, overflow: "hidden" }}>
            <USMap
              locations={locations}
              selectedId={selectedId}
              onMarkerClick={id => setSelectedId(id === selectedId ? null : id)}
            />
          </div>
          {sel && <DetailPanel loc={sel} onClose={() => setSelectedId(null)} />}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 20px", height: 36, flexShrink: 0,
        borderTop: `1px solid ${C.border}`, background: C.surface,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: liveCount > 0 ? C.forest : C.mutedLt }} />
          <span style={f({ fontSize: 13, color: liveCount > 0 ? C.forest : C.muted })}>
            {liveCount > 0 ? `${liveCount} integration${liveCount !== 1 ? "s" : ""} live` : "No active integrations"}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={f({ fontSize: 13, color: C.mutedLt })}>{today}</span>
          <span style={{ color: C.borderLt }}>·</span>
          <span style={f({ fontSize: 13, color: C.mutedLt })}>5 locations</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Restaurants Discovery ──────────────────────────────────────────── */
function RestaurantsView({ locations, onConfirm }: {
  locations: Location[];
  onConfirm: (ids: string[]) => void;
}) {
  const [mode, setMode]         = useState<"decide" | "choose">("decide");
  const [selected, setSelected] = useState<Set<string>>(new Set(locations.map(l => l.id)));
  const count = locations.length;

  function toggleLoc(id: string) {
    setSelected(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  }

  const statusDot = (loc: Location) => (
    <div style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, background: loc.status === "on" ? C.forest : "#B84040" }} />
  );

  return (
    <div style={{ height: "100%", background: C.bg, overflowY: "auto" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "60px 32px 60px" }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 44, justifyContent: "center" }}>
          <PinIcon size={18} />
          <span style={f({ fontSize: 24, fontWeight: 500, color: C.text, letterSpacing: "-0.01em" })}>Canopy</span>
        </div>

        {mode === "decide" ? (
          <>
            {/* Discovery header */}
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: "50%",
                  background: C.forestLt,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <PinIcon size={22} />
                </div>
              </div>
              <h1 style={f({ fontSize: 36, fontWeight: 400, color: C.text, margin: "0 0 12px", letterSpacing: "-0.02em", lineHeight: 1.1 })}>
                We spotted {count} restaurants
              </h1>
              <p style={f({ fontSize: 16, color: C.muted, margin: 0, fontWeight: 300, lineHeight: 1.6 })}>
                Your connected integrations show {count} active locations.<br />
                Sync all to get started, or choose which to display on your map.
              </p>
            </div>

            {/* Location list preview */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 40 }}>
              {locations.map(loc => (
                <div key={loc.id} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 14px",
                  background: C.surface, borderRadius: 8,
                  border: `1px solid ${C.border}`,
                }}>
                  {statusDot(loc)}
                  <span style={f({ flex: 1, fontSize: 15, color: C.text, fontWeight: 400 })}>{loc.name}</span>
                  <span style={f({ fontSize: 13, color: C.muted })}>{loc.city}, {loc.state}</span>
                  <span style={f({ fontSize: 12, color: C.mutedLt, marginLeft: 8 })}>{loc.cuisine}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                onClick={() => onConfirm(locations.map(l => l.id))}
                style={f({
                  width: "100%", padding: "14px 0",
                  background: C.forest, color: "#fff",
                  border: "none", borderRadius: 8,
                  fontSize: 17, fontWeight: 500, cursor: "pointer",
                  letterSpacing: "0.01em",
                })}
              >
                Sync all {count} →
              </button>
              <button
                onClick={() => setMode("choose")}
                style={f({
                  width: "100%", padding: "13px 0",
                  background: "transparent", color: C.text,
                  border: `1px solid ${C.border}`, borderRadius: 8,
                  fontSize: 17, fontWeight: 400, cursor: "pointer",
                })}
              >
                Let me choose
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Choose mode */}
            <div style={{ marginBottom: 28 }}>
              <h1 style={f({ fontSize: 30, fontWeight: 400, color: C.text, margin: "0 0 6px", letterSpacing: "-0.01em" })}>
                Choose locations
              </h1>
              <p style={f({ fontSize: 15, color: C.muted, margin: 0, fontWeight: 300 })}>
                Select which restaurants to include on your portfolio map.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 32 }}>
              {locations.map(loc => {
                const checked = selected.has(loc.id);
                return (
                  <div
                    key={loc.id}
                    onClick={() => toggleLoc(loc.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "12px 14px",
                      background: checked ? "#F6FAF7" : C.surface,
                      borderRadius: 8,
                      border: `1px solid ${checked ? "#BED9D1" : C.border}`,
                      cursor: "pointer", transition: "all 0.12s",
                    }}
                  >
                    {/* Checkbox */}
                    <div style={{
                      width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                      border: `1.5px solid ${checked ? C.forest : C.muted}`,
                      background: checked ? C.forest : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {checked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                    {statusDot(loc)}
                    <span style={f({ flex: 1, fontSize: 15, color: C.text, fontWeight: 400 })}>{loc.name}</span>
                    <span style={f({ fontSize: 13, color: C.muted })}>{loc.city}, {loc.state}</span>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <button onClick={() => setMode("decide")} style={f({ background: "none", border: "none", fontSize: 14, color: C.muted, cursor: "pointer", padding: 0 })}>
                ← Back
              </button>
              <button
                onClick={() => onConfirm([...selected])}
                disabled={selected.size === 0}
                style={f({
                  padding: "12px 28px",
                  background: selected.size > 0 ? C.forest : C.border,
                  color: selected.size > 0 ? "#fff" : C.muted,
                  border: "none", borderRadius: 8,
                  fontSize: 16, fontWeight: 500,
                  cursor: selected.size > 0 ? "pointer" : "not-allowed",
                })}
              >
                Sync {selected.size} location{selected.size !== 1 ? "s" : ""} →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Root ───────────────────────────────────────────────────────────── */
export default function CanopyDemo() {
  const [view,       setView]       = useState<View>("signin");
  const [groups,     setGroups]     = useState<IntegrationGroup[]>(INIT_GROUPS);
  const [activeLocs, setActiveLocs] = useState<Location[]>(LOCATIONS);

  function toggleIntegration(id: string) {
    setGroups(prev =>
      prev.map(g => ({
        ...g,
        items: g.items.map(i => i.id === id ? { ...i, enabled: !i.enabled } : i),
      }))
    );
  }

  function handleLocConfirm(ids: string[]) {
    setActiveLocs(LOCATIONS.filter(l => ids.includes(l.id)));
    setView("portfolio");
  }

  const liveCount = groups.reduce((n, g) => n + g.items.filter(i => i.enabled).length, 0);

  return (
    <div style={{ height: "100vh", width: "100%", overflow: "hidden", fontFamily: CG }}>
      {view === "signin"      && <SignInView onSignIn={() => setView("setup")} />}
      {view === "setup"       && <SetupView groups={groups} onToggle={toggleIntegration} onContinue={() => setView("restaurants")} />}
      {view === "restaurants" && <RestaurantsView locations={LOCATIONS} onConfirm={handleLocConfirm} />}
      {view === "portfolio"   && <PortfolioView locations={activeLocs} liveCount={liveCount} />}
    </div>
  );
}

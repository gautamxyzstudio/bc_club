/* eslint-disable @typescript-eslint/no-explicit-any */
/*
  BC Real Estate Market — AI assistant backend (Next.js port of server.js)
  ------------------------------------------------------------------------
  Routes: src/app/api/assistant/[action]/route.ts
    POST /api/assistant/chat       → Groq answer (key stays on the server)
    POST /api/assistant/feedback   → feedback.jsonl
    POST /api/assistant/log        → questions.jsonl (emails/phones removed)
    POST /api/assistant/lead       → leads.jsonl (only with consent)
    GET  /api/assistant/starters   → start-screen suggestions
    POST /api/assistant/starters   → save suggestions (owner only)
    GET  /api/assistant/report     → owner report numbers (owner only)
  Pages: /assistant/index.html (chat), /assistant/widget.js, /assistant/report.html

  Env (.env):
    GROQ_API_KEY        required
    REPORT_KEY          password for the owner report (report is off if empty)
    GROQ_MODEL          optional, default openai/gpt-oss-120b
    ASSISTANT_DATA_DIR  optional, default <project>/assistant-data (keep out of public/ and git)
*/

import fs from "fs";
import path from "path";

const GROQ_MODEL = () => process.env.GROQ_MODEL || "openai/gpt-oss-120b";
const GROQ_URL = () => process.env.GROQ_URL || "https://api.groq.com/openai/v1/chat/completions";
const REPORT_KEY = () => process.env.REPORT_KEY || "";
const DATA_DIR = () => process.env.ASSISTANT_DATA_DIR || path.join(process.cwd(), "assistant-data");
const file = (name: string) => path.join(DATA_DIR(), name);

function append(name: string, row: unknown) {
  try {
    fs.mkdirSync(DATA_DIR(), { recursive: true });
    fs.appendFile(file(name), JSON.stringify(row) + "\n", (err) => err && console.error("Assistant save failed:", err.message));
  } catch (e) {
    console.error("Assistant save failed:", (e as Error).message);
  }
}

// ---------- Instructions for the AI (edit this text to change how it answers) ----------
const SYSTEM_PROMPT = `You are the BC Real Estate Market assistant (bcrealestatemarket.com).
You help people buying, selling, investing in and owning real estate in British Columbia, Canada.

RULES (verified November 2026 — use these, do not contradict them):
- Property Transfer Tax: 1% on first $200,000, 2% on $200,000–$2,000,000, 3% over $2,000,000, plus a further 2% on residential value over $3,000,000.
- First-time buyer PTT exemption: exempt on the first $500,000 only, for fair market value up to $835,000 (max saving $8,000); partial between $835,000 and $860,000; none above.
- Newly built home exemption: full up to $1,100,000, partial to $1,150,000.
- Additional PTT for foreign buyers: 20% in specified areas (Metro Vancouver, Fraser Valley, Capital, Central Okanagan, Nanaimo).
- Federal foreign buyer ban: scheduled to expire January 1, 2027 unless Ottawa extends or replaces it; say no decision had been announced as of early November 2026.
- Speculation and Vacancy Tax 2026: 1% Canadian citizens/PRs, 3% foreign owners/untaxed worldwide earners (4% from 2027).
- BC Home Flipping Tax: 20% of net income if sold within 365 days, declining to 0% at 730 days.
- First-time buyer GST rebate (law since March 12, 2026): full GST rebate on new homes up to $1,000,000 (max $50,000), phasing out to $1,500,000.
- Mortgage stress test: qualify at the higher of 5.25% or contract rate + 2%. GDS 39%, TDS 44%.
- Minimum down payment: 5% of first $500,000, 10% of the rest up to $1,499,999; 20% at $1,500,000+. Insured mortgages only under $1,500,000.
- 30-year insured amortization: first-time buyers and new builds only.
- Home buyer rescission period: 3 business days, 0.25% of price.
- Strata cannot restrict long-term rentals (since Nov 2022) but can keep 55+ age restrictions and ban short-term rentals.
- BC rent increase limit for 2026: 2.3%.

ABOUT BCREALESTATEMARKET.COM (only describe features that exist):
- Homes for sale: live MLS® listings, searchable by city or neighbourhood, beds, baths, price and type.
- Map search with layers: active listings, price drops (orange), sold in the last 12 months (dark red, prices after free sign-in), lot lines (public data, not a survey), schools (confirm catchments with the district), floodplain (approximate, public data), SkyTrain nearby (areas within a 5/10/15-min walk of a station) and frequent buses (areas near stops with a bus every 15 or 30 min, weekdays/weekends). Transit layers are free, no sign-in.
- Commuting questions: suggest Open the map → Layers → SkyTrain nearby or Frequent buses. Walk times are straight-line estimates from published TransLink and BC Transit schedules.
- Each listing shows price per sq ft, property taxes, room sizes, nearby schools with a rating out of 10 and distance, a mortgage calculator, a market snapshot and similar/sold homes.
- Sold prices, days on market and older market history need a FREE account ("Sign up free" at the top of any page).
- Monthly market reports by city and home type: out of every 100 homes for sale, how many sold (under 12 = buyer's market, 12–20 balanced, over 20 seller's), median price, days to sell, price paid vs asking, competition by price range, every neighbourhood, by bedrooms, and advice for buyers and sellers. Also a monthly sales chart and a stats map.
- Free home evaluation from a local expert, emailed within 24 hours (/home-estimation). Phone 778-896-2478.
- COVERAGE: listings, sold prices and market reports cover Greater Vancouver, the Fraser Valley, Sea-to-Sky and the Sunshine Coast/Gulf Islands (Greater Vancouver, Fraser Valley and Chilliwack boards). NOT covered: the Okanagan/Interior (Kelowna, Kamloops, Vernon, Penticton…), Vancouver Island (Victoria, Nanaimo…), the Kootenays and Northern BC. For those places, explain kindly that the local real estate board's rules don't let us show homes for sale, sold prices or market reports there — BUT our map does have lot lines, floodplain and schools with rankings for those areas (Open the map → search the place → Layers). Still answer general BC questions (taxes, mortgages, strata rules apply province-wide), suggest the local real estate board or BCREA for market numbers, and offer a local expert (778-896-2478) to point them to a trusted local REALTOR®. Never invent numbers for places we don't cover.
- If the visitor doesn't say which city, ask — don't assume Surrey.
- When a visitor needs personal advice (pricing their home, selling, a specific property, or anything you can't answer), warmly suggest talking to an expert: call a local expert at 778-896-2478 or send a message through the contact page. The page shows a contact card for this.
- The site does NOT compare neighbourhoods side by side and does NOT show parks, shopping or hospitals — don't offer those.

THE PAGE SHOWS TOOLS AUTOMATICALLY:
Above your answer the page already shows the right tool when relevant: a home-search link with the visitor's filters, the market report, free home evaluation, sold prices, map layer steps (lot lines, floodplain, schools, price drops), and mortgage / affordability / transfer tax / rental calculators.
So keep your answer short (under 180 words), don't repeat what the tool shows, and add useful advice instead.

HOW TO ANSWER:
- Talk like a friendly, helpful local real estate expert. Warm and simple, no jargon. A casual "Hey" is fine.
- Be clear, practical and specific to BC. Show numbers and simple calculations where useful.
- End every answer with ONE short, friendly follow-up question that helps the visitor take the next step (e.g. "Are you a first-time buyer?" or "Which neighbourhood are you looking at?").
- When someone wants sold prices, price history, or details about a specific home or their neighbours' homes, warmly tell them they can see it with a FREE account on bcrealestatemarket.com (sold prices, price history, floodplain maps, lot lines, school catchments, Surrey market reports).
- Mortgage questions: explain rules and give clearly labelled sample calculations. Never quote "today's rate", never say someone is approved, never recommend a specific product (e.g. fixed vs variable for this person). Suggest a licensed mortgage professional for personal advice.
- Tax and legal questions: general information only; suggest a CPA or BC real estate lawyer for their situation.
- You do NOT have live listings or sold data in this chat. If asked about a specific property's sold price or history, say a free account on the website shows it.
- If you are not sure a rule is current, say so. Never invent numbers, laws or listings.

OUTPUT FORMAT — reply with JSON only, exactly this shape:
{"html": "<h4>Short title</h4><p>...</p>", "followups": ["question 1", "question 2", "question 3"], "unsure": false}
- "html" uses only these tags: h4, h5, p, ul, ol, li, b, table, thead, tbody, tr, th, td.
- "followups" are 3 short related questions the person might ask next.
- "unsure": true if you could not really answer (missing information, outside what this site covers, or not about real estate), otherwise false.`;

// ---------- Simple protection against abuse ----------
// Behind Nginx/a proxy every request comes from the proxy, so use the visitor's real IP.
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "local";
}
const hits = new Map<string, number[]>();
function tooMany(ip: string, bucket = "chat", limit = 20) {
  const key = bucket + ":" + ip, now = Date.now();
  const recent = (hits.get(key) || []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < 60_000)) hits.delete(k);
  return recent.length > limit;
}

// Remove phone numbers and emails before anything is saved or sent to Groq
function scrub(s: unknown, max: number) {
  return String(s ?? "")
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "[email]")
    .replace(/(\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g, "[phone]")
    .replace(/\s+/g, " ").trim().slice(0, max);
}
async function readJson(req: Request, max: number): Promise<any> {
  const raw = await req.text();
  if (raw.length > max) throw new Error("too long");
  return JSON.parse(raw);
}
function readJsonl(name: string): any[] {
  try {
    return fs.readFileSync(file(name), "utf8").split("\n").filter(Boolean)
      .map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
  } catch { return []; }
}
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });

export async function handleChat(req: Request) {
  const key = process.env.GROQ_API_KEY?.trim();
  if (!key) return json({ error: "The AI service is not set up yet." }, 503);
  if (tooMany(clientIp(req))) return json({ error: "Too many requests. Please wait a minute." }, 429);

  let messages: any[];
  try {
    messages = (await readJson(req, 50_000)).messages;
    if (!Array.isArray(messages) || !messages.length) throw new Error();
  } catch {
    return json({ error: "Bad request." }, 400);
  }

  const history = messages.slice(-10)
    .filter((m) => (m?.role === "user" || m?.role === "assistant") && typeof m.content === "string")
    .map((m) => ({ role: m.role, content: scrub(m.content, 2000) }));

  const messagesForGroq = [{ role: "system", content: SYSTEM_PROMPT }, ...history];
  const callGroq = (extras: Record<string, unknown>) => fetch(GROQ_URL(), {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: GROQ_MODEL(), messages: messagesForGroq, temperature: 0.3, max_completion_tokens: 2500, ...extras }),
    signal: AbortSignal.timeout(45_000),
  });

  try {
    let groqRes = await callGroq({ response_format: { type: "json_object" }, reasoning_effort: "low" });
    if (groqRes.status === 400) {
      console.warn("Groq rejected a setting, retrying with plain settings:", await groqRes.text());
      groqRes = await callGroq({});
    }
    if (!groqRes.ok) {
      console.error("Groq error", groqRes.status, await groqRes.text());
      return json({ error: "The AI service is unavailable right now." }, 502);
    }
    const data = await groqRes.json();
    let text: string = (data.choices?.[0]?.message?.content || "").trim();
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    const jsonPart = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
    let out: any;
    try { out = JSON.parse(jsonPart); } catch { out = { html: `<p>${text.replace(/</g, "&lt;").replace(/\n/g, "<br>")}</p>`, followups: [] }; }
    if (!out.html) out.html = `<p>${text.replace(/</g, "&lt;")}</p>`;
    return json({
      html: String(out.html || ""),
      followups: Array.isArray(out.followups) ? out.followups.slice(0, 3).map(String) : [],
      unsure: out.unsure === true,
    });
  } catch (e) {
    console.error("Chat failed:", (e as Error).message);
    return json({ error: "The AI service is unavailable right now." }, 502);
  }
}

export async function handleFeedback(req: Request) {
  if (tooMany(clientIp(req), "fb", 20)) return json({ error: "Too many requests." }, 429);
  try {
    const f = await readJson(req, 4000);
    append("feedback.jsonl", { time: new Date().toISOString(), sid: scrub(f.sid, 24), question: scrub(f.question, 40), answer: scrub(f.answer, 200), note: scrub(f.note, 1000) });
    return json({ ok: true });
  } catch { return json({ error: "Bad request." }, 400); }
}

export async function handleLog(req: Request) {
  if (tooMany(clientIp(req), "log", 40)) return json({ error: "Too many requests." }, 429);
  try {
    const f = await readJson(req, 4000);
    const q = scrub(f.q, 300);
    if (!q) return json({ error: "Empty." }, 400);
    append("questions.jsonl", {
      time: new Date().toISOString(), sid: scrub(f.sid, 24), q, cat: scrub(f.cat, 20),
      tools: Array.isArray(f.tools) ? f.tools.slice(0, 3).map((x: unknown) => scrub(x, 20)) : [],
      place: scrub(f.place, 40), outside: f.outside === true, answered: f.answered !== false, live: f.live === true,
    });
    return json({ ok: true });
  } catch { return json({ error: "Bad request." }, 400); }
}

export async function handleLead(req: Request) {
  if (tooMany(clientIp(req), "lead", 5)) return json({ error: "Too many requests." }, 429);
  try {
    const f = await readJson(req, 4000);
    if (f.consent !== true) return json({ error: "Consent is required." }, 400);
    const phone = String(f.phone || "").replace(/[^\d+]/g, "").slice(0, 15);
    const email = String(f.email || "").trim().slice(0, 100);
    if (!/\d{10,11}$/.test(phone) && !/^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(email)) return json({ error: "Please give a phone number or email." }, 400);
    const row = {
      time: new Date().toISOString(), sid: scrub(f.sid, 24), name: String(f.name || "").replace(/[<>]/g, "").trim().slice(0, 60),
      phone, email, best: scrub(f.best, 20), context: scrub(f.context, 300), source: scrub(f.source, 10), consent: true,
    };
    append("leads.jsonl", row);
    console.log("New call-back request:", row.name || "(no name)", row.phone || row.email);
    return json({ ok: true });
  } catch { return json({ error: "Bad request." }, 400); }
}

function readStarters(): string[] {
  try { const s = JSON.parse(fs.readFileSync(file("starters.json"), "utf8")); return Array.isArray(s) ? s : []; } catch { return []; }
}
const isOwner = (req: Request) => !!REPORT_KEY() && req.headers.get("x-report-key") === REPORT_KEY();

export const handleGetStarters = () => json(readStarters());

export async function handleSaveStarters(req: Request) {
  if (!isOwner(req)) {
    tooMany(clientIp(req), "pw", 10);
    return json({ error: "Wrong password." }, 401);
  }
  try {
    const f = await readJson(req, 4000);
    const list = (Array.isArray(f.starters) ? f.starters : []).map((s: unknown) => scrub(s, 80)).filter(Boolean).slice(0, 6);
    fs.mkdirSync(DATA_DIR(), { recursive: true });
    fs.writeFileSync(file("starters.json"), JSON.stringify(list, null, 2));
    return json({ ok: true, starters: list });
  } catch { return json({ error: "Bad request." }, 400); }
}

function buildReport(days: number) {
  const since = Date.now() - days * 864e5;
  const qs = readJsonl("questions.jsonl").filter((r) => Date.parse(r.time) >= since);
  const fb = readJsonl("feedback.jsonl").filter((r) => Date.parse(r.time) >= since);
  const leads = readJsonl("leads.jsonl").filter((r) => Date.parse(r.time) >= since);
  const norm = (s: string) => s.toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9$.,+ ]/g, " ").replace(/\s+/g, " ").trim();
  const count = (arr: any[], key: (x: any) => string) => { const m: Record<string, number> = {}; arr.forEach((x) => { const k = key(x); if (k) m[k] = (m[k] || 0) + 1; }); return m; };
  const top = (m: Record<string, number>, n: number) => Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, n);

  const groups: Record<string, any> = {};
  qs.forEach((r) => { const k = norm(r.q); if (!k) return; const g = groups[k] || (groups[k] = { q: r.q, count: 0, cat: r.cat, answered: 0, last: r.time }); g.count++; if (r.answered) g.answered++; if (r.time >= g.last) { g.q = r.q; g.last = r.time; } });
  const perDay: Record<string, number> = {};
  for (let d = days - 1; d >= 0; d--) perDay[new Date(Date.now() - d * 864e5).toISOString().slice(0, 10)] = 0;
  qs.forEach((r) => { const k = r.time.slice(0, 10); if (k in perDay) perDay[k]++; });
  const places: Record<string, { count: number; outside: boolean }> = {};
  qs.forEach((r) => { if (!r.place) return; const p = places[r.place] || (places[r.place] = { count: 0, outside: r.outside }); p.count++; });

  return {
    days, generated: new Date().toISOString(),
    totals: { leads: leads.length, questions: qs.length, visitors: new Set(qs.map((r) => r.sid).filter(Boolean)).size, unanswered: qs.filter((r) => !r.answered).length, notes: fb.filter((r) => r.note).length, live: qs.filter((r) => r.live).length },
    perDay: Object.entries(perDay),
    topQuestions: Object.values(groups).sort((a: any, b: any) => b.count - a.count).slice(0, 25),
    categories: top(count(qs, (r) => r.cat), 15),
    tools: top(count(qs.flatMap((r) => r.tools || []), (x) => x), 15),
    places: Object.entries(places).sort((a, b) => b[1].count - a[1].count).slice(0, 25).map(([name, p]) => ({ name, ...p })),
    unanswered: qs.filter((r) => !r.answered).slice(-40).reverse().map((r) => ({ time: r.time, q: r.q })),
    notes: fb.filter((r) => r.note).slice(-60).reverse().map((r) => ({ time: r.time, question: r.question, answer: r.answer, note: r.note })),
    checkins: top(count(fb.filter((r) => r.question && r.answer && r.question !== "unanswered"), (r) => r.question + ":" + r.answer), 60),
    leads: leads.reverse().slice(0, 200),
    starters: readStarters(),
  };
}

export function handleReport(req: Request) {
  if (!REPORT_KEY()) return json({ error: "The report is turned off. Add REPORT_KEY=your-password to .env." }, 403);
  if (tooMany(clientIp(req), "report", 30)) return json({ error: "Too many requests." }, 429);
  if (!isOwner(req)) return json({ error: "Wrong password." }, 401);
  const days = Math.min(Math.max(parseInt(new URL(req.url).searchParams.get("days") || "") || 30, 1), 365);
  return json(buildReport(days));
}

export { json };

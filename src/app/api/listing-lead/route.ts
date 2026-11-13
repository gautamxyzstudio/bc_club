import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

/**
 * Leads from the listing details page: "Book a showing", "Ask a question" and partner quotes.
 * Sent to the same inbox as the contact form (USER_EMAIL + ADDITIONAL_EMAILS).
 */
type Lead = {
  type?: string; name?: string; contact?: string; message?: string;
  mls?: string; address?: string; price?: number; url?: string;
  day?: string; time?: string; how?: string; hasAgent?: boolean; kind?: string;
};

const esc = (v: unknown) =>
  String(v ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");

// light protection against floods of requests from one visitor
const hits = new Map<string, number[]>();
const tooMany = (key: string) => {
  const now = Date.now(), list = (hits.get(key) || []).filter((t) => now - t < 10 * 60_000);
  list.push(now); hits.set(key, list);
  return list.length > 8;
};

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    if (tooMany(ip)) return NextResponse.json({ message: "Too many requests, please try again later." }, { status: 429 });

    const b = (await req.json()) as Lead;
    const contact = String(b.contact || "").trim().slice(0, 120);
    const isEmail = /\S+@\S+\.\S+/.test(contact);
    if (!isEmail && contact.replace(/\D/g, "").length < 10) {
      return NextResponse.json({ message: "Add a phone number or email." }, { status: 400 });
    }
    const kind = b.type === "showing" ? "Showing request" : b.type === "quote" ? `Partner quote (${esc(b.kind)})` : "Question";
    const rows: [string, string][] = [
      ["Request", kind],
      ["Name", esc(b.name || "")],
      ["Phone / email", esc(contact)],
      ["Home", `${esc(b.address)}${b.mls ? ` · MLS® ${esc(b.mls)}` : ""}`],
      ["Asking price", b.price ? `$${Number(b.price).toLocaleString("en-CA")}` : ""],
      ["Preferred day", esc(b.day || "")],
      ["Time", esc(b.time || "")],
      ["How", esc(b.how || "")],
      ["Working with a REALTOR®", b.type === "showing" || b.type === "question" ? (b.hasAgent ? "Yes" : "No") : ""],
      ["Message", esc(String(b.message || "").slice(0, 2000)).replace(/\n/g, "<br>")],
      ["Page", b.url ? `<a href="${esc(b.url)}">${esc(b.url)}</a>` : ""],
    ];
    const html = `<div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;padding:24px;background:#fff;border:1px solid #e8edf3;border-radius:12px">
      <h2 style="margin:0 0 4px;color:#1e4e8c">${kind}</h2><p style="margin:0 0 16px;color:#6b7686">From the listing page on BC Real Estate Market</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px">${rows.filter((r) => r[1]).map((r) => `<tr><td style="padding:8px 0;color:#6b7686;width:170px;vertical-align:top">${r[0]}</td><td style="padding:8px 0;color:#233142;font-weight:600">${r[1]}</td></tr>`).join("")}</table></div>`;

    const recipients = [process.env.USER_EMAIL, ...(process.env.ADDITIONAL_EMAILS?.split(",") || [])].filter(Boolean).map((x) => x!.trim()).join(",");
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com", port: 465, secure: true,
      auth: { user: process.env.USER_EMAIL, pass: process.env.USER_PASSWORD },
    });
    await transporter.sendMail({
      from: `"BC RealEstate Market" <${process.env.USER_EMAIL}>`,
      to: recipients,
      subject: `${kind}: ${String(b.address || "listing").slice(0, 80)}`,
      html,
      ...(isEmail ? { replyTo: contact } : {}),
    });
    return NextResponse.json({ message: "Sent" });
  } catch (error) {
    console.error("listing-lead error:", error);
    return NextResponse.json({ message: "Could not send right now. Please try again." }, { status: 500 });
  }
}

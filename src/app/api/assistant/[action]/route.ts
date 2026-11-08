import {
  handleChat,
  handleFeedback,
  handleGetStarters,
  handleLead,
  handleLog,
  handleReport,
  handleSaveStarters,
  json,
} from "../_lib/assistant";

// AI assistant API (see ../_lib/assistant.ts). Saves files, so it must run on Node, never cached.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ action: string }> };

export async function POST(req: Request, { params }: Ctx) {
  switch ((await params).action) {
    case "chat": return handleChat(req);
    case "feedback": return handleFeedback(req);
    case "log": return handleLog(req);
    case "lead": return handleLead(req);
    case "starters": return handleSaveStarters(req);
    default: return json({ error: "Not found" }, 404);
  }
}

export async function GET(req: Request, { params }: Ctx) {
  switch ((await params).action) {
    case "starters": return handleGetStarters();
    case "report": return handleReport(req);
    default: return json({ error: "Not found" }, 404);
  }
}

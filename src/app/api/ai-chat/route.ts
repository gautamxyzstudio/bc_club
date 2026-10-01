import { NextResponse } from "next/server";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT = `You are the official AI Real Estate Specialist for BC Real Estate & BC Club (bcrealestatemarket.com), serving British Columbia, Canada.
Your goal is to provide concise, friendly, expert, and actionable advice to home buyers, sellers, investors, and renters in BC.

Core Knowledge & Guidance:
1. Locations Covered: Greater Vancouver (Vancouver West, Downtown, East Vancouver, Burnaby, Richmond, Surrey, Coquitlam, Langley, Delta, Maple Ridge, North & West Vancouver), Fraser Valley (Abbotsford, Chilliwack), Vancouver Island (Victoria, Nanaimo), and the Okanagan (Kelowna).
2. Property Types: Condos & Apartments, Townhouses, Single Family Detached Homes, Duplexes, and Presales / New Construction.
3. Key BC Rules:
   - 7-day rescission cooling-off period under REDMA for presale purchases.
   - Property Transfer Tax (PTT): 1% on first $200k, 2% up to $2M, 3% thereafter. First-Time Home Buyers exemption up to $500k (with partial relief to $525k, and up to $835k for qualifying new builds).
   - 5% GST applicable to newly constructed homes (rebate available under federal rules).
   - Foreign buyers ban & BC speculation / vacancy tax basics.
4. Website features to recommend when relevant:
   - Home Evaluation & Free Valuation: /home-estimation
   - Live Market Trends & Price Charts: /market-trends
   - Interactive Map Search: /map-search
   - MLS® Properties Browser: /properties
   - Direct Specialist Connect: /contact-us
5. Tone: Warm, professional, concise, reassuring. Use bullet points and emojis naturally. Keep responses focused and readable on mobile devices.`;

// Supported production chat models on Groq in priority order
const CANDIDATE_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "qwen/qwen3.8-27b",
  "llama-3.1-70b-versatile",
  "mixtral-8x7b-32768",
  "gemma2-9b-it",
  "allam-2-7b",
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body as { messages: ChatMessage[] };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Valid messages array is required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY?.trim();

    if (apiKey) {
      let modelsToTry = [...CANDIDATE_MODELS];

      try {
        const modelsRes = await fetch("https://api.groq.com/openai/v1/models", {
          headers: { Authorization: `Bearer ${apiKey}` },
          next: { revalidate: 3600 },
        });

        if (modelsRes.ok) {
          const modelsData = await modelsRes.json();
          // Filter ONLY valid chat models (exclude guardrails, audio, embeddings, rerankers)
          const activeChatIds: string[] = (modelsData.data || [])
            .map((m: any) => m.id as string)
            .filter((id: string) => {
              const lower = id.toLowerCase();
              return (
                !lower.includes("whisper") &&
                !lower.includes("guard") &&
                !lower.includes("embed") &&
                !lower.includes("rerank") &&
                !lower.includes("bge") &&
                !lower.includes("tts")
              );
            });

          if (activeChatIds.length > 0) {
            // Pick preferred production models first that are currently active
            const matchedCandidates = CANDIDATE_MODELS.filter((m) =>
              activeChatIds.includes(m)
            );
            const otherActiveChatModels = activeChatIds.filter(
              (m) => !CANDIDATE_MODELS.includes(m)
            );
            modelsToTry = [...matchedCandidates, ...otherActiveChatModels];
          }
        }
      } catch (e) {
        console.warn("Could not query /v1/models, falling back to static list", e);
      }

      // 2. Iterate through candidate models until one succeeds
      for (const model of modelsToTry) {
        try {
          const groqResponse = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
              },
              body: JSON.stringify({
                model,
                messages: [
                  { role: "system", content: SYSTEM_PROMPT },
                  ...messages.map((m) => ({
                    role: m.role,
                    content: m.content,
                  })),
                ],
                temperature: 0.7,
                max_tokens: 650,
              }),
            }
          );

          if (groqResponse.ok) {
            const data = await groqResponse.json();
            const reply =
              data.choices?.[0]?.message?.content ||
              "I'm here to assist with any BC property questions!";
            return NextResponse.json({ reply, source: "groq", model });
          } else {
            const errText = await groqResponse.text();
            console.warn(`Groq model ${model} failed (${groqResponse.status}):`, errText);
            // If it's a 404 model_not_found or similar, loop continues to the next candidate model!
          }
        } catch (groqError) {
          console.warn(`Error connecting with Groq model ${model}:`, groqError);
        }
      }
    }

    // Fallback response if no model answered
    const lastUserMessage =
      messages[messages.length - 1]?.content?.toLowerCase() || "";

    let fallbackReply = "";

    if (
      lastUserMessage.includes("presale") ||
      lastUserMessage.includes("pre-sale") ||
      lastUserMessage.includes("new build")
    ) {
      fallbackReply =
        "🏢 **Presales in British Columbia:**\n\nPresales allow you to secure a brand-new home with a staged deposit (typically 10%–20%) before construction completes. You benefit from a **7-day statutory rescission (cooling-off) period** under REDMA.\n\nWould you like recommendations for top presale projects in Burnaby, Surrey, or Vancouver?";
    } else if (
      lastUserMessage.includes("tax") ||
      lastUserMessage.includes("ptt") ||
      lastUserMessage.includes("property transfer")
    ) {
      fallbackReply =
        "💰 **BC Property Transfer Tax (PTT) Quick Guide:**\n\n• **1%** on the first $200,000\n• **2%** from $200,000 to $2,000,000\n• **3%** on the balance over $2,000,000\n\n*First-Time Home Buyers:* You may be exempt on qualifying homes up to $500,000 (and newly built homes up to $835,000). Check out our [Contact Us](/contact-us) page to speak with a mortgage specialist!";
    } else if (
      lastUserMessage.includes("price") ||
      lastUserMessage.includes("trend") ||
      lastUserMessage.includes("market")
    ) {
      fallbackReply =
        "📈 **BC Real Estate Market Snapshot:**\n\nGreater Vancouver and Fraser Valley are seeing active buyer demand in transit-connected condos (Brentwood, Metrotown, Surrey) and family townhomes. Single-family homes remain steady with strong long-term appreciation.\n\nExplore live charts on our **[Market Trends](/market-trends)** page!";
    } else if (
      lastUserMessage.includes("evaluation") ||
      lastUserMessage.includes("worth") ||
      lastUserMessage.includes("value") ||
      lastUserMessage.includes("estimate")
    ) {
      fallbackReply =
        "🏡 **Instant Home Evaluation:**\n\nCurious about the current market value of your property? Use our free **[Home Estimation](/home-estimation)** tool for a detailed neighborhood comparative analysis based on recent verified MLS® sales!";
    } else if (
      lastUserMessage.includes("condo") ||
      lastUserMessage.includes("vancouver") ||
      lastUserMessage.includes("house") ||
      lastUserMessage.includes("listing")
    ) {
      fallbackReply =
        "🔍 **Browsing Properties in BC:**\n\nWe feature thousands of active MLS® listings across Vancouver, Burnaby, Richmond, Surrey, and Kelowna. You can view all listings with filters on our **[Properties](/properties)** page, or explore visually on our interactive **[Map Search](/map-search)**!";
    } else {
      fallbackReply =
        "👋 **Hi there!** I'm your BC Real Estate AI assistant.\n\nI can help you explore:\n• Latest MLS® property listings & active prices\n• Vancouver & Fraser Valley market trends\n• BC Property Transfer Tax (PTT) & buyer rebates\n• Presale projects and neighborhood insights\n\nWhat would you like to know today?";
    }

    return NextResponse.json({
      reply: fallbackReply,
      source: "fallback",
    });
  } catch (error: any) {
    console.error("AI chat route error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI response" },
      { status: 500 }
    );
  }
}

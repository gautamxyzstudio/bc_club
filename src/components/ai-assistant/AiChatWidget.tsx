"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  Minus,
  MessageSquare,
  Home,
  HelpCircle,
  TrendingUp,
  MapPin,
  Tag,
  FileText,
  Heart,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Building2,
  Calculator,
  Compass,
  CheckCheck,
  Check,
  Plus,
} from "lucide-react";
import Link from "next/link";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  time: string;
  timestamp: number;
  messages: Message[];
}

const STORAGE_CONVERSATIONS_KEY = "bc_club_ai_conversations_v3";

// Sound Synthesizer via Web Audio API
const playAudioEffect = (type: "send" | "receive") => {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === "send") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(820, now + 0.09);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.13);
    } else {
      const now = ctx.currentTime;
      const playTone = (freq: number, start: number, dur: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.09, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + dur);
      };
      playTone(587.33, now, 0.16);
      playTone(880, now + 0.08, 0.22);
    }
  } catch {}
};

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: "conv-1",
    title: "3 bedroom homes in Surrey...",
    lastMessage: "Here are top family neighborhoods in Surrey...",
    time: "11:44",
    timestamp: Date.now() - 1000 * 60 * 60,
    messages: [
      {
        id: "m-1",
        sender: "user",
        text: "Show me 3 bedroom homes in Surrey under $1.2M",
        timestamp: "11:43",
      },
      {
        id: "m-2",
        sender: "ai",
        text: "🏡 **3 Bedroom Homes in Surrey under $1.2M:**\n\n• **Fleetwood:** Great family area with future SkyTrain extension, average 3-bed prices around $1.15M.\n• **Clayton / Cloverdale:** Newer coach homes and family townhomes between $1.05M – $1.18M.\n• **South Surrey / Grandview:** Premium builds close to White Rock beaches.\n\nWould you like recommendations on specific school catchments or active MLS® listings?",
        timestamp: "11:44",
      },
    ],
  },
  {
    id: "conv-2",
    title: "BC Property Transfer Tax (PTT)",
    lastMessage: "Standard PTT is 1% on first $200k, 2% up to $2M...",
    time: "11:08",
    timestamp: Date.now() - 1000 * 60 * 180,
    messages: [
      {
        id: "m-3",
        sender: "user",
        text: "How much Property Transfer Tax do I pay on $800k in BC?",
        timestamp: "11:07",
      },
      {
        id: "m-4",
        sender: "ai",
        text: "💰 **BC Property Transfer Tax (PTT):**\nOn an $800,000 home, the tax is **$14,000** ($2,000 on first $200k + $12,000 on remaining $600k). First-time buyers may qualify for exemptions.",
        timestamp: "11:08",
      },
    ],
  },
  {
    id: "conv-3",
    title: "Vancouver Market Trends 2026",
    lastMessage: "Greater Vancouver townhomes & condos continue steady growth...",
    time: "Yesterday",
    timestamp: Date.now() - 1000 * 60 * 60 * 24,
    messages: [
      {
        id: "m-5",
        sender: "user",
        text: "What are the latest market trends in Vancouver and Surrey?",
        timestamp: "Yesterday",
      },
      {
        id: "m-6",
        sender: "ai",
        text: "📈 **BC Real Estate Market Snapshot:**\nBuyer demand remains resilient in transit-connected condos (Brentwood, Surrey Central) and family townhomes.",
        timestamp: "Yesterday",
      },
    ],
  },
];

const QUICK_TOPICS = [
  {
    icon: Building2,
    badge: "Listings",
    badgeColor: "bg-blue-50 text-[#22558b] border-blue-200",
    title: "Find Vancouver Condos",
    desc: "Top neighborhoods & condos under $750k",
    query: "What are the best neighborhoods to buy a condo in Vancouver under $750k?",
  },
  {
    icon: Calculator,
    badge: "Tax Calculator",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    title: "BC Property Transfer Tax (PTT)",
    desc: "First-time exemptions & exact tax brackets",
    query: "How much Property Transfer Tax (PTT) do I pay in BC on an $800k home and who gets exemption?",
  },
  {
    icon: TrendingUp,
    badge: "Insights",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    title: "2026 Market Trends",
    desc: "Price benchmark & inventory in Surrey & Burnaby",
    query: "What is the latest real estate market trend in Burnaby, Surrey, and Greater Vancouver?",
  },
  {
    icon: Compass,
    badge: "Guide",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    title: "Presale Home Guide",
    desc: "7-day rescission period & deposit structure",
    query: "How does the 7-day rescission period and deposit work for BC presale developments?",
  },
];

export default function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"home" | "messages" | "help">("home");
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load persistent conversations from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CONVERSATIONS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setConversations(parsed);
          return;
        }
      }
    } catch {}
    setConversations(INITIAL_CONVERSATIONS);
  }, []);

  const saveConversationsToStorage = (updated: Conversation[]) => {
    setConversations(updated);
    try {
      localStorage.setItem(STORAGE_CONVERSATIONS_KEY, JSON.stringify(updated));
    } catch {}
  };

  const clearAllConversations = () => {
    try {
      localStorage.removeItem(STORAGE_CONVERSATIONS_KEY);
    } catch {}
    setConversations([]);
    setActiveConvId(null);
  };

  // Auto-open on initial load
  useEffect(() => {
    const timer = setTimeout(() => setIsOpen(true), 800);
    return () => clearTimeout(timer);
  }, []);

  // Scroll to bottom when message arrives
  useEffect(() => {
    if (activeTab === "messages" && activeConvId && isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversations, activeConvId, isTyping, activeTab, isOpen]);

  // Focus input when chat opens
  useEffect(() => {
    if (activeTab === "messages" && activeConvId && isOpen) {
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [activeTab, activeConvId, isOpen]);

  const currentConversation = conversations.find((c) => c.id === activeConvId);

  const sendToAi = async (convId: string, messagesList: Message[]) => {
    setIsTyping(true);
    try {
      const history = messagesList.map((m) => ({
        role: m.sender === "user" ? ("user" as const) : ("assistant" as const),
        content: m.text,
      }));

      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      if (!res.ok) throw new Error("Network response failed");

      const data = await res.json();
      playAudioEffect("receive");

      const aiResponse: Message = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: data.reply || "I am here to assist with any BC real estate questions.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setConversations((prev) => {
        const updated = prev.map((c) => {
          if (c.id === convId) {
            return {
              ...c,
              lastMessage: aiResponse.text.slice(0, 50) + "...",
              time: "Just now",
              timestamp: Date.now(),
              messages: [...c.messages, aiResponse],
            };
          }
          return c;
        });
        try {
          localStorage.setItem(STORAGE_CONVERSATIONS_KEY, JSON.stringify(updated));
        } catch {}
        return updated;
      });
    } catch {
      playAudioEffect("receive");
      const fallbackAiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: "I am here to assist you with properties, prices, or neighborhood guides in British Columbia. How can I help you?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setConversations((prev) => {
        const updated = prev.map((c) => {
          if (c.id === convId) {
            return {
              ...c,
              lastMessage: "I am here to assist you with BC real estate...",
              time: "Just now",
              timestamp: Date.now(),
              messages: [...c.messages, fallbackAiMsg],
            };
          }
          return c;
        });
        try {
          localStorage.setItem(STORAGE_CONVERSATIONS_KEY, JSON.stringify(updated));
        } catch {}
        return updated;
      });
    } finally {
      setIsTyping(false);
    }
  };

  const startNewConversation = (initialPrompt?: string) => {
    const newId = `conv-${Date.now()}`;
    const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const initialMsg: Message = {
      id: `m-init-${Date.now()}`,
      sender: "ai",
      text: "Hi! 👋 **I'm your BC Real Estate AI Assistant.**\nI can help you find properties, understand neighbourhoods, explore market trends, estimate home values, and more.\n\nWhat would you like to know today?",
      timestamp: nowStr,
    };

    const initialMessages: Message[] = [initialMsg];
    let initialTitle = "New Conversation";
    let lastMsgText = "Conversation started";

    if (initialPrompt && initialPrompt.trim()) {
      playAudioEffect("send");
      const userMsg: Message = {
        id: `u-${Date.now()}`,
        sender: "user",
        text: initialPrompt.trim(),
        timestamp: nowStr,
      };
      initialMessages.push(userMsg);
      initialTitle = initialPrompt.trim().slice(0, 32) + "...";
      lastMsgText = initialPrompt.trim();
    }

    const newConv: Conversation = {
      id: newId,
      title: initialTitle,
      lastMessage: lastMsgText,
      time: "Just now",
      timestamp: Date.now(),
      messages: initialMessages,
    };

    setConversations((prev) => {
      const updated = [newConv, ...prev.filter((c) => c.id !== newId)];
      try {
        localStorage.setItem(STORAGE_CONVERSATIONS_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setActiveConvId(newId);
    setActiveTab("messages");

    if (initialPrompt && initialPrompt.trim()) {
      sendToAi(newId, initialMessages);
    }
  };

  const handleSendMessage = (textToSend?: string) => {
    const content = (textToSend || inputText).trim();
    if (!content || isTyping) return;

    if (!activeConvId) {
      startNewConversation(content);
      return;
    }

    playAudioEffect("send");

    const userMessage: Message = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: content,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setInputText("");

    const targetConv = conversations.find((c) => c.id === activeConvId);
    const existingMsgs = targetConv ? targetConv.messages : [];
    const allMessages = [...existingMsgs, userMessage];

    setConversations((prev) => {
      const updated = prev.map((c) => {
        if (c.id === activeConvId) {
          return {
            ...c,
            title: c.title === "New Conversation" ? content.slice(0, 30) + "..." : c.title,
            lastMessage: content,
            time: "Just now",
            timestamp: Date.now(),
            messages: [...c.messages, userMessage],
          };
        }
        return c;
      });
      try {
        localStorage.setItem(STORAGE_CONVERSATIONS_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    sendToAi(activeConvId, allMessages);
  };

  const renderFormattedText = (raw: string) => {
    const lines = raw.split("\n");
    return (
      <div className="space-y-1">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-0.5" />;
          const parts = line.split(/(\*\*.*?\*\*)/g);
          const renderedLine = parts.map((part, pIdx) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return (
                <strong key={pIdx} className="font-bold text-[#10335e]">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          });
          return <p key={idx}>{renderedLine}</p>;
        })}
      </div>
    );
  };

  return (
    <>
      {/* Minimized Floating Launcher */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open BC Real Estate AI Chat"
          className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-[9999] focus:outline-none transition-transform hover:scale-105 active:scale-95"
        >
          <div className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-[#122e4e] via-[#22558b] to-[#2c6dae] text-white flex items-center justify-center shadow-xl shadow-[#22558b]/35 ring-4 ring-white group">
            <MessageSquare className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300" />
            <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full"></span>
          </div>
        </button>
      )}

      {/* Main Widget Dialog */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="BC Real Estate AI Assistant"
          className="fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-[9999] w-[calc(100vw-24px)] sm:w-[395px] h-[515px] sm:h-[525px] max-h-[calc(100vh-40px)] flex flex-col bg-white rounded-3xl shadow-[0_24px_70px_-12px_rgba(18,48,82,0.4)] border border-slate-200 overflow-hidden font-sans transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
        >
          {/* ================= HEADER ================= */}
          <div className="relative text-white px-5 pt-4 pb-3.5 shrink-0 shadow-md overflow-hidden">
            {/* Property Background Image - Clear & Natural */}
            <div
              className="absolute inset-0 bg-cover bg-center brightness-[0.92] contrast-[1.05]"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&auto=format&fit=crop&q=80'), url('/apartment.webp')`,
              }}
            />
            {/* Minimal soft vignette */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/30 to-black/65" />

            {/* Top Bar inside Header */}
            <div className="relative z-10 flex items-center justify-between">
              {/* Brand Icon & Status */}
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/25 flex items-center justify-center text-white shadow-inner">
                  <span className="font-black text-base tracking-tight text-white drop-shadow">BC</span>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-[#122e4e] rounded-full"></span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-sm tracking-wide text-white drop-shadow-md">
                      BC Real Estate AI
                    </span>
                    <span className="px-1.5 py-0.5 bg-[#eea500] text-[#122e4e] text-[9px] font-black rounded-full uppercase tracking-wider shadow-sm">
                      PRO
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-300 font-semibold flex items-center gap-1 mt-0.5 drop-shadow">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Online
                  </span>
                </div>
              </div>

              {/* Header Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => startNewConversation()}
                  title="New Conversation"
                  className="w-7 h-7 rounded-full bg-black/30 hover:bg-black/45 text-white/90 hover:text-white flex items-center justify-center transition-colors backdrop-blur-sm border border-white/10"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close widget"
                  className="w-7 h-7 rounded-full bg-black/30 hover:bg-black/45 text-white/90 hover:text-white flex items-center justify-center transition-colors backdrop-blur-sm border border-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* ================= BODY CONTENT BY TAB ================= */}
          <div className="flex-1 overflow-y-auto bg-slate-50/70 p-4 scrollbar-none relative flex flex-col">
            {/* ---------------- TAB: HOME ---------------- */}
            {activeTab === "home" && (
              <div className="space-y-3.5 animate-in fade-in duration-200">
                {/* 1. Hero Card: Ask AI Assistant */}
                <div
                  onClick={() => startNewConversation()}
                  className="relative overflow-hidden bg-gradient-to-r from-white via-white to-blue-50/40 rounded-2xl p-4 shadow-xs border border-slate-200 hover:border-[#22558b]/50 hover:shadow-md transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#122e4e] to-[#22558b] flex items-center justify-center text-white shadow-md shadow-[#22558b]/20 group-hover:scale-105 transition-transform shrink-0">
                      <Sparkles className="w-5 h-5 text-[#eea500]" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#22558b] transition-colors">
                          Ask AI Assistant
                        </h4>
                        <span className="bg-[#eea500]/15 text-[#b07800] text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                          Instant
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                        Instant answers for BC listings, PTT taxes, presales & market trends
                      </p>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-[#22558b] group-hover:text-white flex items-center justify-center text-slate-400 transition-colors shrink-0">
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>

                {/* 2. Popular BC Inquiries */}
                <div>
                  <div className="flex items-center justify-between mb-2 px-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      POPULAR BC INQUIRIES
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Click to ask</span>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {QUICK_TOPICS.map((topic, i) => {
                      const IconComponent = topic.icon;
                      return (
                        <div
                          key={i}
                          onClick={() => startNewConversation(topic.query)}
                          className="bg-white rounded-xl p-3 border border-slate-200/80 hover:border-[#22558b]/40 hover:bg-blue-50/30 transition-all duration-200 cursor-pointer group shadow-2xs flex items-center gap-3"
                        >
                          <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#22558b] shrink-0 group-hover:scale-105 group-hover:bg-white transition-all">
                            <IconComponent className="w-4 h-4" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h5 className="text-xs font-bold text-slate-900 group-hover:text-[#22558b] transition-colors truncate">
                                {topic.title}
                              </h5>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${topic.badgeColor}`}
                              >
                                {topic.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">
                              {topic.desc}
                            </p>
                          </div>

                          <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#22558b] group-hover:translate-x-0.5 transition-all shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Direct Tools */}
                <div className="pt-1 grid grid-cols-2 gap-2">
                  <Link
                    href="/home-estimation"
                    onClick={() => setIsOpen(false)}
                    className="p-2.5 bg-white border border-slate-200/80 hover:border-[#22558b] rounded-xl text-center transition-colors group shadow-2xs"
                  >
                    <span className="text-xs font-bold text-slate-800 group-hover:text-[#22558b] block">
                      Free Evaluation
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Check home value
                    </span>
                  </Link>
                  <Link
                    href="/properties"
                    onClick={() => setIsOpen(false)}
                    className="p-2.5 bg-white border border-slate-200/80 hover:border-[#22558b] rounded-xl text-center transition-colors group shadow-2xs"
                  >
                    <span className="text-xs font-bold text-slate-800 group-hover:text-[#22558b] block">
                      Browse Properties
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Active MLS® listings
                    </span>
                  </Link>
                </div>
              </div>
            )}

            {/* ---------------- TAB: MESSAGES (MATCHING SCREENSHOT) ---------------- */}
            {activeTab === "messages" && (
              <div className="flex-1 flex flex-col h-full animate-in fade-in duration-200">
                {/* VIEW A: RECENT CONVERSATIONS LIST (When no active chat is opened or conversation not found) */}
                {!activeConvId || !currentConversation ? (
                  <div className="flex-1 flex flex-col h-full justify-between">
                    <div>
                      {/* Top Header of List: RECENT CONVERSATIONS (count) + Clear All */}
                      <div className="flex items-center justify-between mb-3 px-1">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          RECENT CONVERSATIONS ({conversations.length})
                        </span>
                        {conversations.length > 0 && (
                          <button
                            onClick={clearAllConversations}
                            className="text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors"
                          >
                            Clear All
                          </button>
                        )}
                      </div>

                      {/* Conversations Cards List (Exact match to screenshot!) */}
                      <div className="space-y-2.5 overflow-y-auto max-h-[310px] pr-1 scrollbar-none">
                        {conversations.length > 0 ? (
                          conversations.map((conv) => (
                            <div
                              key={conv.id}
                              onClick={() => setActiveConvId(conv.id)}
                              className="bg-white rounded-2xl p-3.5 border border-slate-200/90 hover:border-[#22558b]/40 hover:shadow-sm transition-all duration-200 cursor-pointer flex items-center gap-3.5 group shadow-2xs"
                            >
                              {/* Purple / Blue Chat Bubble Icon */}
                              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#122e4e] to-[#22558b] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                                <MessageSquare className="w-5 h-5 fill-white/20" />
                              </div>

                              {/* Title, Snippet & Timestamp */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-[#22558b] transition-colors">
                                    {conv.title}
                                  </h4>
                                  <span className="text-[11px] text-slate-400 font-medium shrink-0 ml-2">
                                    {conv.time}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                  {conv.lastMessage}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center text-xs text-slate-400">
                            No recent conversations. Click "Ask a question" below to start!
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Floating Pill Button: [ Ask a question ? ] */}
                    <div className="pt-3 pb-1 flex justify-center">
                      <button
                        onClick={() => startNewConversation()}
                        className="py-3 px-7 bg-[#22558b] hover:bg-[#122e4e] text-white rounded-full font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#22558b]/25 transition-all transform hover:scale-105 active:scale-95"
                      >
                        <span>Ask a question</span>
                        <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                          ?
                        </div>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* VIEW B: ACTIVE CHAT SCREEN */
                  <div className="flex-1 flex flex-col h-full">
                    {/* Chat Sub-header with Persona */}
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/80 shrink-0">
                      <button
                        onClick={() => setActiveConvId(null)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#22558b] hover:text-[#122e4e] transition-colors"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> Conversations
                      </button>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>AI Agent</span>
                        </div>
                        <button
                          onClick={() => startNewConversation()}
                          className="text-[11px] font-medium text-slate-400 hover:text-[#22558b] flex items-center gap-1 p-1 transition-colors"
                          title="New Chat"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Messages feed */}
                    <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-none pb-2">
                      {currentConversation.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${
                            msg.sender === "user" ? "items-end" : "items-start"
                          }`}
                        >
                          <div className="flex items-start gap-2 max-w-[88%] group">
                            {msg.sender === "ai" && (
                              <div className="w-6 h-6 rounded-full bg-[#22558b] text-white flex items-center justify-center shrink-0 mt-0.5 text-[9px] font-black shadow-2xs">
                                BC
                              </div>
                            )}

                            <div
                              className={`px-4 py-3 rounded-2xl text-xs leading-relaxed ${
                                msg.sender === "user"
                                  ? "bg-[#22558b] text-white rounded-tr-xs shadow-xs"
                                  : "bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs shadow-2xs whitespace-pre-line"
                              }`}
                            >
                              {msg.sender === "user" ? msg.text : renderFormattedText(msg.text)}
                            </div>
                          </div>

                          <span className="text-[9px] text-slate-400 mt-1 px-8">
                            {msg.timestamp}
                          </span>
                        </div>
                      ))}

                      {isTyping && (
                        <div className="flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200 px-3.5 py-2 rounded-2xl rounded-tl-xs w-fit shadow-2xs ml-8">
                          <Sparkles className="w-3.5 h-3.5 text-[#eea500] animate-spin" />
                          <span className="font-medium text-slate-600">Analyzing & searching...</span>
                          <span className="inline-flex gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#22558b] animate-bounce"></span>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#22558b] animate-bounce [animation-delay:0.2s]"></span>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#22558b] animate-bounce [animation-delay:0.4s]"></span>
                          </span>
                        </div>
                      )}

                      <div ref={messagesEndRef} />
                    </div>

                    {/* Chat Input Area - Personal Concierge Style */}
                    <div className="pt-2 mt-auto shrink-0">
                      {/* Suggestion Chips */}
                      <div className="flex items-center gap-1.5 pb-2 overflow-x-auto scrollbar-none px-0.5">
                        <button
                          type="button"
                          onClick={() => handleSendMessage("What is the average home price in Surrey and Vancouver right now?")}
                          className="text-[11px] font-medium text-slate-600 bg-white hover:bg-slate-100 hover:text-[#22558b] border border-slate-200/90 rounded-full px-2.5 py-1 whitespace-nowrap transition-colors shadow-2xs"
                        >
                          🏡 Average prices
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSendMessage("How much Property Transfer Tax (PTT) do I pay in BC on an $800k home?")}
                          className="text-[11px] font-medium text-slate-600 bg-white hover:bg-slate-100 hover:text-[#22558b] border border-slate-200/90 rounded-full px-2.5 py-1 whitespace-nowrap transition-colors shadow-2xs"
                        >
                          💰 PTT Calculator
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSendMessage("What are the best transit-friendly presale projects in BC?")}
                          className="text-[11px] font-medium text-slate-600 bg-white hover:bg-slate-100 hover:text-[#22558b] border border-slate-200/90 rounded-full px-2.5 py-1 whitespace-nowrap transition-colors shadow-2xs"
                        >
                          🏢 Presales
                        </button>
                      </div>

                      {/* Clean Messenger Input Card */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSendMessage();
                        }}
                        className="relative flex items-center bg-white rounded-2xl border border-slate-200 shadow-sm focus-within:border-[#22558b] focus-within:ring-2 focus-within:ring-[#22558b]/15 pl-3.5 pr-1.5 py-1.5 transition-all duration-200"
                      >
                        <input
                          ref={inputRef}
                          type="text"
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          placeholder="Type a message..."
                          className="flex-1 bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none pr-2 font-normal py-1"
                        />
                        <button
                          type="submit"
                          disabled={!inputText.trim() || isTyping}
                          aria-label="Send message"
                          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 shrink-0 ${
                            inputText.trim() && !isTyping
                              ? "bg-[#22558b] text-white hover:bg-[#122e4e] shadow-sm shadow-[#22558b]/25 cursor-pointer scale-100 hover:scale-105 active:scale-95"
                              : "bg-slate-100 text-slate-300 cursor-not-allowed scale-95"
                          }`}
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ---------------- TAB: HELP ---------------- */}
            {activeTab === "help" && (
              <div className="space-y-3.5 animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
                  <h4 className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-[#22558b]" />
                    Frequently Asked Questions
                  </h4>
                  <p className="text-[11px] text-slate-400 mb-3">
                    Answers to common questions about BC Real Estate services.
                  </p>

                  <div className="space-y-2 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="font-bold text-slate-800 block mb-0.5">
                        How does the home evaluation tool work?
                      </span>
                      <span className="text-[11px] text-slate-600">
                        Our model uses verified MLS® sales and comparative property data across BC.
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="font-bold text-slate-800 block mb-0.5">
                        What is the 7-day rescission cooling-off period?
                      </span>
                      <span className="text-[11px] text-slate-600">
                        Under REDMA, buyers have 7 days to cancel a presale contract with 100% deposit refund.
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="font-bold text-slate-800 block mb-0.5">
                        Who gets the First-Time Buyer PTT exemption?
                      </span>
                      <span className="text-[11px] text-slate-600">
                        Eligible BC buyers on qualifying homes up to $500,000 (and up to $835,000 for new builds).
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50/80 to-slate-100 rounded-2xl p-4 border border-blue-100 text-xs space-y-2">
                  <span className="font-bold text-slate-900 block">
                    Speak With a Licensed REALTOR®
                  </span>
                  <p className="text-[11px] text-slate-600">
                    Our team is ready to help you tour homes or list your property across Greater Vancouver.
                  </p>
                  <Link
                    href="/contact-us"
                    onClick={() => setIsOpen(false)}
                    className="inline-block w-full py-2 px-3 bg-[#22558b] text-white text-center rounded-xl text-xs font-semibold hover:bg-[#122e4e] transition-colors"
                  >
                    Contact Us Today
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* ================= BOTTOM NAVIGATION BAR (MATCHING SCREENSHOT) ================= */}
          <div className="bg-white border-t border-slate-200/90 px-6 py-2 flex items-center justify-around shrink-0 shadow-lg">
            {/* Home Tab */}
            <button
              onClick={() => {
                setActiveTab("home");
                setActiveConvId(null);
              }}
              className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
                activeTab === "home"
                  ? "text-[#22558b] font-bold"
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              <Home className="w-5 h-5" />
              <span>Home</span>
              {activeTab === "home" && (
                <span className="w-6 h-0.5 bg-[#22558b] rounded-full -mt-0.5"></span>
              )}
            </button>

            {/* Messages Tab */}
            <button
              onClick={() => {
                setActiveTab("messages");
              }}
              className={`relative flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
                activeTab === "messages"
                  ? "text-[#22558b] font-bold"
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              <span>Messages</span>
              {activeTab === "messages" && (
                <span className="w-6 h-0.5 bg-[#22558b] rounded-full -mt-0.5"></span>
              )}
              {/* Unread Indicator */}
              <span className="absolute top-0 right-1.5 w-2 h-2 rounded-full bg-[#eea500]"></span>
            </button>

            {/* Help Tab */}
            <button
              onClick={() => {
                setActiveTab("help");
                setActiveConvId(null);
              }}
              className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
                activeTab === "help"
                  ? "text-[#22558b] font-bold"
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              <HelpCircle className="w-5 h-5" />
              <span>Help</span>
              {activeTab === "help" && (
                <span className="w-6 h-0.5 bg-[#22558b] rounded-full -mt-0.5"></span>
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

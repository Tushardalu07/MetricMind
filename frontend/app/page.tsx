"use client";

import { useState } from "react";

import {
  Menu,
  Plus,
  MessageSquare,
  Send,
  BarChart3,
  Database,
  X,
  Sparkles,
  User,
  Bot,
  ChevronRight,
} from "lucide-react";

import DynamicChart from "./components/charts/DynamicChart";

/* =========================================================
   TYPES
========================================================= */

type ChartData = {
  labels: string[];
  values: number[];
};

type ChartInfo = {
  type: "bar" | "line";
  title: string;
  subtitle?: string;
  data: ChartData;
};

type ApiInfo = {
  method: string;
  endpoint: string;
  request: Record<string, string>;
};

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  chart?: ChartInfo;
  api?: ApiInfo;
  sql?: string;
};

/* =========================================================
   SUGGESTIONS
========================================================= */

const suggestions = [
  {
    title: "European Sales",
    description: "Show me European sales",
    icon: BarChart3,
  },
  {
    title: "Q3 Revenue",
    description: "How did Q3 revenue perform?",
    icon: Database,
  },
  {
    title: "Regional Performance",
    description: "Compare regional performance",
    icon: MessageSquare,
  },
];

/* =========================================================
   HOME
========================================================= */

export default function Home() {
  const [input, setInput] = useState("");

  const [messages, setMessages] = useState<Message[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [showApiCall, setShowApiCall] = useState<number | null>(
    null
  );

  const [showSql, setShowSql] = useState<number | null>(null);

  /* =========================================================
     SEND MESSAGE
  ========================================================= */

  const handleSend = () => {
    const question = input.trim();

    if (!question || isLoading) {
      return;
    }

    /* USER MESSAGE */

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: question,
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    setInput("");

    setIsLoading(true);

    /* TEMPORARY DEMO RESPONSE */

    setTimeout(() => {
      const assistantMessage: Message = {
        id: Date.now() + 1,

        role: "assistant",

        content:
          "European sales increased during Q3 compared to Q2. Germany contributed the highest share, followed by France and Spain.",

        /* DYNAMIC CHART INFORMATION */

        chart: {
          type: "bar",

          title: "European Sales",

          subtitle: "Sales by region · Q3",

          data: {
            labels: [
              "Germany",
              "France",
              "Spain",
              "Italy",
            ],

            values: [
              520,
              410,
              280,
              180,
            ],
          },
        },

        /* API INFORMATION */

        api: {
          method: "POST",

          endpoint: "/api/chat",

          request: {
            question: question,
            session_id: "demo-session",
          },
        },

        /* SQL INFORMATION */

        sql: `SELECT
    region,
    SUM(sales) AS total_sales
FROM sales
WHERE region IN (
    'Germany',
    'France',
    'Spain',
    'Italy'
)
GROUP BY region
ORDER BY total_sales DESC;`,
      };

      setMessages((previous) => [
        ...previous,
        assistantMessage,
      ]);

      setIsLoading(false);
    }, 1200);
  };

  /* =========================================================
     SUGGESTION
  ========================================================= */

  const handleSuggestionClick = (text: string) => {
    setInput(text);
  };

  /* =========================================================
     NEW CHAT
  ========================================================= */

  const handleNewChat = () => {
    setMessages([]);

    setInput("");

    setIsLoading(false);

    setShowApiCall(null);

    setShowSql(null);

    setSidebarOpen(false);
  };

  /* =========================================================
     KEYBOARD
  ========================================================= */

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      handleSend();
    }
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <main className="min-h-screen bg-[#FCFBFB] text-[#192A56]">

      <div className="flex min-h-screen">

        {/* =====================================================
            MOBILE OVERLAY
        ===================================================== */}

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* =====================================================
            SIDEBAR
        ===================================================== */}

        <aside
          className={`
            fixed left-0 top-0 z-50
            flex h-screen w-[270px]
            flex-col
            bg-[#192A56]
            text-white
            transition-transform duration-300
            lg:static lg:translate-x-0
            ${
              sidebarOpen
                ? "translate-x-0"
                : "-translate-x-full"
            }
          `}
        >

          {/* LOGO */}

          <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F7D794]">

                <BarChart3
                  size={21}
                  className="text-[#192A56]"
                />

              </div>

              <div>

                <h1 className="text-lg font-bold tracking-tight">
                  MetricMind
                </h1>

                <p className="text-[11px] text-white/50">
                  Semantic BI Engine
                </p>

              </div>

            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-2 text-white/60 hover:bg-white/10 lg:hidden"
            >
              <X size={20} />
            </button>

          </div>

          {/* NEW CHAT */}

          <div className="px-4 pt-5">

            <button
              onClick={handleNewChat}
              className="
                flex w-full
                items-center justify-center gap-2
                rounded-xl
                bg-[#F7D794]
                px-4 py-3
                text-sm font-semibold
                text-[#192A56]
                transition
                hover:bg-[#f3cf7d]
              "
            >

              <Plus size={18} />

              New Chat

            </button>

          </div>

          {/* CONVERSATION HISTORY */}

          <div className="mt-7 flex-1 overflow-y-auto px-4">

            <p className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-wider text-white/40">
              Recent Conversations
            </p>

            <div className="space-y-1">

              <button
                className="
                  flex w-full items-center gap-3
                  rounded-lg px-3 py-3
                  text-left text-sm text-white/75
                  transition
                  hover:bg-white/10
                "
              >

                <MessageSquare size={16} />

                <span className="truncate">
                  European Sales Analysis
                </span>

              </button>

              <button
                className="
                  flex w-full items-center gap-3
                  rounded-lg px-3 py-3
                  text-left text-sm text-white/75
                  transition
                  hover:bg-white/10
                "
              >

                <MessageSquare size={16} />

                <span className="truncate">
                  Q3 Revenue Performance
                </span>

              </button>

              <button
                className="
                  flex w-full items-center gap-3
                  rounded-lg px-3 py-3
                  text-left text-sm text-white/75
                  transition
                  hover:bg-white/10
                "
              >

                <MessageSquare size={16} />

                <span className="truncate">
                  Regional Comparison
                </span>

              </button>

            </div>

          </div>

          {/* SYSTEM STATUS */}

          <div className="border-t border-white/10 p-4">

            <div className="rounded-xl bg-white/5 p-4">

              <div className="flex items-center gap-2">

                <span className="h-2 w-2 rounded-full bg-green-400" />

                <span className="text-xs text-white/70">
                  System Online
                </span>

              </div>

              <p className="mt-2 text-[11px] leading-relaxed text-white/40">
                Connected to MetricMind analytics engine
              </p>

            </div>

          </div>

        </aside>

        {/* =====================================================
            MAIN
        ===================================================== */}

        <section className="flex min-w-0 flex-1 flex-col">

          {/* ===================================================
              HEADER
          =================================================== */}

          <header
            className="
              sticky top-0 z-30
              flex h-[72px]
              items-center justify-between
              border-b border-[#192A56]/10
              bg-[#FCFBFB]/95
              px-4
              backdrop-blur
              sm:px-6
              lg:px-8
            "
          >

            <div className="flex items-center gap-3">

              {/* MOBILE MENU */}

              <button
                onClick={() => setSidebarOpen(true)}
                className="
                  rounded-lg p-2
                  hover:bg-[#192A56]/5
                  lg:hidden
                "
              >

                <Menu size={22} />

              </button>

              <div>

                <p className="text-xs text-gray-500">
                  Analytics Workspace
                </p>

                <h2 className="text-base font-semibold">
                  Good evening
                </h2>

              </div>

            </div>

            {/* CONNECTION */}

            <div className="flex items-center gap-2 rounded-full border border-[#192A56]/10 bg-white px-3 py-2">

              <span className="h-2 w-2 rounded-full bg-green-500" />

              <span className="hidden text-xs font-medium text-gray-600 sm:block">
                Connected
              </span>

            </div>

          </header>

          {/* ===================================================
              CONTENT
          =================================================== */}

          <div className="flex flex-1 flex-col">

            {/* =================================================
                WELCOME SCREEN
            ================================================= */}

            {messages.length === 0 && !isLoading && (
              <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 py-10 sm:px-6 lg:px-8">

                {/* ICON */}

                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#192A56]">

                  <Sparkles
                    size={28}
                    className="text-[#F7D794]"
                  />

                </div>

                {/* TITLE */}

                <div className="text-center">

                  <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    Ask your data anything.
                  </h1>

                  <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
                    Ask business questions in natural language
                    and MetricMind will turn your questions into
                    clear insights and interactive visualizations.
                  </p>

                </div>

                {/* SUGGESTIONS */}

                <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                  {suggestions.map((suggestion) => {

                    const Icon = suggestion.icon;

                    return (
                      <button
                        key={suggestion.title}
                        onClick={() =>
                          handleSuggestionClick(
                            suggestion.description
                          )
                        }
                        className="
                          group
                          rounded-2xl
                          border border-[#192A56]/10
                          bg-white
                          p-5
                          text-left
                          shadow-sm
                          transition
                          hover:-translate-y-0.5
                          hover:border-[#EDA6A3]
                          hover:shadow-md
                        "
                      >

                        <div className="flex items-center justify-between">

                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F7D794]/40">

                            <Icon
                              size={19}
                              className="text-[#192A56]"
                            />

                          </div>

                          <ChevronRight
                            size={18}
                            className="
                              text-gray-300
                              transition
                              group-hover:translate-x-1
                              group-hover:text-[#192A56]
                            "
                          />

                        </div>

                        <h3 className="mt-4 text-sm font-semibold">
                          {suggestion.title}
                        </h3>

                        <p className="mt-1 text-xs leading-5 text-gray-500">
                          {suggestion.description}
                        </p>

                      </button>
                    );
                  })}

                </div>

              </div>
            )}

            {/* =================================================
                CHAT MESSAGES
            ================================================= */}

            {messages.length > 0 && (
              <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:px-8">

                <div className="space-y-7">

                  {messages.map((item) => (

                    <div
                      key={item.id}
                      className={`
                        flex gap-3 sm:gap-4
                        ${
                          item.role === "user"
                            ? "justify-end"
                            : "justify-start"
                        }
                      `}
                    >

                      {/* BOT ICON */}

                      {item.role === "assistant" && (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#192A56]">

                          <Bot
                            size={18}
                            className="text-[#F7D794]"
                          />

                        </div>
                      )}

                      {/* MESSAGE CONTENT */}

                      <div
                        className={`
                          min-w-0
                          ${
                            item.role === "user"
                              ? "max-w-[85%] sm:max-w-[75%]"
                              : "w-full max-w-[850px]"
                          }
                        `}
                      >

                        {/* NAME */}

                        <div
                          className={`
                            mb-1
                            text-xs
                            font-semibold
                            opacity-60
                            ${
                              item.role === "user"
                                ? "text-right"
                                : "text-left"
                            }
                          `}
                        >

                          {item.role === "user"
                            ? "You"
                            : "MetricMind"}

                        </div>

                        {/* MESSAGE */}

                        <div
                          className={`
                            rounded-2xl
                            px-4 py-3
                            text-sm
                            leading-6
                            ${
                              item.role === "user"
                                ? "rounded-br-md bg-[#192A56] text-white"
                                : "rounded-bl-md border border-[#192A56]/10 bg-white text-gray-700 shadow-sm"
                            }
                          `}
                        >

                          <p>
                            {item.content}
                          </p>

                        </div>

                        {/* =================================================
                            ASSISTANT RESULT
                        ================================================= */}

                        {item.role === "assistant" &&
                          item.chart && (
                            <div className="mt-5">

                              {/* ================================
                                  DYNAMIC CHART
                              ================================= */}

                              <DynamicChart
                                type={
                                  item.chart.type
                                }
                                title={
                                  item.chart.title
                                }
                                subtitle={
                                  item.chart.subtitle
                                }
                                data={
                                  item.chart.data
                                }
                              />

                              {/* ================================
                                  ACTION BUTTONS
                              ================================= */}

                              <div className="mt-3 flex flex-wrap gap-2">

                                {/* API BUTTON */}

                                <button
                                  onClick={() =>
                                    setShowApiCall(
                                      showApiCall ===
                                        item.id
                                        ? null
                                        : item.id
                                    )
                                  }
                                  className="
                                    rounded-lg
                                    border
                                    border-[#192A56]/15
                                    bg-white
                                    px-3 py-2
                                    text-xs
                                    font-medium
                                    text-[#192A56]
                                    transition
                                    hover:border-[#192A56]/30
                                    hover:bg-[#192A56]/5
                                  "
                                >

                                  {showApiCall ===
                                  item.id
                                    ? "Hide API Call"
                                    : "View API Call"}

                                </button>

                                {/* SQL BUTTON */}

                                <button
                                  onClick={() =>
                                    setShowSql(
                                      showSql ===
                                        item.id
                                        ? null
                                        : item.id
                                    )
                                  }
                                  className="
                                    rounded-lg
                                    border
                                    border-[#192A56]/15
                                    bg-white
                                    px-3 py-2
                                    text-xs
                                    font-medium
                                    text-[#192A56]
                                    transition
                                    hover:border-[#192A56]/30
                                    hover:bg-[#192A56]/5
                                  "
                                >

                                  {showSql === item.id
                                    ? "Hide SQL"
                                    : "View SQL"}

                                </button>

                              </div>

                              {/* ================================
                                  API PANEL
                              ================================= */}

                              {showApiCall ===
                                item.id &&
                                item.api && (
                                  <div className="mt-3 rounded-xl border border-[#192A56]/10 bg-[#192A56] p-4">

                                    <div className="mb-3 flex items-center justify-between">

                                      <h4 className="text-xs font-semibold text-[#F7D794]">
                                        API CALL
                                      </h4>

                                      <span className="rounded-md bg-white/10 px-2 py-1 text-[10px] text-white/60">
                                        {
                                          item.api
                                            .method
                                        }
                                      </span>

                                    </div>

                                    <p className="mb-3 text-xs text-white/60">
                                      {
                                        item.api
                                          .endpoint
                                      }
                                    </p>

                                    <pre className="overflow-x-auto whitespace-pre-wrap text-xs leading-5 text-white/80">
{JSON.stringify(
  item.api.request,
  null,
  2
)}
                                    </pre>

                                  </div>
                                )}

                              {/* ================================
                                  SQL PANEL
                              ================================= */}

                              {showSql ===
                                item.id &&
                                item.sql && (
                                  <div className="mt-3 rounded-xl border border-[#192A56]/10 bg-[#192A56] p-4">

                                    <div className="mb-3">

                                      <h4 className="text-xs font-semibold text-[#F7D794]">
                                        SQL QUERY
                                      </h4>

                                    </div>

                                    <pre className="overflow-x-auto whitespace-pre-wrap text-xs leading-5 text-white/80">
                                      {
                                        item.sql
                                      }
                                    </pre>

                                  </div>
                                )}

                            </div>
                          )}

                      </div>

                      {/* USER ICON */}

                      {item.role === "user" && (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EDA6A3]">

                          <User
                            size={18}
                            className="text-[#192A56]"
                          />

                        </div>
                      )}

                    </div>

                  ))}

                  {/* =================================================
                      LOADING
                  ================================================= */}

                  {isLoading && (
                    <div className="flex gap-3 sm:gap-4">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#192A56]">

                        <Bot
                          size={18}
                          className="text-[#F7D794]"
                        />

                      </div>

                      <div>

                        <div className="mb-1 text-xs font-semibold opacity-60">
                          MetricMind
                        </div>

                        <div className="rounded-2xl rounded-bl-md border border-[#192A56]/10 bg-white px-5 py-4 shadow-sm">

                          <div className="flex gap-1">

                            <span className="h-2 w-2 animate-bounce rounded-full bg-[#192A56]" />

                            <span
                              className="h-2 w-2 animate-bounce rounded-full bg-[#192A56]"
                              style={{
                                animationDelay:
                                  "150ms",
                              }}
                            />

                            <span
                              className="h-2 w-2 animate-bounce rounded-full bg-[#192A56]"
                              style={{
                                animationDelay:
                                  "300ms",
                              }}
                            />

                          </div>

                        </div>

                      </div>

                    </div>
                  )}

                </div>

              </div>
            )}

            {/* =================================================
                INPUT
            ================================================= */}

            <div className="sticky bottom-0 border-t border-[#192A56]/10 bg-[#FCFBFB]/95 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">

              <div className="mx-auto w-full max-w-4xl">

                <div className="relative rounded-2xl border border-[#192A56]/15 bg-white shadow-sm transition focus-within:border-[#192A56]/30 focus-within:shadow-md">

                  <textarea
                    value={input}
                    onChange={(event) =>
                      setInput(
                        event.target.value
                      )
                    }
                    onKeyDown={handleKeyDown}
                    placeholder="Ask a question about your business data..."
                    rows={1}
                    className="
                      min-h-[58px]
                      w-full
                      resize-none
                      rounded-2xl
                      bg-transparent
                      px-5
                      py-4
                      pr-16
                      text-sm
                      text-[#192A56]
                      outline-none
                      placeholder:text-gray-400
                    "
                  />

                  {/* SEND BUTTON */}

                  <button
                    onClick={handleSend}
                    disabled={
                      !input.trim() ||
                      isLoading
                    }
                    className="
                      absolute
                      bottom-2.5
                      right-2.5
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-xl
                      bg-[#192A56]
                      text-white
                      transition
                      hover:bg-[#22366d]
                      disabled:cursor-not-allowed
                      disabled:opacity-30
                    "
                    aria-label="Send message"
                  >

                    <Send size={17} />

                  </button>

                </div>

                <div className="mt-2 px-1">

                  <p className="text-[10px] text-gray-400 sm:text-xs">
                    Press Enter to send · Shift + Enter for a new line
                  </p>

                </div>

              </div>

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}
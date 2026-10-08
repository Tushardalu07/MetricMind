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
    title: "Business Summary",
    description: "Show me the overall business summary",
    icon: BarChart3,
  },
  {
    title: "Q3 Revenue",
    description: "How did Q3 revenue perform?",
    icon: Database,
  },
  {
    title: "Cost & Profit",
    description: "Show me cost and profit summary",
    icon: MessageSquare,
  },
];

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showApiCall, setShowApiCall] = useState<number | null>(null);
  const [showSql, setShowSql] = useState<number | null>(null);

  /* =======================================================
     FASTAPI BASE URL
  ======================================================= */

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:8000";

  /* =======================================================
     DETECT ENDPOINT
  ======================================================= */

  const detectEndpoint = (question: string): string => {
    const q = question.toLowerCase().trim();

    /* =====================================================
       1. COST / PROFIT / MARGIN
    ===================================================== */

    if (
      q.includes("cost") ||
      q.includes("margin") ||
      q.includes("expense") ||
      q.includes("expenses") ||
      q.includes("profit margin") ||
      q.includes("cost breakdown") ||
      q.includes("cost and profit")
    ) {
      return "/summary/cost-profit";
    }

    /* =====================================================
       2. QUARTER
    ===================================================== */

    const quarterMatch = q.match(/\bq([1-4])\b/i);

    if (quarterMatch) {
      return `/summary/quarter/Q${quarterMatch[1]}`;
    }

    if (
      q.includes("first quarter") ||
      q.includes("quarter one")
    ) {
      return "/summary/quarter/Q1";
    }

    if (
      q.includes("second quarter") ||
      q.includes("quarter two")
    ) {
      return "/summary/quarter/Q2";
    }

    if (
      q.includes("third quarter") ||
      q.includes("quarter three")
    ) {
      return "/summary/quarter/Q3";
    }

    if (
      q.includes("fourth quarter") ||
      q.includes("quarter four")
    ) {
      return "/summary/quarter/Q4";
    }

    /* =====================================================
       3. YEAR
    ===================================================== */

    const yearMatch = q.match(/\b(20\d{2})\b/);

    if (yearMatch) {
      return `/summary/year/${yearMatch[1]}`;
    }

    /* =====================================================
       4. MONTH
    ===================================================== */

    const months: Record<string, number> = {
      january: 1,
      february: 2,
      march: 3,
      april: 4,
      may: 5,
      june: 6,
      july: 7,
      august: 8,
      september: 9,
      october: 10,
      november: 11,
      december: 12,
    };

    const detectedMonth = Object.keys(months).find((month) =>
      q.includes(month)
    );

    if (detectedMonth) {
      return `/summary/month/${months[detectedMonth]}`;
    }

    /* =====================================================
       5. REGION
    ===================================================== */

    const regions: Record<string, string> = {
      europe: "Europe",
      european: "Europe",
      asia: "Asia",
      asian: "Asia",
      africa: "Africa",
      african: "Africa",
      "north america": "North America",
      "south america": "South America",
      "middle east": "Middle East",
      oceania: "Oceania",
    };

    const detectedRegion = Object.keys(regions).find((region) =>
      q.includes(region)
    );

    if (detectedRegion) {
      return `/summary/region/${encodeURIComponent(
        regions[detectedRegion]
      )}`;
    }

    /* =====================================================
       6. PRODUCT
    ===================================================== */

    const productMatch = q.match(
      /\bproduct\s*[:\-]?\s*(.+)/i
    );

    if (productMatch) {
      const product = productMatch[1]
        .replace(/[?.!]+$/, "")
        .trim();

      if (product) {
        return `/summary/product/${encodeURIComponent(product)}`;
      }
    }

    /* =====================================================
       7. CHANNEL
    ===================================================== */

    const channelMatch = q.match(
      /\bchannel\s*[:\-]?\s*(.+)/i
    );

    if (channelMatch) {
      const channel = channelMatch[1]
        .replace(/[?.!]+$/, "")
        .trim();

      if (channel) {
        return `/summary/channel/${encodeURIComponent(channel)}`;
      }
    }

    /* =====================================================
       8. GENERAL BUSINESS SUMMARY
    ===================================================== */

    if (
      q.includes("summary") ||
      q.includes("overall") ||
      q.includes("business performance") ||
      q.includes("business doing") ||
      q.includes("overall performance") ||
      q.includes("total revenue") ||
      q.includes("total profit") ||
      q.includes("total sales") ||
      q.includes("sales summary") ||
      q.includes("overall sales") ||
      q.includes("overall revenue")
    ) {
      return "/summary";
    }

    /* =====================================================
       9. SALES / REVENUE / PROFIT QUESTIONS
    ===================================================== */

    if (
      q.includes("sales") ||
      q.includes("revenue") ||
      q.includes("profit") ||
      q.includes("orders") ||
      q.includes("units") ||
      q.includes("performance")
    ) {
      return "/summary";
    }

    /* =====================================================
       10. DEFAULT
    ===================================================== */

    return "/summary";
  };

  /* =======================================================
     CREATE CHART
  ======================================================= */

  const createChart = (
    endpoint: string,
    data: any
  ): ChartInfo | undefined => {
    /* =====================================================
       COST & PROFIT
    ===================================================== */

    if (endpoint === "/summary/cost-profit") {
      return {
        type: "bar",
        title: "Cost & Profit Breakdown",
        subtitle: "Financial breakdown from FastAPI",
        data: {
          labels: [
            "Material Cost",
            "Shipping Cost",
            "Labor Cost",
            "Marketing Cost",
            "Profit",
          ],
          values: [
            Number(data?.total_material_cost ?? 0),
            Number(data?.total_shipping_cost ?? 0),
            Number(data?.total_labor_cost ?? 0),
            Number(data?.total_marketing_cost ?? 0),
            Number(data?.total_profit ?? 0),
          ],
        },
      };
    }

    /* =====================================================
       REGION
    ===================================================== */

    if (endpoint.startsWith("/summary/region/")) {
      const region = decodeURIComponent(
        endpoint.replace("/summary/region/", "")
      );

      return {
        type: "bar",
        title: `${region} Performance`,
        subtitle: `Revenue and profit for ${region}`,
        data: {
          labels: ["Revenue", "Profit"],
          values: [
            Number(data?.total_revenue ?? 0),
            Number(data?.total_profit ?? 0),
          ],
        },
      };
    }

    /* =====================================================
       PRODUCT
    ===================================================== */

    if (endpoint.startsWith("/summary/product/")) {
      const product = decodeURIComponent(
        endpoint.replace("/summary/product/", "")
      );

      return {
        type: "bar",
        title: `${product} Performance`,
        subtitle: "Product revenue and profit",
        data: {
          labels: ["Revenue", "Profit"],
          values: [
            Number(data?.total_revenue ?? 0),
            Number(data?.total_profit ?? 0),
          ],
        },
      };
    }

    /* =====================================================
       CHANNEL
    ===================================================== */

    if (endpoint.startsWith("/summary/channel/")) {
      const channel = decodeURIComponent(
        endpoint.replace("/summary/channel/", "")
      );

      return {
        type: "bar",
        title: `${channel} Channel Performance`,
        subtitle: "Channel revenue and profit",
        data: {
          labels: ["Revenue", "Profit"],
          values: [
            Number(data?.total_revenue ?? 0),
            Number(data?.total_profit ?? 0),
          ],
        },
      };
    }

    /* =====================================================
       QUARTER
    ===================================================== */

    if (endpoint.startsWith("/summary/quarter/")) {
      const quarter = endpoint.replace(
        "/summary/quarter/",
        ""
      );

      return {
        type: "bar",
        title: `${quarter} Performance`,
        subtitle: "Quarterly revenue and profit",
        data: {
          labels: ["Revenue", "Profit"],
          values: [
            Number(data?.total_revenue ?? 0),
            Number(data?.total_profit ?? 0),
          ],
        },
      };
    }

    /* =====================================================
       YEAR
    ===================================================== */

    if (endpoint.startsWith("/summary/year/")) {
      const year = endpoint.replace(
        "/summary/year/",
        ""
      );

      return {
        type: "bar",
        title: `${year} Performance`,
        subtitle: "Annual revenue and profit",
        data: {
          labels: ["Revenue", "Profit"],
          values: [
            Number(data?.total_revenue ?? 0),
            Number(data?.total_profit ?? 0),
          ],
        },
      };
    }

    /* =====================================================
       MONTH
    ===================================================== */

    if (endpoint.startsWith("/summary/month/")) {
      const month = endpoint.replace(
        "/summary/month/",
        ""
      );

      const monthNames = [
        "",
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      const monthNumber = Number(month);

      const monthName =
        monthNames[monthNumber] || `Month ${month}`;

      return {
        type: "bar",
        title: `${monthName} Performance`,
        subtitle: "Monthly revenue and profit",
        data: {
          labels: ["Revenue", "Profit"],
          values: [
            Number(data?.total_revenue ?? 0),
            Number(data?.total_profit ?? 0),
          ],
        },
      };
    }

    /* =====================================================
       GENERAL SUMMARY
    ===================================================== */

    if (endpoint === "/summary") {
      return {
        type: "bar",
        title: "Overall Business Performance",
        subtitle: "Total revenue and profit",
        data: {
          labels: ["Revenue", "Profit"],
          values: [
            Number(data?.total_revenue ?? 0),
            Number(data?.total_profit ?? 0),
          ],
        },
      };
    }

    return undefined;
  };

  /* =======================================================
     CREATE RESPONSE TEXT
  ======================================================= */

  const createAnswer = (
    endpoint: string,
    data: any
  ): string => {
    if (endpoint === "/summary/cost-profit") {
      const totalCost = Number(
        data?.total_cost ?? 0
      );

      const profit = Number(
        data?.total_profit ?? 0
      );

      const margin = Number(
        data?.average_margin_percent ?? 0
      );

      return (
        `Here is the cost and profit summary. ` +
        `Total cost is ${totalCost.toLocaleString()}, ` +
        `total profit is ${profit.toLocaleString()}, ` +
        `and the average margin is ${margin}%.`
      );
    }

    const revenue = Number(
      data?.total_revenue ?? 0
    );

    const profit = Number(
      data?.total_profit ?? 0
    );

    const orders = Number(
      data?.total_orders ?? 0
    );

    const units = Number(
      data?.total_units_sold ?? 0
    );

    let context = "business";

    if (endpoint.includes("/region/")) {
      context = "regional";
    } else if (endpoint.includes("/product/")) {
      context = "product";
    } else if (endpoint.includes("/channel/")) {
      context = "channel";
    } else if (endpoint.includes("/quarter/")) {
      context = "quarterly";
    } else if (endpoint.includes("/year/")) {
      context = "annual";
    } else if (endpoint.includes("/month/")) {
      context = "monthly";
    }

    return (
      `Here is the ${context} business summary. ` +
      `Total revenue is ${revenue.toLocaleString()}, ` +
      `total profit is ${profit.toLocaleString()}, ` +
      `total orders are ${orders.toLocaleString()}, ` +
      `and total units sold are ${units.toLocaleString()}.`
    );
  };

  /* =======================================================
     SEND MESSAGE
  ======================================================= */

  const handleSend = async (
    providedQuestion?: string
  ) => {
    const question =
      (providedQuestion ?? input).trim();

    if (!question || isLoading) {
      return;
    }

    /* User message */

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

    try {
      /* Determine endpoint */

      const endpoint = detectEndpoint(question);

      /* Call FastAPI */

      const response = await fetch(
        `${API_BASE_URL}${endpoint}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      /* Handle errors */

      if (!response.ok) {
        let detail =
          `Backend returned status ${response.status}`;

        try {
          const errorData =
            await response.json();

          if (errorData?.detail) {
            detail = errorData.detail;
          }
        } catch {
          // Ignore invalid error response
        }

        throw new Error(detail);
      }

      /* Read JSON */

      const data = await response.json();

      console.log(
        "MetricMind FastAPI response:",
        data
      );

      /* Answer */

      const answer = createAnswer(
        endpoint,
        data
      );

      /* Chart */

      const chart = createChart(
        endpoint,
        data
      );

      /* API information */

      const api: ApiInfo = {
        method: "GET",
        endpoint: `${API_BASE_URL}${endpoint}`,
        request: {
          question,
        },
      };

      /* Assistant message */

      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: answer,
        chart,
        api,

        /*
         * The current FastAPI backend does not
         * return SQL, so we intentionally do not
         * generate fake SQL here.
         */
      };

      setMessages((previous) => [
        ...previous,
        assistantMessage,
      ]);
    } catch (error) {
      console.error(
        "MetricMind API error:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Unable to connect to the backend.";

      const errorMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content:
          `I couldn't retrieve the result from the FastAPI backend.\n\n` +
          `${message}\n\n` +
          `Please make sure FastAPI is running on ${API_BASE_URL}.`,
        api: {
          method: "GET",
          endpoint: `${API_BASE_URL}/summary`,
          request: {
            question,
          },
        },
      };

      setMessages((previous) => [
        ...previous,
        errorMessage,
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  /* =======================================================
     SUGGESTION CLICK
  ======================================================= */

  const handleSuggestionClick = (
    text: string
  ) => {
    handleSend(text);
  };

  /* =======================================================
     NEW CHAT
  ======================================================= */

  const handleNewChat = () => {
    setMessages([]);
    setInput("");
    setIsLoading(false);
    setShowApiCall(null);
    setShowSql(null);
    setSidebarOpen(false);
  };

  /* =======================================================
     KEYBOARD
  ======================================================= */

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

  /* =======================================================
     UI
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#FCFBFB] text-[#192A56]">
      <div className="flex min-h-screen">

        {/* =================================================
            MOBILE OVERLAY
        ================================================= */}

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            onClick={() =>
              setSidebarOpen(false)
            }
          />
        )}

        {/* =================================================
            SIDEBAR
        ================================================= */}

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

          {/* Logo */}

          <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F7D794]">
                <BarChart3
                  size={21}
                  className="text-[#192A56]"
                />
              </div>

              <div>
                <h1 className="text-base font-bold">
                  MetricMind
                </h1>

                <p className="text-[10px] text-white/50">
                  Semantic BI Engine
                </p>
              </div>

            </div>

            <button
              onClick={() =>
                setSidebarOpen(false)
              }
              className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white lg:hidden"
            >
              <X size={18} />
            </button>
          </div>

          {/* New Chat */}

          <div className="px-4 py-4">
            <button
              onClick={handleNewChat}
              className="
                flex w-full items-center
                gap-3 rounded-xl
                bg-[#F7D794]
                px-4 py-3
                text-sm font-semibold
                text-[#192A56]
                transition
                hover:bg-[#f4cf7a]
              "
            >
              <Plus size={17} />
              <span>New Chat</span>
            </button>
          </div>

          {/* Recent Conversations */}

          <div className="px-4">
            <p className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-wider text-white/40">
              Recent Conversations
            </p>

            <div className="space-y-1">

              <button
                onClick={() =>
                  handleSuggestionClick(
                    "Show me European sales"
                  )
                }
                className="
                  flex w-full items-center
                  gap-3 rounded-xl
                  px-3 py-3
                  text-left
                  text-sm text-white/75
                  transition
                  hover:bg-white/10
                "
              >
                <MessageSquare size={15} />

                <span className="truncate">
                  European Sales Analysis
                </span>
              </button>

              <button
                onClick={() =>
                  handleSuggestionClick(
                    "How did Q3 revenue perform?"
                  )
                }
                className="
                  flex w-full items-center
                  gap-3 rounded-xl
                  px-3 py-3
                  text-left
                  text-sm text-white/75
                  transition
                  hover:bg-white/10
                "
              >
                <MessageSquare size={15} />

                <span className="truncate">
                  Q3 Revenue Performance
                </span>
              </button>

              <button
                onClick={() =>
                  handleSuggestionClick(
                    "Show me regional performance"
                  )
                }
                className="
                  flex w-full items-center
                  gap-3 rounded-xl
                  px-3 py-3
                  text-left
                  text-sm text-white/75
                  transition
                  hover:bg-white/10
                "
              >
                <MessageSquare size={15} />

                <span className="truncate">
                  Regional Comparison
                </span>
              </button>

            </div>
          </div>

          {/* Sidebar Bottom */}

          <div className="mt-auto border-t border-white/10 p-4">
            <div className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-3">

              <div className="relative">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EDA6A3]">
                  <User
                    size={17}
                    className="text-[#192A56]"
                  />
                </div>

                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#192A56] bg-green-400" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-xs font-semibold">
                  Analytics Workspace
                </p>

                <div className="mt-0.5 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400" />

                  <span className="text-[10px] text-white/50">
                    System Online
                  </span>
                </div>
              </div>

            </div>
          </div>

        </aside>

        {/* =================================================
            MAIN
        ================================================= */}

        <section className="flex min-h-screen min-w-0 flex-1 flex-col">

          {/* Header */}

          <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-[#192A56]/10 bg-[#FCFBFB]/95 px-4 backdrop-blur sm:px-6 lg:px-8">

            <div className="flex items-center gap-3">

              <button
                onClick={() =>
                  setSidebarOpen(true)
                }
                className="rounded-xl p-2 hover:bg-[#192A56]/5 lg:hidden"
              >
                <Menu size={21} />
              </button>

              <div>
                <p className="text-xs font-medium text-gray-400">
                  Analytics Workspace
                </p>

                <h2 className="text-sm font-semibold text-[#192A56]">
                  Good evening
                </h2>
              </div>

            </div>

            <div className="flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-green-500" />

              <span className="text-[10px] font-medium text-green-700 sm:text-xs">
                Connected
              </span>
            </div>

          </header>

          {/* Content */}

          <div className="flex flex-1 flex-col">

            {messages.length === 0 ? (

              /* =================================================
                 WELCOME
              ================================================= */

              <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-8">

                <div className="w-full max-w-4xl">

                  <div className="mb-10 text-center">

                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#192A56] shadow-lg">
                      <Sparkles
                        size={28}
                        className="text-[#F7D794]"
                      />
                    </div>

                    <h2 className="text-3xl font-bold tracking-tight text-[#192A56] sm:text-4xl">
                      Ask your data anything.
                    </h2>

                    <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
                      Ask questions about sales,
                      revenue, profit, regions,
                      products, and business
                      performance using natural
                      language.
                    </p>

                  </div>

                  {/* Suggestions */}

                  <div className="grid gap-3 sm:grid-cols-3">

                    {suggestions.map(
                      (suggestion) => {
                        const Icon =
                          suggestion.icon;

                        return (
                          <button
                            key={suggestion.title}
                            onClick={() =>
                              handleSuggestionClick(
                                suggestion.description
                              )
                            }
                            className="
                              group rounded-2xl
                              border border-[#192A56]/10
                              bg-white
                              p-5
                              text-left
                              shadow-sm
                              transition
                              hover:-translate-y-0.5
                              hover:border-[#192A56]/20
                              hover:shadow-md
                            "
                          >

                            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#F7D794]/40">
                              <Icon
                                size={19}
                                className="text-[#192A56]"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-2">

                              <div>
                                <h3 className="text-sm font-semibold text-[#192A56]">
                                  {suggestion.title}
                                </h3>

                                <p className="mt-1 text-xs leading-5 text-gray-500">
                                  {suggestion.description}
                                </p>
                              </div>

                              <ChevronRight
                                size={16}
                                className="shrink-0 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-[#192A56]"
                              />

                            </div>

                          </button>
                        );
                      }
                    )}

                  </div>

                  <p className="mt-8 text-center text-[10px] text-gray-400 sm:text-xs">
                    Powered by MetricMind Semantic BI Engine
                  </p>

                </div>

              </div>

            ) : (

              /* =================================================
                 CHAT
              ================================================= */

              <div className="flex flex-1 flex-col">

                <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6 lg:px-8">

                  <div className="space-y-6">

                    {messages.map(
                      (message) => (

                        <div
                          key={message.id}
                          className={`flex gap-3 sm:gap-4 ${
                            message.role ===
                            "user"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >

                          {/* Assistant Icon */}

                          {message.role ===
                            "assistant" && (
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#192A56]">
                              <Bot
                                size={18}
                                className="text-[#F7D794]"
                              />
                            </div>
                          )}

                          {/* Message Content */}

                          <div
                            className={`min-w-0 ${
                              message.role ===
                              "user"
                                ? "max-w-[85%] sm:max-w-[75%]"
                                : "w-full max-w-[90%] sm:max-w-[85%]"
                            }`}
                          >

                            <div
                              className={`mb-1 text-xs font-semibold opacity-60 ${
                                message.role ===
                                "user"
                                  ? "text-right"
                                  : ""
                              }`}
                            >
                              {message.role ===
                              "user"
                                ? "You"
                                : "MetricMind"}
                            </div>

                            <div
                              className={`rounded-2xl px-5 py-4 shadow-sm ${
                                message.role ===
                                "user"
                                  ? "rounded-br-md bg-[#192A56] text-white"
                                  : "rounded-bl-md border border-[#192A56]/10 bg-white text-[#192A56]"
                              }`}
                            >

                              <p className="whitespace-pre-wrap text-sm leading-6">
                                {message.content}
                              </p>

                            </div>

                            {/* Chart */}

                            {message.chart && (
                              <div className="mt-4">
                                <DynamicChart
                                  type={
                                    message.chart
                                      .type
                                  }
                                  title={
                                    message.chart
                                      .title
                                  }
                                  subtitle={
                                    message.chart
                                      .subtitle
                                  }
                                  data={
                                    message.chart
                                      .data
                                  }
                                />
                              </div>
                            )}

                            {/* Action Buttons */}

                            {message.role ===
                              "assistant" && (
                              <div className="mt-3 flex flex-wrap gap-2">

                                {/* View API */}

                                {message.api && (
                                  <button
                                    onClick={() =>
                                      setShowApiCall(
                                        showApiCall ===
                                        message.id
                                          ? null
                                          : message.id
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
                                    message.id
                                      ? "Hide API Call"
                                      : "View API Call"}
                                  </button>
                                )}

                                {/* View SQL */}

                                {message.sql && (
                                  <button
                                    onClick={() =>
                                      setShowSql(
                                        showSql ===
                                        message.id
                                          ? null
                                          : message.id
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
                                    {showSql ===
                                    message.id
                                      ? "Hide SQL"
                                      : "View SQL"}
                                  </button>
                                )}

                              </div>
                            )}

                            {/* API PANEL */}

                            {showApiCall ===
                              message.id &&
                              message.api && (
                                <div className="mt-3 rounded-xl border border-[#192A56]/10 bg-[#192A56] p-4">

                                  <div className="mb-3 flex items-center justify-between">

                                    <h4 className="text-xs font-semibold text-[#F7D794]">
                                      API CALL
                                    </h4>

                                    <span className="rounded-md bg-white/10 px-2 py-1 text-[10px] text-white/60">
                                      {message.api.method}
                                    </span>

                                  </div>

                                  <p className="mb-3 break-all rounded-lg bg-white/5 px-3 py-2 text-xs text-white/70">
                                    {message.api.endpoint}
                                  </p>

                                  <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-white/40">
                                    Request
                                  </p>

                                  <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-black/10 p-3 text-xs leading-5 text-white/80">
                                    {JSON.stringify(
                                      message.api.request,
                                      null,
                                      2
                                    )}
                                  </pre>

                                </div>
                              )}

                            {/* SQL PANEL */}

                            {showSql ===
                              message.id &&
                              message.sql && (
                                <div className="mt-3 rounded-xl border border-[#192A56]/10 bg-[#192A56] p-4">

                                  <h4 className="mb-3 text-xs font-semibold text-[#F7D794]">
                                    SQL QUERY
                                  </h4>

                                  <pre className="overflow-x-auto whitespace-pre-wrap text-xs leading-5 text-white/80">
                                    {message.sql}
                                  </pre>

                                </div>
                              )}

                          </div>

                          {/* User Icon */}

                          {message.role ===
                            "user" && (
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EDA6A3]">
                              <User
                                size={18}
                                className="text-[#192A56]"
                              />
                            </div>
                          )}

                        </div>
                      )
                    )}

                    {/* Loading */}

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

                  <button
                    onClick={() =>
                      handleSend()
                    }
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
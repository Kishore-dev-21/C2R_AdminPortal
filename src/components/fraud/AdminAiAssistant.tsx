import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Send,
  Shield,
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  Bot,
  User,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AiAssistantService, AiQueryResponse } from "@/services/fraudEngine/aiAssistantService";

interface AdminAiAssistantProps {
  onTriggerAction?: (actionText: string) => void;
}

export const AdminAiAssistant: React.FC<AdminAiAssistantProps> = ({ onTriggerAction }) => {
  const { user } = useAuth();
  const [inputQuery, setInputQuery] = useState("");
  const [messages, setMessages] = useState<
    { sender: "user" | "ai"; text: string; data?: AiQueryResponse }[]
  >([
    {
      sender: "ai",
      text: `Hello ${user?.name || "Administrator"}. I am your Click2Ration Fraud Intelligence Assistant. You are authenticated as **${user?.role}** for **${user?.district || user?.shop || "National Jurisdiction"}**. Ask any question regarding behavioral drift, pre-delivery holds, or collusion networks.`,
    },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);

  const quickPrompts = [
    "Which shops show unusual rice consumption?",
    "Which transactions require review?",
    "Are there suspicious delivery-agent patterns?",
    "Which districts show increasing anomaly levels?",
  ];

  const handleSend = (queryText: string) => {
    if (!queryText.trim()) return;

    const userMsg = queryText;
    setInputQuery("");
    setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setIsProcessing(true);

    setTimeout(() => {
      const response = AiAssistantService.processQuery({
        query: userMsg,
        role: user?.role || "SUPER_ADMIN",
        district: user?.district,
        shop: user?.shop,
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: response.responseMarkdown,
          data: response,
        },
      ]);
      setIsProcessing(false);
    }, 400);
  };

  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden flex flex-col h-[560px]">
      {/* Header */}
      <div className="p-3.5 border-b border-border bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">Ask Click2Ration AI</h4>
            <p className="text-[10px] text-muted-foreground">
              RBAC-Scoped Decision Support Assistant · {user?.role} ({user?.district || "All"})
            </p>
          </div>
        </div>
        <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground">
          v2.4 Engine
        </span>
      </div>

      {/* Quick Prompts */}
      <div className="p-2.5 border-b border-border/60 bg-muted/10 flex items-center gap-2 overflow-x-auto">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase shrink-0">
          Suggestions:
        </span>
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleSend(prompt)}
            className="text-[11px] px-2.5 py-1 rounded-full bg-background hover:bg-muted border border-border text-muted-foreground hover:text-foreground shrink-0 transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-start gap-2.5 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                msg.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
              }`}
            >
              {msg.sender === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5 text-primary" />}
            </div>

            <div
              className={`p-3.5 rounded-xl max-w-[82%] text-xs leading-relaxed ${
                msg.sender === "user"
                  ? "bg-primary text-primary-foreground rounded-tr-none font-medium"
                  : "bg-muted/40 border border-border text-foreground rounded-tl-none space-y-2.5"
              }`}
            >
              <div className="whitespace-pre-line">{msg.text}</div>

              {/* Metrics Cards if available */}
              {msg.data?.metrics && (
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/60">
                  {msg.data.metrics.map((m, idx) => (
                    <div key={idx} className="p-2 rounded bg-background border border-border text-center">
                      <span className="text-[9px] text-muted-foreground block uppercase font-semibold">
                        {m.label}
                      </span>
                      <span className="text-xs font-bold text-foreground mt-0.5 block">{m.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Suggested Action Button */}
              {msg.data?.suggestedAction && onTriggerAction && (
                <div className="pt-2">
                  <button
                    onClick={() => onTriggerAction(msg.data!.suggestedAction!)}
                    className="flex items-center gap-1.5 text-[11px] font-semibold text-primary hover:underline"
                  >
                    <span>{msg.data.suggestedAction}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-border bg-muted/20 flex items-center gap-2">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend(inputQuery)}
          placeholder="Ask about shops, risk anomalies, delivery agents, or district trends..."
          className="flex-1 text-xs p-2.5 rounded-lg bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          onClick={() => handleSend(inputQuery)}
          disabled={!inputQuery.trim() || isProcessing}
          className="p-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

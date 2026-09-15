import React, { useEffect, useRef, useState } from "react";
import { Sparkles, Send, Trash2, ShieldAlert } from "lucide-react";
import api, { friendlyError } from "../services/api.js";
import { Button, Card, EmptyState, ConfirmDialog, pushToast } from "../components/ui.jsx";
import { ChatBubble } from "../components/Memory.jsx";

const SUGGESTED = [
  "What was my favorite childhood memory?",
  "What lessons did I learn from my career?",
  "Tell me about my biggest achievement.",
  "What advice did I preserve about learning?",
  "What places did I travel to?",
  "What values were important to me?",
];

export default function EchoMindAI() {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [conversationId, setConversationId] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [asking, setAsking] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    api
      .get("/ai/history")
      .then((res) => {
        setMessages(res.data.history);
        if (res.data.history.length > 0) {
          setConversationId(res.data.history[res.data.history.length - 1].conversationId);
        }
      })
      .finally(() => setLoadingHistory(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, asking]);

  async function ask(q) {
    const text = (q ?? question).trim();
    if (!text || asking) return;
    setQuestion("");
    setAsking(true);
    setMessages((prev) => [
      ...prev,
      { id: `tmp-${Date.now()}`, role: "user", message: text, sources: [], timestamp: new Date().toISOString() },
    ]);
    try {
      const res = await api.post("/ai/query", { question: text, conversationId });
      setConversationId(res.data.conversationId);
      setMessages((prev) => [
        ...prev,
        {
          id: `resp-${Date.now()}`,
          role: "assistant",
          message: res.data.answer,
          sources: res.data.sources,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      pushToast(friendlyError(err, "EchoMind AI couldn't answer that."), "error");
    } finally {
      setAsking(false);
    }
  }

  async function clearChat() {
    try {
      await api.delete("/ai/history");
      setMessages([]);
      setConversationId(null);
      setConfirmOpen(false);
    } catch (err) {
      pushToast(friendlyError(err, "Unable to clear chat."), "error");
    }
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-accent">
            <Sparkles size={18} />
          </div>
          <div>
            <h1 className="font-bold text-ink">EchoMind AI</h1>
            <p className="text-xs text-muted">Reconstructions built only from your preserved memories</p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setConfirmOpen(true)}>
            <Trash2 size={14} /> Clear chat
          </Button>
        )}
      </div>

      <div className="mb-4 rounded-xl bg-amber-50 text-amber-800 text-xs px-4 py-3 flex items-start gap-2">
        <ShieldAlert size={15} className="shrink-0 mt-0.5" />
        EchoMind AI is generating a reconstruction from preserved memories. It is not the actual person.
      </div>

      <Card className="flex-1 min-h-0 flex flex-col p-4 sm:p-5">
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {loadingHistory ? (
            <div className="h-full flex items-center justify-center text-sm text-muted">Loading conversation...</div>
          ) : messages.length === 0 ? (
            <EmptyState
              icon={<Sparkles size={36} />}
              title="Ask EchoMind about your memories."
              description="Try one of the suggested questions below, or ask your own."
            />
          ) : (
            messages.map((m) => <ChatBubble key={m.id} message={m} />)
          )}
          {asking && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-soft">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-pulse"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {messages.length === 0 && !loadingHistory && (
          <div className="flex flex-wrap gap-2 mt-4">
            {SUGGESTED.map((s) => (
              <button
                key={s}
                onClick={() => ask(s)}
                className="text-xs bg-primary/5 hover:bg-primary/10 text-primary rounded-full px-3 py-1.5 focus-ring transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask();
          }}
          className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4"
        >
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about a memory, a lesson, a place..."
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus-ring focus:border-primary"
          />
          <Button type="submit" disabled={asking || !question.trim()}>
            <Send size={16} />
          </Button>
        </form>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={clearChat}
        title="Clear this conversation?"
        description="Your chat history with EchoMind AI will be permanently deleted."
        confirmLabel="Clear chat"
      />
    </div>
  );
}

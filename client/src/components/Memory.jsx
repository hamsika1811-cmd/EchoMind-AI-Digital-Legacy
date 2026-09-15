import React from "react";
import { Link } from "react-router-dom";
import { Image, Music, Video, FileText, Type, MapPin, Lock, Users } from "lucide-react";
import { Card, Badge } from "./ui.jsx";

export const MEDIA_ICONS = {
  text: Type,
  image: Image,
  audio: Music,
  video: Video,
  document: FileText,
};

export function MediaBadge({ mediaType }) {
  const Icon = MEDIA_ICONS[mediaType] || Type;
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-muted">
      <Icon size={14} /> {mediaType}
    </span>
  );
}

export function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function StatCard({ icon: Icon, label, value, tone = "indigo" }) {
  const tones = {
    indigo: "bg-primary/10 text-primary",
    gold: "bg-accent/15 text-accent",
    green: "bg-emerald-100 text-emerald-700",
  };
  return (
    <Card className="p-5 flex items-center gap-4 animate-fade-in">
      <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${tones[tone]}`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-ink leading-tight">{value}</p>
        <p className="text-xs text-muted font-medium truncate">{label}</p>
      </div>
    </Card>
  );
}

export function MemoryCard({ memory }) {
  return (
    <Link to={`/memories/${memory.id}`}>
      <Card className="p-5 h-full flex flex-col gap-3 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 animate-fade-in">
        <div className="flex items-start justify-between gap-2">
          <Badge tone="indigo">{memory.category}</Badge>
          {memory.privacy === "private" ? (
            <span title="Private"><Lock size={14} className="text-muted" /></span>
          ) : (
            <span title="Shared with trusted people"><Users size={14} className="text-muted" /></span>
          )}
        </div>
        <h3 className="font-semibold text-ink leading-snug line-clamp-2">{memory.title}</h3>
        <p className="text-sm text-muted line-clamp-2">{memory.description}</p>
        <div className="mt-auto flex items-center justify-between pt-2 border-t border-slate-50 text-xs text-muted">
          <span>{formatDate(memory.date)}</span>
          <MediaBadge mediaType={memory.mediaType} />
        </div>
        {memory.location && (
          <div className="flex items-center gap-1 text-xs text-muted -mt-1">
            <MapPin size={12} /> {memory.location}
          </div>
        )}
        {memory.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {memory.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} tone="slate">#{tag}</Badge>
            ))}
          </div>
        )}
      </Card>
    </Link>
  );
}

export function Timeline({ memories }) {
  return (
    <div className="relative pl-6 sm:pl-8">
      <div className="absolute left-2 sm:left-3 top-1 bottom-1 w-px bg-slate-200" />
      <div className="space-y-6">
        {memories.map((memory) => (
          <div key={memory.id} className="relative animate-fade-in">
            <div className="absolute -left-[22px] sm:-left-[26px] top-1.5 h-3 w-3 rounded-full bg-accent ring-4 ring-white" />
            <Link to={`/memories/${memory.id}`}>
              <Card className="p-4 sm:p-5 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <span className="text-xs font-semibold text-accent">{formatDate(memory.date)}</span>
                  <Badge tone="indigo">{memory.category}</Badge>
                </div>
                <h3 className="font-semibold text-ink">{memory.title}</h3>
                <p className="text-sm text-muted mt-1 line-clamp-2">{memory.description}</p>
              </Card>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChatBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}>
      <div className={`max-w-[85%] sm:max-w-[75%] ${isUser ? "order-2" : ""}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser ? "bg-primary text-white rounded-br-sm" : "bg-white border border-slate-100 text-ink rounded-bl-sm shadow-soft"
          }`}
        >
          {!isUser && (
            <p className="text-[11px] font-semibold uppercase tracking-wide text-accent mb-1.5">AI Reconstruction</p>
          )}
          <p>{message.message}</p>
        </div>
        {!isUser && message.sources?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5 pl-1">
            <span className="text-[11px] text-muted font-medium mr-1">Sources:</span>
            {message.sources.map((s) => (
              <Link key={s.id} to={`/memories/${s.id}`}>
                <Badge tone="gold">{s.title}</Badge>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

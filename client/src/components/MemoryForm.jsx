import React, { useState } from "react";
import { Shuffle } from "lucide-react";
import { Button, Input, Textarea, Select } from "./ui.jsx";

export const CATEGORIES = [
  "Childhood", "Family", "Education", "Career", "Achievements",
  "Travel", "Relationships", "Skills", "Life Lessons", "Important Moments", "Other",
];

export const MEDIA_TYPES = ["text", "image", "audio", "video", "document"];

export const MEMORY_PROMPTS = [
  "Tell me about a moment that changed your life.",
  "What is one lesson you learned the hard way?",
  "What advice would you give your younger self?",
  "Describe a moment you felt proud.",
  "What traditions are important to your family?",
  "What skills would you like future generations to remember?",
  "What is a story you never want your family to forget?",
];

export default function MemoryForm({ initial, onSubmit, submitting, submitLabel = "Save memory" }) {
  const [form, setForm] = useState(
    initial || {
      title: "",
      description: "",
      date: "",
      category: "Other",
      tags: "",
      location: "",
      mediaType: "text",
      privacy: "private",
    }
  );
  const [errors, setErrors] = useState({});
  const [prompt, setPrompt] = useState("");

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function generatePrompt() {
    const next = MEMORY_PROMPTS[Math.floor(Math.random() * MEMORY_PROMPTS.length)];
    setPrompt(next);
  }

  function validate() {
    const next = {};
    if (!form.title.trim()) next.title = "Please give this memory a title.";
    if (!form.date) next.date = "Please choose a date.";
    if (!form.category) next.category = "Please choose a category.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    const tags = typeof form.tags === "string"
      ? form.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : form.tags;
    onSubmit({ ...form, tags });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-xl bg-primary/5 p-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ink mb-1">Need inspiration?</p>
          <p className="text-sm text-muted">{prompt || "Generate a prompt to help you get started."}</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={generatePrompt} className="shrink-0">
          <Shuffle size={14} /> Generate Prompt
        </Button>
      </div>

      <Input label="Memory title" value={form.title} onChange={(e) => update("title", e.target.value)} error={errors.title} placeholder="e.g. First Day of School" />
      <Textarea label="Description / story" rows={5} value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Tell the story behind this memory..." />

      <div className="grid sm:grid-cols-2 gap-4">
        <Input label="Date" type="date" value={form.date} onChange={(e) => update("date", e.target.value)} error={errors.date} />
        <Select label="Category" value={form.category} onChange={(e) => update("category", e.target.value)}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Input label="Location" value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="e.g. Hyderabad, India" />
        <Select label="Media type" value={form.mediaType} onChange={(e) => update("mediaType", e.target.value)}>
          {MEDIA_TYPES.map((m) => <option key={m} value={m}>{m[0].toUpperCase() + m.slice(1)}</option>)}
        </Select>
      </div>

      <Input
        label="Tags"
        value={Array.isArray(form.tags) ? form.tags.join(", ") : form.tags}
        onChange={(e) => update("tags", e.target.value)}
        placeholder="comma, separated, tags"
      />

      <Select label="Privacy" value={form.privacy} onChange={(e) => update("privacy", e.target.value)}>
        <option value="private">Private — only me</option>
        <option value="shared">Shared — visible to people with matching access</option>
      </Select>

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}

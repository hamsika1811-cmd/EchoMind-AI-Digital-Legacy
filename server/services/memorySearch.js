// ---------------------------------------------------------------------------
// EchoMind AI — local keyword-based retrieval engine.
// Deliberately dependency-free so the prototype works with no external LLM.
// The interface here (question in, {answer, sources} out) is designed so a
// real LLM call can be swapped in later without touching the routes.
// ---------------------------------------------------------------------------

const STOPWORDS = new Set([
  "a", "an", "the", "of", "in", "on", "at", "to", "for", "and", "or", "is",
  "was", "were", "are", "did", "do", "does", "what", "when", "where", "who",
  "how", "my", "me", "i", "about", "tell", "from", "with", "that", "this",
  "it", "did", "learn", "learned", "please", "can", "you", "your",
]);

function extractKeywords(question) {
  return question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOPWORDS.has(word));
}

function scoreMemory(memory, keywords) {
  const haystacks = {
    title: (memory.title || "").toLowerCase(),
    description: (memory.description || "").toLowerCase(),
    category: (memory.category || "").toLowerCase(),
    location: (memory.location || "").toLowerCase(),
    tags: (memory.tags || []).join(" ").toLowerCase(),
  };

  let score = 0;
  keywords.forEach((keyword) => {
    if (haystacks.title.includes(keyword)) score += 3;
    if (haystacks.tags.includes(keyword)) score += 2.5;
    if (haystacks.category.includes(keyword)) score += 2;
    if (haystacks.description.includes(keyword)) score += 1.5;
    if (haystacks.location.includes(keyword)) score += 1;
  });
  return score;
}

function generateAnswer(question, topMemories) {
  if (topMemories.length === 0) {
    return "I couldn't find a preserved memory that directly answers that question. Try asking about a specific category, place, or time in life, or add more memories to the vault.";
  }

  const themeWords = new Set();
  topMemories.forEach((m) => {
    m.tags.forEach((t) => themeWords.add(t));
  });
  const themes = Array.from(themeWords).slice(0, 3).join(", ");

  const intro = topMemories.length === 1
    ? `Based on the memory preserved in this vault, "${topMemories[0].title}"`
    : `Based on ${topMemories.length} memories preserved in this vault`;

  const bodyParts = topMemories.map((m) => {
    const trimmed = m.description.length > 220 ? `${m.description.slice(0, 217)}...` : m.description;
    return trimmed;
  });

  return `${intro}${topMemories.length === 1 ? " describes" : ", the recurring themes are"} ${themes ? `${themes}. ` : ""}${bodyParts[0]}${
    bodyParts.length > 1 ? ` Another preserved memory adds: ${bodyParts[1]}` : ""
  }`;
}

function queryMemories(question, memories) {
  const keywords = extractKeywords(question);

  if (keywords.length === 0) {
    return {
      answer:
        "I couldn't find a preserved memory that directly answers that question. Try being a little more specific — a place, a category, or a time in life.",
      sources: [],
    };
  }

  const scored = memories
    .map((memory) => ({ memory, score: scoreMemory(memory, keywords) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const topMemories = scored.map((entry) => entry.memory);
  const answer = generateAnswer(question, topMemories);

  const sources = topMemories.map((m) => ({
    id: m.id,
    title: m.title,
    category: m.category,
    date: m.date,
  }));

  return { answer, sources };
}

module.exports = { queryMemories, extractKeywords };

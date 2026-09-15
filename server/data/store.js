const bcrypt = require("bcryptjs");
const { v4: uuid } = require("uuid");

// ---------------------------------------------------------------------------
// In-memory data store for the EchoMind prototype.
// Structured so each collection could later be swapped for a MongoDB
// collection or a Postgres table with minimal changes to the routes.
// ---------------------------------------------------------------------------

const db = {
  users: [],
  memories: [],
  accessGrants: [],
  auditLogs: [],
  chatMessages: [],
};

function addAudit({ userId, action, actor, resourceType, resourceId, description, status = "success" }) {
  const entry = {
    id: uuid(),
    userId,
    action,
    actor,
    resourceType,
    resourceId,
    description,
    status,
    timestamp: new Date().toISOString(),
  };
  db.auditLogs.unshift(entry);
  return entry;
}

function seed() {
  const demoPasswordHash = bcrypt.hashSync("demo1234", 10);

  const demoUser = {
    id: "demo-user-1",
    name: "Ananya Rao",
    email: "demo@echomind.app",
    passwordHash: demoPasswordHash,
    avatar: "AR",
    bio: "Storyteller, lifelong learner, and keeper of family recipes. Building a legacy vault so the people I love never lose the things I want them to remember.",
    values: ["Curiosity", "Kindness", "Perseverance", "Family first"],
    skills: ["Kuchipudi dance", "Watercolor painting", "Python programming", "Storytelling"],
    legacyMessage:
      "If you're reading this, know that every memory here was preserved on purpose — for you. Take what's useful, laugh at the embarrassing parts, and keep the story going.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 240).toISOString(),
  };
  db.users.push(demoUser);

  const categories = {
    childhood: "Childhood",
    family: "Family",
    education: "Education",
    career: "Career",
    achievements: "Achievements",
    travel: "Travel",
    relationships: "Relationships",
    skills: "Skills",
    lessons: "Life Lessons",
    moments: "Important Moments",
  };

  const demoMemories = [
    {
      title: "Childhood Summer at Grandma's House",
      category: categories.childhood,
      date: "1999-05-12",
      tags: ["summer", "grandma", "village", "mangoes"],
      location: "Vizag, India",
      mediaType: "image",
      description:
        "Every May we packed up and spent six weeks at my grandmother's house. Mango trees in the backyard, sleeping on the terrace under mosquito nets, and a radio that only played one station. It's still the measure I use for 'a good summer.'",
    },
    {
      title: "First Day of School",
      category: categories.childhood,
      date: "2000-06-01",
      tags: ["school", "firsts", "nervous"],
      location: "Hyderabad, India",
      mediaType: "text",
      description:
        "I cried at the gate and my mother had to peel my fingers off her sari. Twenty minutes later I didn't want to leave. That's basically been my relationship with every new beginning since.",
    },
    {
      title: "Graduation Day",
      category: categories.education,
      date: "2015-05-20",
      tags: ["graduation", "college", "milestone", "family"],
      location: "Chennai, India",
      mediaType: "image",
      description:
        "Four years of all-nighters ended with a cap toss and my dad crying more than I did. I remember thinking: this is the last time everything is this simple.",
    },
    {
      title: "My First Coding Project",
      category: categories.career,
      date: "2014-02-10",
      tags: ["coding", "learning", "programming", "python"],
      location: "College Hostel Room 214",
      mediaType: "document",
      description:
        "Built a clunky little Python script to track my hostel mess bills. It broke constantly, but it was the first time I felt like I could make a computer do something useful for me. That feeling never really went away.",
    },
    {
      title: "Family Celebration — Diwali 2018",
      category: categories.family,
      date: "2018-11-07",
      tags: ["diwali", "family", "tradition", "lights"],
      location: "Home, Hyderabad",
      mediaType: "video",
      description:
        "The whole family together for the first time in three years. My grandmother lit the first diya like she does every year, and told the same story about why we celebrate. I recorded it this time so no one forgets the words.",
    },
    {
      title: "First Internship",
      category: categories.career,
      date: "2013-06-15",
      tags: ["internship", "career", "learning", "first job"],
      location: "Bangalore, India",
      mediaType: "text",
      description:
        "Six weeks at a small startup, mostly fixing bugs no one else wanted to touch. My manager told me 'a good engineer is just a very persistent debugger,' and I still think about that every time something breaks.",
    },
    {
      title: "Favorite Travel Memory — Backpacking Ladakh",
      category: categories.travel,
      date: "2019-08-22",
      tags: ["travel", "mountains", "adventure", "ladakh"],
      location: "Ladakh, India",
      mediaType: "image",
      description:
        "Twelve days, no signal, and the clearest night sky I've ever seen. Somewhere on the road to Pangong Tso I stopped worrying about my five-year plan for the first time in years.",
    },
    {
      title: "A Lesson About Failure",
      category: categories.lessons,
      date: "2016-09-03",
      tags: ["failure", "lesson", "resilience", "advice"],
      location: "Hyderabad, India",
      mediaType: "text",
      description:
        "My first product launch failed publicly. I wanted to quit for about a week. What I learned: the failure is rarely as visible to others as it feels to you, and the recovery matters more than the fall.",
    },
    {
      title: "Learning Kuchipudi",
      category: categories.skills,
      date: "2005-03-01",
      tags: ["dance", "kuchipudi", "art", "discipline"],
      location: "Hyderabad, India",
      mediaType: "video",
      description:
        "Started classical dance training at age eight because my mother insisted. Hated it for the first year, loved it for the next fifteen. It taught me more about discipline than anything else in my life.",
    },
    {
      title: "First Stage Performance",
      category: categories.achievements,
      date: "2007-12-14",
      tags: ["dance", "performance", "achievement", "stage"],
      location: "Ravindra Bharathi, Hyderabad",
      mediaType: "audio",
      description:
        "My debut solo performance. I forgot an entire sequence halfway through and improvised until it came back to me. Nobody in the audience noticed. My teacher did, and told me that was the real lesson.",
    },
    {
      title: "Important Career Advice from My Mentor",
      category: categories.lessons,
      date: "2017-04-18",
      tags: ["advice", "career", "mentor", "learning"],
      location: "Bangalore, India",
      mediaType: "text",
      description:
        "My first manager told me: 'Optimize for learning in your twenties, not for title.' I didn't understand it then. I've repeated it to three junior engineers since, and I understand it a lot better each time.",
    },
    {
      title: "Family Tradition — Sunday Cooking",
      category: categories.family,
      date: "2021-01-10",
      tags: ["family", "tradition", "cooking", "recipes"],
      location: "Home, Hyderabad",
      mediaType: "document",
      description:
        "Every Sunday my grandmother and I cook one dish from her childhood and I write down the recipe, because she's never once measured anything in her life and I'm terrified of losing these before I learn them properly.",
    },
    {
      title: "Meeting My Closest Friend",
      category: categories.relationships,
      date: "2012-08-09",
      tags: ["friendship", "college", "relationships"],
      location: "Chennai, India",
      mediaType: "text",
      description:
        "We were assigned as lab partners and argued about circuit diagrams for two hours before realizing we agreed the whole time. Thirteen years later she's still the first call I make on a bad day.",
    },
  ];

  demoMemories.forEach((m, idx) => {
    const memory = {
      id: uuid(),
      userId: demoUser.id,
      title: m.title,
      description: m.description,
      date: m.date,
      category: m.category,
      tags: m.tags,
      location: m.location,
      mediaType: m.mediaType,
      mediaUrl:
        m.mediaType === "text"
          ? null
          : `https://picsum.photos/seed/echomind-${idx}/640/400`,
      privacy: idx % 4 === 0 ? "private" : "shared",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * (240 - idx * 10)).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * (240 - idx * 10)).toISOString(),
    };
    db.memories.push(memory);
    addAudit({
      userId: demoUser.id,
      action: "Memory Created",
      actor: demoUser.name,
      resourceType: "memory",
      resourceId: memory.id,
      description: `${demoUser.name} preserved a new memory: "${memory.title}"`,
    });
  });

  const grant1 = {
    id: uuid(),
    ownerId: demoUser.id,
    recipientName: "Rahul Menon",
    recipientEmail: "rahul.menon@example.com",
    accessLevel: "Memory Chat",
    allowedCategories: ["Family", "Life Lessons", "Achievements"],
    allowedTags: [],
    releaseCondition: "Immediate",
    releaseDate: null,
    status: "Active",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
  };
  const grant2 = {
    id: uuid(),
    ownerId: demoUser.id,
    recipientName: "Priya Sharma",
    recipientEmail: "priya.sharma@example.com",
    accessLevel: "Full Legacy Access",
    allowedCategories: [],
    allowedTags: [],
    releaseCondition: "Scheduled",
    releaseDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(),
    status: "Scheduled",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
  };
  const grant3 = {
    id: uuid(),
    ownerId: demoUser.id,
    recipientName: "Arjun Verma",
    recipientEmail: "arjun.verma@example.com",
    accessLevel: "View Only",
    allowedCategories: ["Travel", "Skills"],
    allowedTags: [],
    releaseCondition: "Event-based",
    releaseDate: null,
    status: "Revoked",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
  };
  db.accessGrants.push(grant1, grant2, grant3);

  addAudit({
    userId: demoUser.id,
    action: "Access Granted",
    actor: demoUser.name,
    resourceType: "access",
    resourceId: grant1.id,
    description: `${demoUser.name} granted Rahul Menon "Memory Chat" access`,
  });
  addAudit({
    userId: demoUser.id,
    action: "Access Granted",
    actor: demoUser.name,
    resourceType: "access",
    resourceId: grant2.id,
    description: `${demoUser.name} granted Priya Sharma "Full Legacy Access" (scheduled)`,
  });
  addAudit({
    userId: demoUser.id,
    action: "Access Revoked",
    actor: demoUser.name,
    resourceType: "access",
    resourceId: grant3.id,
    description: `${demoUser.name} revoked Arjun Verma's access`,
  });
  addAudit({
    userId: demoUser.id,
    action: "Memory Viewed",
    actor: "Rahul Menon",
    resourceType: "memory",
    resourceId: db.memories[4].id,
    description: `Rahul Menon viewed "${db.memories[4].title}"`,
  });
  addAudit({
    userId: demoUser.id,
    action: "AI Question Asked",
    actor: demoUser.name,
    resourceType: "chat",
    resourceId: null,
    description: `${demoUser.name} asked EchoMind AI "What lessons did I learn from my career?"`,
  });
  addAudit({
    userId: demoUser.id,
    action: "Login",
    actor: demoUser.name,
    resourceType: "auth",
    resourceId: demoUser.id,
    description: `${demoUser.name} logged in`,
  });
}

seed();

// Public, non-sensitive counters shown on the landing page before login.
function getPublicStats() {
  return {
    memoriesPreserved: db.memories.length * 118 + 342,
    legaciesStarted: 214,
    trustedConnections: db.accessGrants.length * 57 + 89,
    familiesUsingEchoMind: 96,
  };
}

module.exports = { db, addAudit, getPublicStats };

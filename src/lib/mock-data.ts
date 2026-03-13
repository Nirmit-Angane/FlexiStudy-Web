// src/lib/mock-data.ts

export const mockUser = {
  uid: "mock-student-123",
  displayName: "Priya Kulkarni",
  email: "student@flexistudy.com",
  role: "student",
  preferredStyle: "Visual Learner",
  level: 14,
  xpTotal: 1250,
  streakCount: 7,
  lastActiveDate: new Date().toISOString(),
};

export const mockActivityBreakdown = [
  { activity: "Math Practice", time: "45m", color: "bg-[#5B60E6]" }, // Purple/Blue
  { activity: "Science Video", time: "30m", color: "bg-[#F5A623]" }, // Orange
  { activity: "Flashcards", time: "11m", color: "bg-[#FF7059]" },    // Salmon/Coral
];

export const mockLessons = [
  {
    id: "lesson-1",
    userId: "mock-student-123",
    topic: "Photosynthesis",
    subject: "Science",
    difficulty: "Medium",
    style: "Example",
    status: "completed",
    slideCount: 5,
    finalScore: 4,
    createdAt: new Date().toISOString(),
  },
  {
    id: "lesson-2",
    userId: "mock-student-123",
    topic: "Quadratic Equations",
    subject: "Mathematics",
    difficulty: "Hard",
    style: "Visual",
    status: "completed",
    slideCount: 5,
    finalScore: 5,
    createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
  },
  {
    id: "lesson-3",
    userId: "mock-student-123",
    topic: "Python Functions",
    subject: "Technology",
    difficulty: "Medium",
    style: "Practical",
    status: "completed",
    slideCount: 5,
    finalScore: 2,
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
  },
  {
    id: "lesson-4",
    userId: "mock-student-123",
    topic: "French Revolution",
    subject: "History",
    difficulty: "Easy",
    style: "Example",
    status: "completed",
    slideCount: 5,
    finalScore: 5,
    createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
  },
];

export const mockStyleProgress = [
  { style: "Visual", totalAttempts: 10, avgScore: 0.78 },
  { style: "Example", totalAttempts: 15, avgScore: 0.91 },
  { style: "Practical", totalAttempts: 5, avgScore: 0.62 },
  { style: "Interactive", totalAttempts: 4, avgScore: 0.48 },
];

export const mockQuizResults = [
  { quiz: 1, score: 3, style: "Visual" },
  { quiz: 2, score: 4, style: "Example" },
  { quiz: 3, score: 5, style: "Example" },
  { quiz: 4, score: 4, style: "Visual" },
  { quiz: 5, score: 2, style: "Practical" },
  { quiz: 6, score: 5, style: "Example" },
  { quiz: 7, score: 4, style: "Interactive" },
  { quiz: 8, score: 5, style: "Visual" },
  { quiz: 9, score: 5, style: "Example" },
  { quiz: 10, score: 4, style: "Example" },
];

export const mockAnalyticsInsight = "You learn best through examples. Your example-style average (91%) is significantly higher than your interactive average (48%). Consider revisiting Python Functions using Example style.";

export const mockSubjectCounts = [
  { subject: "Science", count: 8 },
  { subject: "Mathematics", count: 6 },
  { subject: "Technology", count: 4 },
];

export const mockTopicsToRevisit = [
  { topic: "Python Functions", score: 2 },
  { topic: "Calculus", score: 2 },
];

export const mockSlides = [
  {
    id: "slide-1",
    slideIndex: 1,
    title: "What is Photosynthesis?",
    content: "Imagine a tiny factory inside every green leaf. This factory doesn't make cars or toys; it makes food! And its power source isn't electricity; it's sunlight. That's essentially what photosynthesis is: a process where plants use sunlight, water, and air to cook up their own meals.",
    type: "concept",
  },
  {
    id: "slide-2",
    slideIndex: 2,
    title: "The Magic Recipe",
    content: "To bake a cake, you need ingredients like flour, eggs, and sugar. For a plant to make food, its 'recipe' requires three key ingredients: 1. Water (absorbed through the roots), 2. Carbon Dioxide (breathed in from the air), and 3. Sunlight (caught by the leaves).",
    type: "detail",
  },
  {
    id: "slide-3",
    slideIndex: 3,
    title: "Chlorophyll: The Green Chef",
    content: "Why are plants green? Because of chlorophyll! Think of chlorophyll as the master chef in the leaf factory. It sits inside tiny kitchens called chloroplasts and has the special job of catching the sunlight, which acts as the fire to cook the meal.",
    type: "concept",
  },
  {
    id: "slide-4",
    slideIndex: 4,
    title: "The Finished Meal (and a Bonus!)",
    content: "Once the plant mixes the sunlight, water, and carbon dioxide together, it creates its food—a type of sugar called glucose. This glucose gives the plant the energy it needs to grow tall and strong. But the best part? During this cooking process, the plant releases a leftover product into the air: Oxygen! That's the very air we breathe.",
    type: "detail",
  },
  {
    id: "slide-5",
    slideIndex: 5,
    title: "Why Should We Care?",
    content: "Without photosynthesis, life as we know it would end. Plants wouldn't have food, meaning animals (and us!) wouldn't have plants to eat. Plus, we'd run out of fresh oxygen to breathe. So every time you see a green leaf, remember it's a tiny, life-saving food factory working hard in the sun.",
    type: "summary",
  },
];

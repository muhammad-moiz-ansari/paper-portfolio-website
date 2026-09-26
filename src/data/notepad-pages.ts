export interface NotepadPage {
  id: number;
  lines: string[];
}

// EDIT: NOTEPAD PAGES — the 4 pages of content shown in the About section notepad animation
// 1. DESKTOP DATA (Original wider lines)
export const notepadPages: NotepadPage[] = [
  {
    id: 1,
    lines: [
      "About Me:",
      "Moiz Ansari — CS student @ FAST-NUCES.",
      "Focusing on backend & system design.",
      "",
      "Current Interests:",
      "• Distributed systems",
      "• Backend development & UI designing",
      "• Building things that actually work.",
    ],
  },
  {
    id: 2,
    lines: [
      "Design Principles:",
      "",
      "• A UI is never finished, only iterated.",
      "• Clarity beats cleverness.",
      "• Fix the layout first, add the drop shadow",
      "  second."
    ],
  },
  {
    id: 3,
    lines: [
      "What I Can Build:",
      "",
      "1. Scalable RESTful APIs & backend architectures",
      "2. Robust database systems & query optimization",
      "3. High-performance computing & system design",
      "4. Full-stack platforms with role-based access",
    ],
  },
  {
    id: 4,
    lines: [
      "Favorite Quote:",
      "",
      "If you don’t build your dream, someone will hire ",
      "you to build theirs",
    ],
  },
];

// 2. MOBILE DATA (Wrapped to fit narrow screens)
export const notepadPagesMobile: NotepadPage[] = [
  {
    id: 1,
    lines: [
      "About Me:",
      "Moiz Ansari — CS student @ FAST-NUCES",
      "Focusing on backend & system design.",
      "",
      "Current Interests:",
      "• Distributed systems",
      "• Backend dev & UI design",
      "• Building things that actually work.",
    ],
  },
  {
    id: 2,
    lines: [
      "Design Principles:",
      "",
      "• A UI is never finished, only",
      "  iterated.",
      "• Clarity beats cleverness.",
      "• Fix the layout first, add the",
      "  drop shadow second."
    ],
  },
  {
    id: 3,
    lines: [
      "What I Can Build:",
      "",
      "1. Scalable RESTful APIs & backend",
      "   architectures",
      "2. Robust database systems",
      "3. High-performance computing",
      "4. Full-stack platforms",
    ],
  },
  {
    id: 4,
    lines: [
      "Favorite Quote:",
      "",
      "If you don’t build your dream, ",
      "someone will hire you to build",
      "theirs."
    ],
  },
];
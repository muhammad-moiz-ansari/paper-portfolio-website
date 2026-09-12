export interface ExperienceEntry {
  id: string;
  role: string;
  company: string;
  location: string;
  date: string;
  description: string;
  bullets: string[];
}

export const experienceEntries: ExperienceEntry[] = [
  {
    id: "systems-limited",
    role: "Data Analytics Intern",
    company: "Systems Limited",
    location: "Islamabad, Pakistan",
    date: "Jun 2026",
    description: "Data analytics and business intelligence internship.",
    bullets: [
      "// TODO: add bullet points once the internship wraps up",
    ],
  },
  {
    id: "fast-ta",
    role: "Teaching Assistant",
    company: "FAST NUCES",
    location: "Islamabad, Pakistan",
    date: "Jan 2025 – Jan 2026",
    description:
      "TA for Object-Oriented Programming and Data Structures & Algorithms courses.",
    bullets: [
      "Assisted 200+ students with OOP concepts in C++ and Java across weekly lab sessions",
      "Graded assignments and provided detailed feedback on code quality and design patterns",
      "Held office hours and review sessions before midterms and finals",
    ],
  },
  {
    id: "agristreams",
    role: "Cyber Security Intern",
    company: "AgriStreams",
    location: "Islamabad, Pakistan",
    date: "Jun 2025 – Aug 2025",
    description:
      "Security assessment and vulnerability analysis for IoT-based agricultural monitoring platforms.",
    bullets: [
      "Conducted vulnerability assessments on web applications and IoT firmware",
      "Implemented security hardening measures for cloud-deployed services",
      "Documented threat models and recommended mitigation strategies",
    ],
  },
  {
    id: "fast-lab",
    role: "Lab Demonstrator",
    company: "FAST NUCES",
    location: "Islamabad, Pakistan",
    date: "Jan 2025 – Jun 2025",
    description:
      "Demonstrated lab exercises for introductory programming courses.",
    bullets: [
      "Led hands-on lab sessions for 100+ freshmen learning C programming",
      "Debugged student code in real-time and explained common pitfalls",
      "Created supplementary practice problems and walkthrough guides",
    ],
  },
];

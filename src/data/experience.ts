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
    description: "Data Analytics  internship.",
    bullets: [
      "Built relational SQL databases structured around real-world company data requirements.", 
      "Advanced core data analytics skills through rigorous internal technical evaluations.",
      /*"Developed interactive Power BI dashboards to extract actionable insights from Excel data.",*/
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
      "Evaluated 40+ student quizzes and 100+ assignments, contributing to improved understanding of programming concepts",
      "Assisted instructors with lectures and student supports, leading to more efficient class discussions",
    ],
  },
  /*
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
  */
  {
    id: "fast-lab",
    role: "Lab Demonstrator",
    company: "FAST NUCES",
    location: "Islamabad, Pakistan",
    date: "Jan 2025 – Jun 2025",
    description:
      "LD for Digital Logic Design course.",
    bullets: [
      "Guided over 50 students in lab tasks, ensuring proper equipment use and understanding of concepts",
      "Assisted in evaluating lab work and provided personalized feedback, contributing to a more interactive and supportive environment",
    ],
  },
];

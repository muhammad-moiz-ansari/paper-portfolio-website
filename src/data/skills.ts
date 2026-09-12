export interface SkillCategory {
  label: string;
  items: string[];
}

export const skillCategories: SkillCategory[] = [
  {
    label: "Technical",
    items: [
      "C++",
      "Python",
      "Java",
      "TypeScript",
      "JavaScript",
      "SQL",
      "React",
      "Next.js",
      "Node.js",
      "Express",
      "Docker",
      "AWS",
      "Git",
      "Linux",
      "PostgreSQL",
      "MongoDB",
      "REST APIs",
      "Redis",
    ],
  },
  {
    label: "Professional",
    items: [
      "Problem Solving",
      "Team Collaboration",
      "Technical Writing",
      "Public Speaking",
      "Teaching",
      "Agile / Scrum",
    ],
  },
];

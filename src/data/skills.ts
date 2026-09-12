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
      "JavaScript",
      "SQL",
      "React",
      "Next.js",
      "Node.js",
      "Express",
      "Bash Scripting",
      "CUDA",
      "OpenACC",
      "x86 Assembly",
      "MongoDB",
    ],
  },
  {
    label: "Professional",
    items: [
      "Problem Solving",
      "Team Collaboration",
      "Project Coordination",
      "System Architecture",
      "Performance Optimization",
    ],
  },
];

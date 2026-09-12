export interface Project {
  id: string;
  title: string;
  description: string;
  bullets: string[];
  techStack: string[];
  date: string;
  githubLink: string;
  demoVideoUrl: string;
  image: string;
  isPlaceholder?: boolean;
}

export const projects: Project[] = [
  {
    id: "paper-portfolio",
    title: "Paper Portfolio Website",
    description:
      "A notebook-themed personal portfolio built with a custom paper/chalkboard design system.",
    bullets: [
      "Hand-drawn UI components: highlighter nav, pencil cursor trail, sticky notes, paper cards",
      "Dual theme system (paper light / chalkboard dark) with CSS custom properties",
      "Pen-writing and eraser animations with sprite tracking and sin-wave bobbing",
      "Fully accessible with prefers-reduced-motion fallbacks",
    ],
    techStack: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
    date: "2026",
    githubLink: "",
    demoVideoUrl: "",
    image: "",
  },
  {
    id: "distributed-kv",
    title: "Distributed Key-Value Store",
    description:
      "A fault-tolerant distributed KV store implementing Raft consensus for replication.",
    bullets: [
      "Leader election and log replication following the Raft paper",
      "Consistent hashing for key partition across nodes",
      "gRPC-based inter-node communication with automatic failover",
      "Benchmarked at 10k+ reads/sec with 3-node cluster",
    ],
    techStack: ["Go", "gRPC", "Docker", "etcd"],
    date: "2025",
    githubLink: "",
    demoVideoUrl: "",
    image: "",
  },
  {
    id: "smart-irrigation",
    title: "Smart Irrigation System",
    description:
      "IoT-based automated irrigation with real-time soil moisture monitoring and scheduling.",
    bullets: [
      "ESP32 microcontroller reading capacitive soil moisture sensors",
      "MQTT broker for sensor data ingestion into a cloud dashboard",
      "Rule-based and ML-predicted watering schedules",
      "Reduced water usage by ~35% in pilot test on campus garden",
    ],
    techStack: ["Python", "MQTT", "ESP32", "AWS IoT", "React"],
    date: "2025",
    githubLink: "",
    demoVideoUrl: "",
    image: "",
  },
  {
    id: "cli-task-manager",
    title: "CLI Task Manager",
    description:
      "A terminal-based task manager with local SQLite storage and rich TUI interface.",
    bullets: [
      "Add, edit, tag, and filter tasks from the command line",
      "Rich terminal UI with color-coded priority levels",
      "SQLite persistence with full-text search on task descriptions",
      "Export to Markdown or JSON for sharing",
    ],
    techStack: ["Python", "SQLite", "Rich", "Click"],
    date: "2024",
    githubLink: "",
    demoVideoUrl: "",
    image: "",
  },
  {
    id: "placeholder-1",
    title: "Coming Soon",
    description: "A new project is brewing — check back later!",
    bullets: [],
    techStack: [],
    date: "",
    githubLink: "",
    demoVideoUrl: "",
    image: "",
    isPlaceholder: true,
  },
  {
    id: "placeholder-2",
    title: "Coming Soon",
    description: "Something exciting is in the works.",
    bullets: [],
    techStack: [],
    date: "",
    githubLink: "",
    demoVideoUrl: "",
    image: "",
    isPlaceholder: true,
  },
  {
    id: "placeholder-3",
    title: "Coming Soon",
    description: "Stay tuned for more projects!",
    bullets: [],
    techStack: [],
    date: "",
    githubLink: "",
    demoVideoUrl: "",
    image: "",
    isPlaceholder: true,
  },
];

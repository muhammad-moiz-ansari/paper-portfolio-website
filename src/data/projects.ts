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

// EDIT: PROJECT DATA — array of project entries (title, description, tech stack, links, emoji icons)
export const projects: Project[] = [
  {
    id: "gpu-klt-tracker",
    title: "GPU-Accelerated KLT Feature Tracker",
    description: "Optimized image convolution using CUDA kernels achieving 9.2× speedup over CPU. Developed OpenACC implementation with 90% code reduction.",
    bullets: [],
    techStack: ["CUDA", "OpenACC", "C++", "GPU Computing"],
    date: "",
    githubLink: "https://github.com/MuhammaDaniyal/Complex_Computing_Problem",
    demoVideoUrl: "",
    image: "🚀",
    isPlaceholder: false
  },
  {
    id: "treaps-vs-bst",
    title: "Treaps vs. BST Social Media Feed",
    description: "Engineered randomized Treap achieving O(1) popularity queries vs O(n) BST traversal, processing 180GB Reddit dataset with stream parsing.",
    bullets: [],
    techStack: ["C++", "Algorithms", "Data Structures"],
    date: "",
    githubLink: "https://github.com/muhammad-moiz-ansari/Algo-Project-Treaps-vs-BST",
    demoVideoUrl: "",
    image: "📊",
    isPlaceholder: false
  },
  {
    id: "disaster-management-system",
    title: "Disaster Management System",
    description: "Full-stack disaster coordination system using JavaFX and SQL Server with MVC architecture, 19 normalized tables, and role-based dashboards.",
    bullets: [],
    techStack: ["JavaFX", "SQL Server", "MVC", "Database Design"],
    date: "",
    githubLink: "https://github.com/muhammad-moiz-ansari/Disaster_Management_System",
    demoVideoUrl: "https://www.linkedin.com/posts/muhammad-moiz-ansari_softwareengineering-javafx-sda-activity-7418047405771636737-VyRO?utm_source=share&utm_medium=member_desktop&rcm=ACoAAEqA44gBkfpa69s-MMipCLpurWW63XNM_ko",
    image: "🚨",
    isPlaceholder: false
  },
  {
    id: "aircontrolx",
    title: "AirControlX - Air Traffic Control",
    description: "Multi-process ATCS with IPC pipes and mutex synchronization. Achieved 40% reduction in scheduling latency using priority scheduling.",
    bullets: [],
    techStack: ["C++", "SFML", "IPC", "Multithreading"],
    date: "",
    githubLink: "https://github.com/muhammad-moiz-ansari/AirControlX-OS",
    demoVideoUrl: "",
    image: "✈️",
    isPlaceholder: false
  },
  {
    id: "gitlite",
    title: "GitLite Version Control System",
    description: "Custom version control system implementing core Git functionality with efficient data structures and file management.",
    bullets: [],
    techStack: ["C++", "Data Structures", "File Systems"],
    date: "",
    githubLink: "https://github.com/muhammad-moiz-ansari/GitLite-Versioning-System",
    demoVideoUrl: "",
    image: "📦",
    isPlaceholder: false
  },
  {
    id: "travelease",
    title: "TravelEase Database System",
    description: "Comprehensive travel management database with booking, scheduling, and customer management features.",
    bullets: [],
    techStack: ["SQL Server", "Database Design", "Normalization"],
    date: "",
    githubLink: "https://github.com/muhammad-moiz-ansari/TravelEase-Database-Management-System",
    demoVideoUrl: "",
    image: "✈️",
    isPlaceholder: false
  },
  {
    id: "centipede-game",
    title: "Centipede Game",
    description: "Classic arcade game implementation with smooth animations and collision mechanics.",
    bullets: [],
    techStack: ["C++", "SFML", "Game Physics"],
    date: "",
    githubLink: "https://github.com/muhammad-moiz-ansari/Centipede-Game-Remake",
    demoVideoUrl: "https://www.linkedin.com/posts/muhammad-moiz-ansari_cplusplus-sfml-gamedevelopment-activity-7349746889115754497-ZQww?utm_source=share&utm_medium=member_desktop&rcm=ACoAAEqA44gBkfpa69s-MMipCLpurWW63XNM_ko",
    image: "🐛",
    isPlaceholder: false
  }
];

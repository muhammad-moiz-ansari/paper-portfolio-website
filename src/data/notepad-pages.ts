export interface NotepadPage {
  id: number;
  lines: string[];
}

export const notepadPages: NotepadPage[] = [
  {
    id: 1,
    lines: [
      "-> whoami",
      "moiz-ansari . cs student @ fast-nuces . backend & system design . islamabad",
      "",
      "-> cat interests.txt",
      "distributed systems, cloud infra, competitive programming,",
      "cybersecurity, and building things that actually work.",
    ],
  },
  {
    id: 2,
    lines: [
      "-> cat principles.md",
      "",
      "// TODO: add your own principles/philosophy line(s) here",
      "",
    ],
  },
  {
    id: 3,
    lines: [
      "-> ./what-can-i-build.sh",
      "1. scalable backend APIs & microservices",
      "2. data pipelines & ETL workflows",
      "3. cloud-native deployments (Docker, AWS)",
      "4. full-stack web apps (Next.js, React)",
      "5. automation scripts & CLI tools",
    ],
  },
  {
    id: 4,
    lines: [
      '-> echo "$FAVORITE_QUOTE"',
      "",
      "// TODO: add a favorite quote here",
      "",
    ],
  },
];

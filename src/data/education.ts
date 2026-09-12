export interface EducationEntry {
  id: string;
  degree: string;
  institution: string;
  location: string;
  date: string;
  details: string[];
}

export interface AwardEntry {
  id: string;
  title: string;
  issuer: string;
  date: string;
}

export const educationEntries: EducationEntry[] = [
  {
    id: "fast-bscs",
    degree: "BS Computer Science",
    institution: "FAST NUCES",
    location: "Islamabad, Pakistan",
    date: "2023 – 2027 (Expected)",
    details: [
      "Relevant coursework: Data Structures, Algorithms, OOP, Database Systems, Operating Systems, Computer Networks",
      "Active member of the ACM and Cyber Security societies",
    ],
  },
];

export const awardEntries: AwardEntry[] = [
  {
    id: "deans-list",
    title: "Dean's List",
    issuer: "FAST NUCES",
    date: "Spring 2024",
  },
];

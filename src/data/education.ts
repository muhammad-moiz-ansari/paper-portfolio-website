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

// EDIT: EDUCATION DATA — array of education entries (degree, institution, location, date, coursework details)
export const educationEntries: EducationEntry[] = [
  {
    id: "fast-bscs",
    degree: "BS Computer Science",
    institution: "FAST NUCES",
    location: "Islamabad, Pakistan",
    date: "2023 – 2027 (Expected)",
    details: [
      "Relevant coursework: Data Structures, Algorithms, OOP, Database Systems, Operating Systems, Computer Networks, Agentic AI, Web Programming, Software Engineering",
],
  },
];

// EDIT: AWARDS DATA — array of awards and honors (title, issuer, date)
export const awardEntries: AwardEntry[] = [
  {
    id: "deans-list",
    title: "Dean's List",
    issuer: "FAST NUCES",
    date: "Fall 2026",
  },
];

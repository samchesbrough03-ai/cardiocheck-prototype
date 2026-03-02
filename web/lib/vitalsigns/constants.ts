export type VitalId = "cardio" | "nerve" | "struct" | "immune" | "muscle";

export type Vital = {
  id: VitalId;
  name: string;
  description: string;
  accentColor: string;
};

export type AssessmentQuestion = {
  id: string;
  vital: VitalId;
  weight: number;
  text: string;
  options: readonly string[];
};

export const VITALS: readonly Vital[] = [
  {
    id: "cardio",
    name: "CardioCheck",
    description: "Client contracts & revenue risk",
    accentColor: "#C1392B",
  },
  {
    id: "nerve",
    name: "NerveCheck",
    description: "IP ownership & gaps",
    accentColor: "#2471A3",
  },
  {
    id: "struct",
    name: "StructureCheck",
    description: "Supplier & partner contracts",
    accentColor: "#117A65",
  },
  {
    id: "immune",
    name: "ImmuneCheck",
    description: "Data privacy & GDPR",
    accentColor: "#6C3483",
  },
  {
    id: "muscle",
    name: "MuscleCheck",
    description: "People & talent agreements",
    accentColor: "#B7950B",
  },
] as const;

export const QUESTIONS: readonly AssessmentQuestion[] = [
  // CardioCheck
  {
    id: "c1",
    vital: "cardio",
    weight: 7,
    text: "Do you have written contracts with your top 10 customers?",
    options: ["Yes, all of them", "Most of them", "Some of them", "Rarely or none"],
  },
  {
    id: "c2",
    vital: "cardio",
    weight: 9,
    text: "Have you reviewed your customer contracts for change of control clauses?",
    options: [
      "Yes, recently reviewed",
      "Reviewed some time ago",
      "Not sure",
      "Never reviewed",
    ],
  },
  {
    id: "c3",
    vital: "cardio",
    weight: 8,
    text: "Are your key client contracts assigned to your company or a personal entity?",
    options: ["All assigned to company", "Mostly company", "Mixed", "Personal / unsure"],
  },
  // NerveCheck
  {
    id: "n1",
    vital: "nerve",
    weight: 9,
    text: "Have all contractors who built your core product signed IP assignment agreements?",
    options: ["Yes, all signed", "Most signed", "Some signed", "Not addressed"],
  },
  {
    id: "n2",
    vital: "nerve",
    weight: 7,
    text: "Do you use open source software in your product?",
    options: ["Yes, fully audited", "Yes, partially audited", "Yes, no audit done", "No open source"],
  },
  {
    id: "n3",
    vital: "nerve",
    weight: 6,
    text: "Is your key IP registered (trademarks, patents)?",
    options: ["Fully registered", "Some registered", "In progress", "Not registered"],
  },
  // StructureCheck
  {
    id: "s1",
    vital: "struct",
    weight: 8,
    text: "Do you rely on a single critical supplier or platform?",
    options: [
      "No single dependency",
      "1-2 managed dependencies",
      "Yes, some concern",
      "Yes, significant concern",
    ],
  },
  {
    id: "s2",
    vital: "struct",
    weight: 7,
    text: "When do your key supplier contracts expire?",
    options: [">2 years remain", "1-2 years remain", "<12 months", "Month-to-month / unsure"],
  },
  {
    id: "s3",
    vital: "struct",
    weight: 8,
    text: "Have you verified supplier contracts don't restrict assignment?",
    options: ["Yes, all verified", "Most verified", "Not sure", "Not checked"],
  },
  // ImmuneCheck
  {
    id: "i1",
    vital: "immune",
    weight: 9,
    text: "Are you GDPR compliant with documented policies and processes?",
    options: ["Fully compliant", "Mostly compliant", "In progress", "Not addressed"],
  },
  {
    id: "i2",
    vital: "immune",
    weight: 8,
    text: "Do you have data processing agreements with all data processors?",
    options: ["Yes, all in place", "Most in place", "Some in place", "None in place"],
  },
  {
    id: "i3",
    vital: "immune",
    weight: 7,
    text: "Have you had a data breach or privacy complaint?",
    options: ["No incidents", "Minor resolved incident", "Ongoing issue", "Significant incident"],
  },
  // MuscleCheck
  {
    id: "m1",
    vital: "muscle",
    weight: 9,
    text: "Do employees have written contracts with invention assignment clauses?",
    options: ["All employees, yes", "Most employees", "Some employees", "Not addressed"],
  },
  {
    id: "m2",
    vital: "muscle",
    weight: 7,
    text: "Do you have enforceable non-competes with key team members?",
    options: ["Yes, all key members", "Most key members", "Some", "None"],
  },
  {
    id: "m3",
    vital: "muscle",
    weight: 8,
    text: "Have you clearly addressed employee equity in written agreements?",
    options: ["Fully documented", "Mostly documented", "Partially", "Not addressed"],
  },
] as const;


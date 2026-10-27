export type Intention = "long-term" | "life-partner" | "exploring" | "figuring-out";

export const INTENTION_LABEL: Record<Intention, string> = {
  "long-term": "Long-term relationship",
  "life-partner": "Life partner",
  exploring: "Open to exploring a connection",
  "figuring-out": "Still figuring it out",
};

export const GENDERS = ["Women", "Men", "Non-binary people"] as const;
export type GenderPref = (typeof GENDERS)[number];
export type Gender = "Woman" | "Man" | "Non-binary";
export const GENDER_TO_PREF: Record<Gender, GenderPref> = {
  Woman: "Women",
  Man: "Men",
  "Non-binary": "Non-binary people",
};

export const INTERESTS = [
  "Books and reading",
  "Travel",
  "Fitness",
  "Food",
  "Music",
  "Art and design",
  "Nature",
  "Entrepreneurship",
  "Family",
  "Personal growth",
  "Volunteering",
  "Live music",
  "Cooking",
  "Film",
  "Hiking",
] as const;

export const PROMPT_QUESTIONS = [
  "A green flag I look for...",
  "The quickest way to my heart is...",
  "My ideal Sunday looks like...",
  "Something I could talk about for hours...",
  "A small thing that makes my day...",
  "We'll get along if...",
  "The most spontaneous thing I've done...",
  "My idea of a perfect first date...",
  "A hill I'll happily die on...",
  "Two truths and a lie.",
] as const;

export interface Prompt {
  question: string;
  answer: string;
}

export interface Profile {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  pronouns?: string;
  city: string;
  distanceKm: number;
  occupation: string;
  education?: string;
  languages: string[];
  intention: Intention;
  interests: string[];
  prompts: Prompt[];
  photos: string[];
  verified: boolean;
  /** Demo only: this fictional profile automatically likes you back. */
  likesBack: boolean;
  unavailable?: boolean;
}

export interface MyProfile {
  name: string;
  dob: string;
  city: string;
  pronouns: string;
  gender: Gender | "";
  occupation: string;
  education: string;
  languages: string[];
  intention: Intention | "";
  interests: string[];
  prompts: Prompt[];
  photos: string[];
}

export interface Preferences {
  genders: GenderPref[];
  ageMin: number;
  ageMax: number;
  distance: number;
  intentions: Intention[];
}

export type LikeTarget =
  | { type: "profile" }
  | { type: "prompt"; index: number }
  | { type: "photo"; index: number };

export interface Like {
  id: string;
  profileId: string;
  target: LikeTarget;
  comment?: string;
  at: number;
}

export interface Match {
  id: string;
  profileId: string;
  at: number;
  archived?: boolean;
  origin?: string;
}

export interface Message {
  id: string;
  matchId: string;
  from: "me" | "them";
  text: string;
  at: number;
  read: boolean;
  demo?: boolean;
}

export type DateType = "Coffee" | "Lunch" | "Dinner" | "Walk" | "Museum" | "Activity" | "Other";
export type DateStatus =
  | "draft"
  | "sent"
  | "accepted"
  | "declined"
  | "counter"
  | "cancelled"
  | "completed";

export interface DatePlan {
  id: string;
  matchId: string;
  type: DateType;
  venue: string;
  address: string;
  date: string;
  time: string;
  note: string;
  status: DateStatus;
  proposer: "me" | "them";
  checklist: Record<string, boolean>;
  trustedContact?: string;
}

export interface Feedback {
  dateId: string;
  happened: "yes" | "no" | "rescheduled";
  feeling: number;
  continue: "yes" | "maybe" | "no";
  report: string;
  at: number;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  dob: string;
  onboarded: boolean;
  profileComplete: boolean;
}

export interface Settings {
  notifyMatches: boolean;
  notifyMessages: boolean;
  notifyDates: boolean;
  showAge: boolean;
  showDistance: boolean;
  paused: boolean;
}

export interface PairState {
  version: number;
  user: User | null;
  me: MyProfile;
  prefs: Preferences;
  filters: Preferences & { sharedOnly: boolean };
  passes: string[];
  lastPass: string | null;
  likesSent: Like[];
  likesReceived: Like[];
  matches: Match[];
  messages: Message[];
  dates: DatePlan[];
  feedback: Feedback[];
  blocks: string[];
  reports: { profileId: string; reason: string; at: number }[];
  drafts: Record<string, string>;
  settings: Settings;
}

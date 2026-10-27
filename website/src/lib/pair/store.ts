/**
 * PAIR demo data layer.
 * All state lives in the browser (localStorage) and uses fictional profiles.
 * Passwords are never stored. Replace this module with a real backend later —
 * components only use the exported `actions` and `usePair` hook.
 */
import { useSyncExternalStore } from "react";
import { getProfile } from "./seed";
import type {
  DatePlan,
  Feedback,
  Like,
  LikeTarget,
  Match,
  Message,
  MyProfile,
  PairState,
  Preferences,
  Settings,
  User,
} from "./types";

const KEY = "pair-demo-state-v1";
const HOUR = 3600_000;
const DAY = 24 * HOUR;

const uid = () => Math.random().toString(36).slice(2, 10);

const emptyMe: MyProfile = {
  name: "",
  dob: "",
  city: "",
  pronouns: "",
  gender: "",
  occupation: "",
  education: "",
  languages: ["English"],
  intention: "",
  interests: [],
  prompts: [],
  photos: [],
};

const defaultPrefs: Preferences = {
  genders: ["Women", "Men", "Non-binary people"],
  ageMin: 24,
  ageMax: 38,
  distance: 25,
  intentions: [],
};

const defaultSettings: Settings = {
  notifyMatches: true,
  notifyMessages: true,
  notifyDates: true,
  showAge: true,
  showDistance: true,
  paused: false,
};

function iso(offsetDays: number) {
  const d = new Date(Date.now() + offsetDays * DAY);
  return d.toISOString().slice(0, 10);
}

function seededState(user: User | null): PairState {
  const now = Date.now();
  const matches: Match[] = [
    { id: "m-maya", profileId: "maya", at: now - 3 * DAY, origin: "You liked her prompt about Sundays" },
    { id: "m-marcus", profileId: "marcus", at: now - 1 * DAY, origin: "He liked your profile" },
    { id: "m-omar", profileId: "omar", at: now - 2 * HOUR, origin: "New match" },
  ];
  const messages: Message[] = [
    { id: uid(), matchId: "m-maya", from: "me", text: "Okay, your ideal Sunday sounds suspiciously like mine. What's the dinner you've been planning?", at: now - 3 * DAY + HOUR, read: true },
    { id: uid(), matchId: "m-maya", from: "them", text: "Ha! Slow-roasted tomatoes and too much bread. You?", at: now - 3 * DAY + 2 * HOUR, read: true },
    { id: uid(), matchId: "m-maya", from: "me", text: "I'd happily be a guest. Maybe we start with coffee though?", at: now - 2 * DAY, read: true },
    { id: uid(), matchId: "m-maya", from: "them", text: "Coffee it is. Saturday works great — see you there!", at: now - 2 * DAY + HOUR, read: true },
    { id: uid(), matchId: "m-marcus", from: "them", text: "Hey! I noticed you mentioned live music too. Best show you've been to this year?", at: now - 5 * HOUR, read: false },
    { id: uid(), matchId: "m-marcus", from: "them", text: "Also, I just sent over an idea for a coffee date.", at: now - 4 * HOUR, read: false },
  ];
  const dates: DatePlan[] = [
    {
      id: "d-maya",
      matchId: "m-maya",
      type: "Coffee",
      venue: "Devoción",
      address: "69 Grand St, Brooklyn",
      date: iso(3),
      time: "11:00",
      note: "Window seats if we can get them.",
      status: "accepted",
      proposer: "me",
      checklist: {},
    },
    {
      id: "d-marcus",
      matchId: "m-marcus",
      type: "Coffee",
      venue: "Café Grumpy",
      address: "Fort Greene",
      date: iso(5),
      time: "15:30",
      note: "Then the record store around the corner?",
      status: "sent",
      proposer: "them",
      checklist: {},
    },
  ];
  const likesReceived: Like[] = [
    { id: uid(), profileId: "priya", target: { type: "prompt", index: 0 }, comment: "Okay I need to know which one is the lie.", at: now - 6 * HOUR },
    { id: uid(), profileId: "sam", target: { type: "profile" }, at: now - DAY },
    { id: uid(), profileId: "luis", target: { type: "photo", index: 0 }, comment: "That photo has serious adventure energy.", at: now - 2 * DAY },
  ];
  return {
    version: 1,
    user,
    me: { ...emptyMe, name: user?.firstName ?? "", dob: user?.dob ?? "" },
    prefs: defaultPrefs,
    filters: { ...defaultPrefs, sharedOnly: false },
    passes: [],
    lastPass: null,
    likesSent: [{ id: uid(), profileId: "maya", target: { type: "prompt", index: 0 }, comment: "Planning dinner all week is a green flag.", at: now - 3 * DAY - HOUR }],
    likesReceived,
    matches,
    messages,
    dates,
    feedback: [],
    blocks: [],
    reports: [],
    drafts: {},
    settings: defaultSettings,
  };
}

let state: PairState = seededState(null);
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) state = { ...seededState(null), ...JSON.parse(raw) };
  } catch {
    /* ignore corrupt state */
  }
}

function set(updater: (s: PairState) => PairState) {
  load();
  state = updater(state);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("Could not persist PAIR demo state", e);
  }
  listeners.forEach((l) => l());
}

export function getState() {
  load();
  return state;
}

const serverSnapshot = seededState(null);

export function usePair(): PairState {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    getState,
    () => serverSnapshot,
  );
}

function scheduleDemoReply(matchId: string, text: string, delay = 1800) {
  if (typeof window === "undefined") return;
  window.setTimeout(() => {
    if (!getState().matches.some((m) => m.id === matchId)) return;
    set((s) => ({
      ...s,
      messages: [...s.messages, { id: uid(), matchId, from: "them", text, at: Date.now(), read: false, demo: true }],
    }));
  }, delay);
}

const DEMO_REPLIES = [
  "Ha, I love that. Tell me more?",
  "That's such a good question — let me think…",
  "Okay, you've got my attention 😊",
  "Same here! What got you into it?",
];

export const actions = {
  signUp(input: { firstName: string; email: string; dob: string }) {
    const user: User = { id: uid(), email: input.email, firstName: input.firstName, dob: input.dob, onboarded: false, profileComplete: false };
    state = seededState(user);
    set((s) => s);
    return user;
  },
  signIn(email: string) {
    const s = getState();
    if (s.user && s.user.email.toLowerCase() === email.toLowerCase()) return s.user;
    // Demo: any email opens a demo account.
    const user: User = { id: uid(), email, firstName: email.split("@")[0].replace(/\W/g, "") || "Friend", dob: "1995-06-01", onboarded: false, profileComplete: false };
    state = seededState(user);
    set((x) => x);
    return user;
  },
  enterDemo() {
    const user: User = { id: uid(), email: "demo@pair.example", firstName: "Alex", dob: "1995-04-12", onboarded: true, profileComplete: true };
    const st = seededState(user);
    st.me = {
      ...st.me,
      name: "Alex",
      city: "Brooklyn",
      pronouns: "they/them",
      gender: "Non-binary",
      occupation: "UX researcher",
      education: "Pratt Institute",
      languages: ["English", "Spanish"],
      intention: "long-term",
      interests: ["Travel", "Live music", "Books and reading", "Food", "Nature"],
      prompts: [
        { question: "My ideal Sunday looks like...", answer: "Farmers market, a long walk, and a new recipe that probably won't work." },
        { question: "A green flag I look for...", answer: "Curiosity about the people around you." },
        { question: "We'll get along if...", answer: "You'll split dessert without asking." },
      ],
    };
    state = st;
    set((x) => x);
  },
  signOut() {
    set((s) => ({ ...s, user: null }));
  },
  resetDemo() {
    const u = getState().user;
    state = seededState(u ? { ...u, onboarded: false, profileComplete: false } : null);
    set((x) => x);
  },
  deleteAccount() {
    state = seededState(null);
    set((x) => x);
    window.localStorage.removeItem(KEY);
  },
  completeOnboarding(me: Partial<MyProfile>, prefs: Preferences) {
    set((s) => ({
      ...s,
      me: { ...s.me, ...me },
      prefs,
      filters: { ...prefs, sharedOnly: false },
      user: s.user ? { ...s.user, onboarded: true } : s.user,
    }));
  },
  saveProfile(me: MyProfile, complete: boolean) {
    set((s) => ({ ...s, me, user: s.user ? { ...s.user, profileComplete: complete || s.user.profileComplete } : s.user }));
  },
  setFilters(f: PairState["filters"]) {
    set((s) => ({ ...s, filters: f }));
  },
  resetFilters() {
    set((s) => ({ ...s, filters: { ...s.prefs, sharedOnly: false } }));
  },
  pass(profileId: string) {
    set((s) => ({ ...s, passes: [...s.passes, profileId], lastPass: profileId }));
  },
  undoPass() {
    set((s) => (s.lastPass ? { ...s, passes: s.passes.filter((p) => p !== s.lastPass), lastPass: null } : s));
  },
  clearPasses() {
    set((s) => ({ ...s, passes: [], lastPass: null }));
  },
  /** Returns the new match id if the like created a match. */
  like(profileId: string, target: LikeTarget, comment?: string): string | null {
    const s = getState();
    if (s.likesSent.some((l) => l.profileId === profileId)) return null;
    const p = getProfile(profileId);
    const received = s.likesReceived.find((l) => l.profileId === profileId);
    const willMatch = !!received || !!p?.likesBack;
    const matchId = willMatch ? `m-${profileId}` : null;
    set((st) => ({
      ...st,
      likesSent: [...st.likesSent, { id: uid(), profileId, target, comment: comment?.trim() || undefined, at: Date.now() }],
      likesReceived: st.likesReceived.filter((l) => l.profileId !== profileId),
      matches:
        matchId && !st.matches.some((m) => m.id === matchId)
          ? [...st.matches, { id: matchId, profileId, at: Date.now(), origin: received ? "You liked them back" : "Demo: this profile liked you back" }]
          : st.matches,
      messages:
        matchId && comment?.trim()
          ? [...st.messages, { id: uid(), matchId, from: "me", text: comment.trim(), at: Date.now(), read: true }]
          : matchId && received?.comment
            ? [...st.messages, { id: uid(), matchId, from: "them", text: received.comment, at: received.at, read: true }]
            : st.messages,
    }));
    return matchId;
  },
  declineLike(profileId: string) {
    set((s) => ({ ...s, likesReceived: s.likesReceived.filter((l) => l.profileId !== profileId), passes: [...s.passes, profileId] }));
  },
  sendMessage(matchId: string, text: string) {
    const t = text.trim();
    if (!t) return;
    set((s) => ({
      ...s,
      messages: [...s.messages, { id: uid(), matchId, from: "me", text: t, at: Date.now(), read: true }],
      drafts: { ...s.drafts, [matchId]: "" },
    }));
    // Replies now come from the authenticated Cloud chat endpoint, not timers.
  },
  markRead(matchId: string) {
    const s = getState();
    if (!s.messages.some((m) => m.matchId === matchId && !m.read)) return;
    set((st) => ({ ...st, messages: st.messages.map((m) => (m.matchId === matchId ? { ...m, read: true } : m)) }));
  },
  setDraft(matchId: string, text: string) {
    state = { ...getState(), drafts: { ...getState().drafts, [matchId]: text } };
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* noop */
    }
  },
  archiveMatch(matchId: string, archived: boolean) {
    set((s) => ({ ...s, matches: s.matches.map((m) => (m.id === matchId ? { ...m, archived } : m)) }));
  },
  unmatch(matchId: string) {
    set((s) => ({
      ...s,
      matches: s.matches.filter((m) => m.id !== matchId),
      messages: s.messages.filter((m) => m.matchId !== matchId),
      dates: s.dates.filter((d) => d.matchId !== matchId),
    }));
  },
  block(profileId: string) {
    set((s) => ({
      ...s,
      blocks: [...new Set([...s.blocks, profileId])],
      matches: s.matches.filter((m) => m.profileId !== profileId),
      likesReceived: s.likesReceived.filter((l) => l.profileId !== profileId),
      messages: s.messages.filter((m) => m.matchId !== `m-${profileId}`),
      dates: s.dates.filter((d) => d.matchId !== `m-${profileId}`),
    }));
  },
  unblock(profileId: string) {
    set((s) => ({ ...s, blocks: s.blocks.filter((b) => b !== profileId) }));
  },
  report(profileId: string, reason: string) {
    set((s) => ({ ...s, reports: [...s.reports, { profileId, reason, at: Date.now() }] }));
  },
  proposeDate(plan: Omit<DatePlan, "id" | "status" | "proposer" | "checklist">) {
    const id = uid();
    set((s) => ({
      ...s,
      dates: [...s.dates, { ...plan, id, status: "sent", proposer: "me", checklist: {} }],
      messages: [...s.messages, { id: uid(), matchId: plan.matchId, from: "me", text: `📅 Date invitation: ${plan.type}${plan.venue ? ` at ${plan.venue}` : ""} on ${plan.date} at ${plan.time}`, at: Date.now(), read: true }],
    }));
    // Demo: simulated acceptance
    if (typeof window !== "undefined") {
      window.setTimeout(() => {
        const d = getState().dates.find((x) => x.id === id);
        if (d && d.status === "sent") {
          actions.updateDate(id, { status: "accepted" });
          scheduleDemoReply(plan.matchId, "Accepted your invite — looking forward to it!", 0);
        }
      }, 4000);
    }
    return id;
  },
  updateDate(id: string, patch: Partial<DatePlan>) {
    set((s) => ({ ...s, dates: s.dates.map((d) => (d.id === id ? { ...d, ...patch } : d)) }));
  },
  submitFeedback(f: Omit<Feedback, "at">) {
    set((s) => ({
      ...s,
      feedback: [...s.feedback.filter((x) => x.dateId !== f.dateId), { ...f, at: Date.now() }],
      dates: s.dates.map((d) => (d.id === f.dateId && f.happened === "yes" ? { ...d, status: "completed" } : d)),
    }));
  },
  updateSettings(patch: Partial<Settings>) {
    set((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  },
  updatePrefs(p: Preferences) {
    set((s) => ({ ...s, prefs: p, filters: { ...p, sharedOnly: s.filters.sharedOnly } }));
  },
};

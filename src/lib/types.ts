import type {
  activityOptions,
  budgetLevels,
  celebrationStyles,
  contactKinds,
  genderOptions,
  groupPreferences,
  groupSizes,
} from "./constants";

export type CelebrationStyle = (typeof celebrationStyles)[number];
export type BudgetLevel = (typeof budgetLevels)[number];
export type GroupSize = (typeof groupSizes)[number];
export type Gender = (typeof genderOptions)[number];
export type GroupPreference = (typeof groupPreferences)[number];
export type ContactKind = (typeof contactKinds)[number];
export type Activity = (typeof activityOptions)[number];

export interface BirthdayProfile {
  id: string;
  nickname: string;
  birthday_month: number;
  birthday_day: number;
  city_name: string;
  city_key: string;
  bio: string;
  celebration_style: CelebrationStyle;
  budget_level: BudgetLevel;
  group_size: GroupSize;
  gender: Gender;
  group_preference: GroupPreference;
  activities: Activity[];
  contact_kind: ContactKind;
  contact_value?: string;
  visibility: "active" | "paused";
  onboarding_complete: boolean;
}

export interface CandidateProfile {
  id: string;
  nickname: string;
  birthday_month: number;
  birthday_day: number;
  city_name: string;
  bio: string;
  celebration_style: CelebrationStyle;
  budget_level: BudgetLevel;
  group_size: GroupSize;
  activities: Activity[];
  shared_activities: Activity[];
  compatibility: number;
}

export interface Connection {
  id: string;
  connected_at: string;
  other_user_id: string;
  nickname: string;
  birthday_month: number;
  birthday_day: number;
  city_name: string;
  contact_kind: ContactKind;
  contact_value: string;
}

export type SupportCategory = "account_recovery" | "safety" | "privacy" | "general";
export type ModerationAction = "reviewing" | "resolved" | "ban";

export interface AdminReport {
  id: string;
  reporter_email: string;
  reporter_nickname: string | null;
  target_email: string;
  target_nickname: string | null;
  target_status: "active" | "banned";
  reason: "harassment" | "false_information" | "unsafe_behavior" | "spam" | "other";
  details: string;
  status: "open" | "reviewing" | "resolved";
  created_at: string;
}

export interface AdminSupportRequest {
  id: string;
  category: SupportCategory;
  email: string;
  message: string;
  status: "open" | "resolved";
  created_at: string;
}

export interface AdminDashboardData {
  reports: AdminReport[];
  supportRequests: AdminSupportRequest[];
}

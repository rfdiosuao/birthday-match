import type { Activity, BudgetLevel, CelebrationStyle, GroupSize } from "./types";

export interface MatchTraits {
  celebrationStyle: CelebrationStyle;
  budgetLevel: BudgetLevel;
  groupSize: GroupSize;
  activities: readonly Activity[];
}

export function sharedActivities(left: readonly Activity[], right: readonly Activity[]) {
  const rightSet = new Set(right);
  return left.filter((activity) => rightSet.has(activity));
}

export function calculateCompatibility(left: MatchTraits, right: MatchTraits) {
  const shared = sharedActivities(left.activities, right.activities);
  let score = 20;

  if (left.celebrationStyle === right.celebrationStyle) score += 28;
  if (left.budgetLevel === right.budgetLevel || left.budgetLevel === "flexible" || right.budgetLevel === "flexible") score += 20;
  if (left.groupSize === right.groupSize) score += 12;
  score += Math.min(shared.length * 8, 32);

  return Math.min(score, 100);
}

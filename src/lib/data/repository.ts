import type { Sql } from "postgres";
import { displayCity, normalizeCity } from "../city";
import { calculateCompatibility, sharedActivities } from "../matching";
import type { AuthUser, AuthUserRepository } from "../auth/service";
import type { ValidProfileInput } from "../profile-schema";
import type {
  AdminDashboardData,
  AdminReport,
  AdminSupportRequest,
  BirthdayProfile,
  CandidateProfile,
  Connection,
  ModerationAction,
  SupportCategory,
} from "../types";

interface SessionUser {
  id: string;
  email: string;
  role: "user" | "admin";
}

interface CandidateRow {
  id: string;
  nickname: string;
  birthday_month: number;
  birthday_day: number;
  city_name: string;
  bio: string;
  celebration_style: CandidateProfile["celebration_style"];
  budget_level: CandidateProfile["budget_level"];
  group_size: CandidateProfile["group_size"];
  activities: CandidateProfile["activities"];
}

export class AppRepository implements AuthUserRepository {
  constructor(private readonly sql: Sql) {}

  async findByEmail(email: string): Promise<AuthUser | null> {
    const [user] = await this.sql<AuthUser[]>`
      select id, email, password_hash as "passwordHash", role, status
      from app_users
      where lower(email) = lower(${email})
      limit 1
    `;
    return user || null;
  }

  async create(email: string, passwordHash: string): Promise<AuthUser> {
    try {
      const [user] = await this.sql<AuthUser[]>`
        insert into app_users (email, password_hash)
        values (${email}, ${passwordHash})
        returning id, email, password_hash as "passwordHash", role, status
      `;
      return user;
    } catch (error) {
      if (isPostgresError(error, "23505")) {
        throw Object.assign(new Error("email already exists"), { code: "email_exists" as const });
      }
      throw error;
    }
  }

  async createSession(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
    await this.sql`
      insert into sessions (token_hash, user_id, expires_at)
      values (${tokenHash}, ${userId}, ${expiresAt})
    `;
  }

  async findSessionUser(tokenHash: string): Promise<SessionUser | null> {
    const [user] = await this.sql<SessionUser[]>`
      select users.id, users.email, users.role
      from sessions
      join app_users users on users.id = sessions.user_id
      where sessions.token_hash = ${tokenHash}
        and sessions.expires_at > now()
        and users.status = 'active'
      limit 1
    `;
    return user || null;
  }

  async deleteSession(tokenHash: string): Promise<void> {
    await this.sql`delete from sessions where token_hash = ${tokenHash}`;
  }

  async getProfile(userId: string): Promise<BirthdayProfile | null> {
    const [profile] = await this.sql<BirthdayProfile[]>`
      select
        id,
        nickname,
        birthday_month,
        birthday_day,
        city_name,
        city_key,
        bio,
        celebration_style,
        budget_level,
        group_size,
        gender,
        group_preference,
        activities,
        contact_kind,
        contact_value,
        visibility,
        onboarding_complete
      from profiles
      where id = ${userId}
      limit 1
    `;
    return profile || null;
  }

  async upsertProfile(userId: string, profile: ValidProfileInput): Promise<void> {
    await this.sql`
      insert into profiles (
        id,
        nickname,
        birthday_month,
        birthday_day,
        city_name,
        city_key,
        bio,
        celebration_style,
        budget_level,
        group_size,
        gender,
        group_preference,
        activities,
        contact_kind,
        contact_value,
        is_adult,
        safety_accepted,
        visibility,
        onboarding_complete
      )
      values (
        ${userId},
        ${profile.nickname},
        ${profile.birthdayMonth},
        ${profile.birthdayDay},
        ${displayCity(profile.city)},
        ${normalizeCity(profile.city)},
        ${profile.bio},
        ${profile.celebrationStyle},
        ${profile.budgetLevel},
        ${profile.groupSize},
        ${profile.gender},
        ${profile.groupPreference},
        ${profile.activities},
        ${profile.contactKind},
        ${profile.contactValue},
        ${profile.isAdult},
        ${profile.safetyAccepted},
        ${profile.visibility},
        true
      )
      on conflict (id) do update set
        nickname = excluded.nickname,
        birthday_month = excluded.birthday_month,
        birthday_day = excluded.birthday_day,
        city_name = excluded.city_name,
        city_key = excluded.city_key,
        bio = excluded.bio,
        celebration_style = excluded.celebration_style,
        budget_level = excluded.budget_level,
        group_size = excluded.group_size,
        gender = excluded.gender,
        group_preference = excluded.group_preference,
        activities = excluded.activities,
        contact_kind = excluded.contact_kind,
        contact_value = excluded.contact_value,
        is_adult = excluded.is_adult,
        safety_accepted = excluded.safety_accepted,
        visibility = excluded.visibility,
        onboarding_complete = true
    `;
  }

  async getBirthdayCandidates(userId: string): Promise<CandidateProfile[]> {
    const me = await this.getProfile(userId);
    if (!me || !me.onboarding_complete || me.visibility !== "active") return [];

    const candidates = await this.sql<CandidateRow[]>`
      select
        candidate.id,
        candidate.nickname,
        candidate.birthday_month,
        candidate.birthday_day,
        candidate.city_name,
        candidate.bio,
        candidate.celebration_style,
        candidate.budget_level,
        candidate.group_size,
        candidate.activities
      from profiles candidate
      where candidate.id <> ${userId}
        and candidate.visibility = 'active'
        and candidate.onboarding_complete = true
        and candidate.birthday_month = ${me.birthday_month}
        and candidate.birthday_day = ${me.birthday_day}
        and candidate.city_key = ${me.city_key}
        and (
          ${me.group_preference} = 'any'
          or (${me.group_preference} = 'women_only' and candidate.gender = 'woman')
          or (${me.group_preference} = 'men_only' and candidate.gender = 'man')
        )
        and (
          candidate.group_preference = 'any'
          or (candidate.group_preference = 'women_only' and ${me.gender} = 'woman')
          or (candidate.group_preference = 'men_only' and ${me.gender} = 'man')
        )
        and not exists (
          select 1 from reactions
          where actor_id = ${userId} and target_id = candidate.id
        )
        and not exists (
          select 1 from connections
          where (user_low = ${userId} and user_high = candidate.id)
             or (user_low = candidate.id and user_high = ${userId})
        )
        and not exists (
          select 1 from reports
          where (reporter_id = ${userId} and target_id = candidate.id)
             or (reporter_id = candidate.id and target_id = ${userId})
        )
      order by candidate.created_at asc
    `;

    return candidates
      .map((candidate) => {
        const shared = sharedActivities(me.activities, candidate.activities);
        return {
          ...candidate,
          shared_activities: shared,
          compatibility: calculateCompatibility(
            {
              celebrationStyle: me.celebration_style,
              budgetLevel: me.budget_level,
              groupSize: me.group_size,
              activities: me.activities,
            },
            {
              celebrationStyle: candidate.celebration_style,
              budgetLevel: candidate.budget_level,
              groupSize: candidate.group_size,
              activities: candidate.activities,
            },
          ),
        };
      })
      .sort((left, right) => right.compatibility - left.compatibility)
      .slice(0, 30);
  }

  async respondToCandidate(
    userId: string,
    targetId: string,
    decision: "interested" | "pass",
  ): Promise<{ matched: boolean; connectionId: string | null }> {
    return this.sql.begin(async (transaction) => {
      const [userLow, userHigh] = orderedUserIds(userId, targetId);
      const profiles = await transaction<BirthdayProfile[]>`
        select * from profiles
        where id in (${userLow}, ${userHigh})
          and onboarding_complete = true
          and visibility = 'active'
        order by id
        for update
      `;
      const me = profiles.find((profile) => profile.id === userId);
      const target = profiles.find((profile) => profile.id === targetId);

      if (!me || !target || !isEligible(me, target)) throw new Error("candidate is unavailable");

      const [report] = await transaction`
        select 1
        from reports
        where (reporter_id = ${userId} and target_id = ${targetId})
           or (reporter_id = ${targetId} and target_id = ${userId})
        limit 1
      `;
      if (report) throw new Error("candidate is unavailable");

      await transaction`
        insert into reactions (actor_id, target_id, decision)
        values (${userId}, ${targetId}, ${decision})
        on conflict (actor_id, target_id)
        do update set decision = excluded.decision
      `;

      if (decision !== "interested") return { matched: false, connectionId: null };

      const [reverseReaction] = await transaction`
        select 1
        from reactions
        where actor_id = ${targetId}
          and target_id = ${userId}
          and decision = 'interested'
        limit 1
      `;
      if (!reverseReaction) return { matched: false, connectionId: null };

      const [connection] = await transaction<{ id: string }[]>`
        insert into connections (user_low, user_high)
        values (${userLow}, ${userHigh})
        on conflict (user_low, user_high)
        do update set user_low = excluded.user_low
        returning id
      `;

      return { matched: true, connectionId: connection.id };
    });
  }

  async getConnections(userId: string): Promise<Connection[]> {
    return this.sql<Connection[]>`
      select
        connection.id,
        connection.connected_at,
        other.id as other_user_id,
        other.nickname,
        other.birthday_month,
        other.birthday_day,
        other.city_name,
        other.contact_kind,
        other.contact_value
      from connections connection
      join profiles other
        on other.id = case when connection.user_low = ${userId} then connection.user_high else connection.user_low end
      join app_users other_account
        on other_account.id = other.id and other_account.status = 'active'
      where (connection.user_low = ${userId} or connection.user_high = ${userId})
        and not exists (
          select 1 from reports
          where (reporter_id = ${userId} and target_id = other.id)
             or (reporter_id = other.id and target_id = ${userId})
        )
      order by connection.connected_at desc
    `;
  }

  async createReport(
    reporterId: string,
    targetId: string,
    reason: "harassment" | "false_information" | "unsafe_behavior" | "spam" | "other",
    details: string,
  ): Promise<void> {
    await this.sql`
      insert into reports (reporter_id, target_id, reason, details)
      values (${reporterId}, ${targetId}, ${reason}, ${details})
    `;
  }

  async createSupportRequest(input: {
    category: SupportCategory;
    email: string;
    message: string;
  }): Promise<void> {
    await this.sql`
      insert into support_requests (category, email, message)
      values (${input.category}, ${input.email}, ${input.message})
    `;
  }

  async getAdminDashboard(adminId: string): Promise<AdminDashboardData> {
    const [admin] = await this.sql`
      select 1 from app_users
      where id = ${adminId} and role = 'admin' and status = 'active'
      limit 1
    `;
    if (!admin) throw new Error("forbidden");

    const [reports, supportRequests] = await Promise.all([
      this.sql<AdminReport[]>`
        select
          report.id,
          reporter.email as reporter_email,
          reporter_profile.nickname as reporter_nickname,
          target.email as target_email,
          target_profile.nickname as target_nickname,
          target.status as target_status,
          report.reason,
          report.details,
          report.status,
          report.created_at
        from reports report
        join app_users reporter on reporter.id = report.reporter_id
        join app_users target on target.id = report.target_id
        left join profiles reporter_profile on reporter_profile.id = reporter.id
        left join profiles target_profile on target_profile.id = target.id
        order by
          case report.status when 'open' then 0 when 'reviewing' then 1 else 2 end,
          report.created_at desc
        limit 100
      `,
      this.sql<AdminSupportRequest[]>`
        select id, category, email, message, status, created_at
        from support_requests
        order by case status when 'open' then 0 else 1 end, created_at desc
        limit 100
      `,
    ]);

    return { reports, supportRequests };
  }

  async moderateReport(
    adminId: string,
    reportId: string,
    action: ModerationAction,
  ): Promise<void> {
    await this.sql.begin(async (transaction) => {
      const [admin] = await transaction`
        select 1 from app_users
        where id = ${adminId} and role = 'admin' and status = 'active'
        for update
      `;
      if (!admin) throw new Error("forbidden");

      const [report] = await transaction<{ target_id: string }[]>`
        select target_id from reports where id = ${reportId} for update
      `;
      if (!report) throw new Error("report not found");

      if (action === "ban") {
        const [bannedUser] = await transaction`
          update app_users
          set status = 'banned', banned_at = now(), ban_reason = '管理员根据举报记录停用账号'
          where id = ${report.target_id} and role <> 'admin'
          returning id
        `;
        if (!bannedUser) throw new Error("cannot ban this account");
        await transaction`delete from sessions where user_id = ${report.target_id}`;
        await transaction`update profiles set visibility = 'paused' where id = ${report.target_id}`;
        await transaction`update reports set status = 'resolved' where id = ${reportId}`;
        return;
      }

      await transaction`
        update reports set status = ${action} where id = ${reportId}
      `;
    });
  }

  async resolveSupportRequest(adminId: string, requestId: string): Promise<void> {
    const [admin] = await this.sql`
      select 1 from app_users
      where id = ${adminId} and role = 'admin' and status = 'active'
      limit 1
    `;
    if (!admin) throw new Error("forbidden");

    const [request] = await this.sql`
      update support_requests
      set status = 'resolved', resolved_at = now()
      where id = ${requestId}
      returning id
    `;
    if (!request) throw new Error("support request not found");
  }
}

function isEligible(me: BirthdayProfile, target: BirthdayProfile) {
  if (
    me.id === target.id
    || me.birthday_month !== target.birthday_month
    || me.birthday_day !== target.birthday_day
    || me.city_key !== target.city_key
  ) return false;

  if (me.group_preference === "women_only" && target.gender !== "woman") return false;
  if (me.group_preference === "men_only" && target.gender !== "man") return false;
  if (target.group_preference === "women_only" && me.gender !== "woman") return false;
  if (target.group_preference === "men_only" && me.gender !== "man") return false;
  return true;
}

export function orderedUserIds(left: string, right: string): [string, string] {
  return left < right ? [left, right] : [right, left];
}

function isPostgresError(error: unknown, code: string) {
  return typeof error === "object" && error !== null && "code" in error && error.code === code;
}

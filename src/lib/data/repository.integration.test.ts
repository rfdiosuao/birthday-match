import { fileURLToPath } from "node:url";
import postgres from "postgres";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { ValidProfileInput } from "../profile-schema";
import { AppRepository } from "./repository";

const databaseUrl = process.env.TEST_DATABASE_URL;

function profile(overrides: Partial<ValidProfileInput> = {}): ValidProfileInput {
  return {
    nickname: "认真过生日",
    birthdayMonth: 7,
    birthdayDay: 30,
    city: "杭州市",
    bio: "今年想认识几位同一天生日的人，一起吃饭散步，认真记录这一天。",
    celebrationStyle: "explore",
    budgetLevel: "100_300",
    groupSize: "small",
    gender: "woman",
    groupPreference: "any",
    activities: ["meal", "walk"],
    contactKind: "wechat",
    contactValue: "birthday-contact",
    isAdult: true,
    safetyAccepted: true,
    visibility: "active",
    ...overrides,
  };
}

describe.skipIf(!databaseUrl)("repository integration", () => {
  const sql = postgres(databaseUrl!, { max: 5 });
  const repository = new AppRepository(sql);
  const schemaPath = fileURLToPath(new URL("../../../database/schema.sql", import.meta.url));

  async function createUser(email: string) {
    return repository.create(email, "scrypt$test-password-hash");
  }

  beforeAll(async () => {
    await sql.file(schemaPath);
  });

  beforeEach(async () => {
    await sql`truncate table reports, connections, reactions, profiles, sessions, app_users restart identity cascade`;
  });

  afterAll(async () => {
    await sql.end();
  });

  describe("users and sessions", () => {
  it("creates users, finds them by normalized email, and resolves active sessions", async () => {
    const user = await createUser("birthday@example.com");
    expect(await repository.findByEmail("birthday@example.com")).toMatchObject({ id: user.id });

    await repository.createSession(user.id, "token-digest", new Date(Date.now() + 60_000));
    expect(await repository.findSessionUser("token-digest")).toEqual({
      id: user.id,
      email: "birthday@example.com",
    });

    await repository.deleteSession("token-digest");
    expect(await repository.findSessionUser("token-digest")).toBeNull();
  });
  });

  describe("birthday matching", () => {
  it("returns only same-day, same-city candidates without exposing contact details", async () => {
    const me = await createUser("me@example.com");
    const eligible = await createUser("eligible@example.com");
    const wrongDay = await createUser("other@example.com");

    await repository.upsertProfile(me.id, profile({ nickname: "本人", contactValue: "my-secret" }));
    await repository.upsertProfile(
      eligible.id,
      profile({ nickname: "同日的人", contactValue: "candidate-secret" }),
    );
    await repository.upsertProfile(
      wrongDay.id,
      profile({ nickname: "不同日期", birthdayDay: 29, contactValue: "other-secret" }),
    );

    const candidates = await repository.getBirthdayCandidates(me.id);

    expect(candidates).toHaveLength(1);
    expect(candidates[0]).toMatchObject({
      id: eligible.id,
      nickname: "同日的人",
      shared_activities: ["meal", "walk"],
      compatibility: 96,
    });
    expect(candidates[0]).not.toHaveProperty("contact_value");
  });

  it("creates a connection only after both users choose each other", async () => {
    const left = await createUser("left@example.com");
    const right = await createUser("right@example.com");
    await repository.upsertProfile(left.id, profile({ nickname: "左边", contactValue: "left-contact" }));
    await repository.upsertProfile(right.id, profile({ nickname: "右边", contactValue: "right-contact" }));

    await expect(repository.respondToCandidate(left.id, right.id, "interested")).resolves.toEqual({
      matched: false,
      connectionId: null,
    });

    const secondResponse = await repository.respondToCandidate(right.id, left.id, "interested");
    expect(secondResponse.matched).toBe(true);
    expect(secondResponse.connectionId).toMatch(/^[0-9a-f-]{36}$/);

    await expect(repository.getConnections(left.id)).resolves.toMatchObject([
      {
        other_user_id: right.id,
        nickname: "右边",
        contact_value: "right-contact",
      },
    ]);
  });

  it("rejects reactions from a paused profile", async () => {
    const paused = await createUser("paused@example.com");
    const active = await createUser("active@example.com");
    await repository.upsertProfile(paused.id, profile({ nickname: "已暂停" }));
    await repository.upsertProfile(active.id, profile({ nickname: "仍活跃" }));
    await repository.upsertProfile(
      paused.id,
      profile({ nickname: "已暂停", visibility: "paused" }),
    );

    await expect(
      repository.respondToCandidate(paused.id, active.id, "interested"),
    ).rejects.toThrow("candidate is unavailable");
  });

  it("handles simultaneous mutual interest without a deadlock", async () => {
    const left = await createUser("concurrent-left@example.com");
    const right = await createUser("concurrent-right@example.com");
    await repository.upsertProfile(left.id, profile({ nickname: "并发左边" }));
    await repository.upsertProfile(right.id, profile({ nickname: "并发右边" }));

    const responses = await Promise.all([
      repository.respondToCandidate(left.id, right.id, "interested"),
      repository.respondToCandidate(right.id, left.id, "interested"),
    ]);

    expect(responses.filter((response) => response.matched)).toHaveLength(1);
    await expect(repository.getConnections(left.id)).resolves.toHaveLength(1);
    await expect(repository.getConnections(right.id)).resolves.toHaveLength(1);
  });

  it("ranks all eligible profiles before keeping the best thirty", async () => {
    const me = await createUser("ranking-me@example.com");
    await repository.upsertProfile(me.id, profile({ nickname: "排序本人" }));

    for (let index = 0; index < 30; index += 1) {
      const candidate = await createUser(`ranking-low-${index}@example.com`);
      await repository.upsertProfile(
        candidate.id,
        profile({
          nickname: `普通候选${String(index).padStart(2, "0")}`,
          celebrationStyle: "quiet",
          budgetLevel: "under_100",
          groupSize: "two",
          activities: ["museum"],
        }),
      );
    }

    const best = await createUser("ranking-best@example.com");
    await repository.upsertProfile(
      best.id,
      profile({ nickname: "最合适的人", activities: ["meal", "walk"] }),
    );

    const candidates = await repository.getBirthdayCandidates(me.id);

    expect(candidates).toHaveLength(30);
    expect(candidates[0]).toMatchObject({ id: best.id, nickname: "最合适的人" });
  });

  it("removes a reported user from future candidates", async () => {
    const reporter = await createUser("reporter@example.com");
    const target = await createUser("target@example.com");
    await repository.upsertProfile(reporter.id, profile({ nickname: "举报人" }));
    await repository.upsertProfile(target.id, profile({ nickname: "被举报人" }));

    await repository.createReport(reporter.id, target.id, "unsafe_behavior", "线下行为令人不适");

    await expect(repository.getBirthdayCandidates(reporter.id)).resolves.toEqual([]);
    await expect(
      repository.respondToCandidate(reporter.id, target.id, "interested"),
    ).rejects.toThrow("candidate is unavailable");
  });
  });
});

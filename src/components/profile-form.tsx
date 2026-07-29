"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import {
  activityOptions,
  budgetLevels,
  celebrationStyles,
  contactKinds,
  genderOptions,
  groupPreferences,
  groupSizes,
  labels,
} from "@/lib/constants";
import type { Activity, BirthdayProfile } from "@/lib/types";

interface ProfileFormProps {
  initialProfile: BirthdayProfile | null;
}

interface FormState {
  nickname: string;
  birthdayMonth: string;
  birthdayDay: string;
  city: string;
  gender: string;
  groupPreference: string;
  bio: string;
  celebrationStyle: string;
  budgetLevel: string;
  groupSize: string;
  activities: Activity[];
  contactKind: string;
  contactValue: string;
  isAdult: boolean;
  safetyAccepted: boolean;
  visibility: "active" | "paused";
}

function createInitialState(profile: BirthdayProfile | null): FormState {
  return {
    nickname: profile?.nickname || "",
    birthdayMonth: profile ? String(profile.birthday_month) : "",
    birthdayDay: profile ? String(profile.birthday_day) : "",
    city: profile?.city_name || "",
    gender: profile?.gender || "",
    groupPreference: profile?.group_preference || "any",
    bio: profile?.bio || "",
    celebrationStyle: profile?.celebration_style || "",
    budgetLevel: profile?.budget_level || "",
    groupSize: profile?.group_size || "",
    activities: profile?.activities || [],
    contactKind: profile?.contact_kind || "wechat",
    contactValue: profile?.contact_value || "",
    isAdult: Boolean(profile?.onboarding_complete),
    safetyAccepted: Boolean(profile?.onboarding_complete),
    visibility: profile?.visibility || "active",
  };
}

export function ProfileForm({ initialProfile }: ProfileFormProps) {
  const [step, setStep] = useState(1);
  const [state, setState] = useState(() => createInitialState(initialProfile));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const dayCount = useMemo(() => {
    if (!state.birthdayMonth) return 31;
    return new Date(2024, Number(state.birthdayMonth), 0).getDate();
  }, [state.birthdayMonth]);

  function setField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setState((current) => ({ ...current, [field]: value }));
    setError("");
  }

  function toggleActivity(activity: Activity) {
    setState((current) => {
      const exists = current.activities.includes(activity);
      if (!exists && current.activities.length >= 5) return current;
      return {
        ...current,
        activities: exists
          ? current.activities.filter((item) => item !== activity)
          : [...current.activities, activity],
      };
    });
  }

  function validateCurrentStep() {
    if (step === 1 && (!state.nickname.trim() || !state.birthdayMonth || !state.birthdayDay || !state.city.trim() || !state.gender)) {
      return "请完整填写称呼、生日、城市和性别信息。";
    }
    if (step === 2 && (state.bio.trim().length < 20 || !state.celebrationStyle || !state.budgetLevel || !state.groupSize || state.activities.length === 0)) {
      return "请完成自我介绍，并选择庆祝偏好和至少一项活动。";
    }
    return "";
  }

  function nextStep() {
    const validationError = validateCurrentStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    setStep((current) => Math.min(current + 1, 3));
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step < 3) {
      nextStep();
      return;
    }
    if (!state.contactValue.trim() || !state.isAdult || !state.safetyAccepted) {
      setError("请填写联系方式，并确认年龄和安全守则。 ");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "保存失败，请稍后重试。");
      router.push("/matches");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "保存失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="profile-workspace">
      <aside className="profile-progress" aria-label="档案填写进度">
        {[1, 2, 3].map((item) => (
          <div key={item} className={item === step ? "active" : item < step ? "done" : ""}>
            <span>{item < step ? <Check aria-hidden="true" size={16} /> : `0${item}`}</span>
            <p>{item === 1 ? "基本信息" : item === 2 ? "庆祝偏好" : "安全与联系"}</p>
          </div>
        ))}
        <div className="profile-date" aria-hidden="true">
          <strong>{state.birthdayMonth ? state.birthdayMonth.padStart(2, "0") : "MM"}</strong>
          <i>/</i>
          <strong>{state.birthdayDay ? state.birthdayDay.padStart(2, "0") : "DD"}</strong>
        </div>
      </aside>

      <form className="profile-form" onSubmit={submit}>
        {step === 1 ? (
          <fieldset>
            <legend>你的基本信息</legend>
            <p className="fieldset-intro">这些信息用于建立候选范围。出生年份不会被收集。</p>
            <label className="field">
              <span>怎么称呼你</span>
              <input value={state.nickname} onChange={(event) => setField("nickname", event.target.value)} maxLength={20} placeholder="昵称即可" required />
            </label>
            <div className="field-row">
              <label className="field">
                <span>生日月份</span>
                <select value={state.birthdayMonth} onChange={(event) => {
                  setField("birthdayMonth", event.target.value);
                  if (Number(state.birthdayDay) > new Date(2024, Number(event.target.value), 0).getDate()) setField("birthdayDay", "");
                }} required>
                  <option value="">选择月份</option>
                  {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => <option key={month} value={month}>{month} 月</option>)}
                </select>
              </label>
              <label className="field">
                <span>生日日期</span>
                <select value={state.birthdayDay} onChange={(event) => setField("birthdayDay", event.target.value)} required>
                  <option value="">选择日期</option>
                  {Array.from({ length: dayCount }, (_, index) => index + 1).map((day) => <option key={day} value={day}>{day} 日</option>)}
                </select>
              </label>
            </div>
            <label className="field">
              <span>所在城市</span>
              <input value={state.city} onChange={(event) => setField("city", event.target.value)} maxLength={30} placeholder="例如：杭州" required />
              <small>系统会自动忽略“市”等行政区后缀。</small>
            </label>
            <div className="field-row">
              <label className="field">
                <span>你的性别</span>
                <select value={state.gender} onChange={(event) => setField("gender", event.target.value)} required>
                  <option value="">请选择</option>
                  {genderOptions.map((value) => <option key={value} value={value}>{labels.gender[value]}</option>)}
                </select>
              </label>
              <label className="field">
                <span>期待的小组</span>
                <select value={state.groupPreference} onChange={(event) => setField("groupPreference", event.target.value)} required>
                  {groupPreferences.map((value) => <option key={value} value={value}>{labels.groupPreference[value]}</option>)}
                </select>
              </label>
            </div>
          </fieldset>
        ) : null}

        {step === 2 ? (
          <fieldset>
            <legend>你想怎样度过生日</legend>
            <p className="fieldset-intro">庆祝方式越具体，匹配结果越接近你真正想要的一天。</p>
            <label className="field">
              <span>介绍一下自己和期待</span>
              <textarea value={state.bio} onChange={(event) => setField("bio", event.target.value)} minLength={20} maxLength={160} placeholder="可以说说你的性格、今年为什么想认真过生日，以及不接受什么。" required />
              <small>{state.bio.length}/160，至少 20 个字</small>
            </label>
            <OptionGroup title="庆祝方式" values={celebrationStyles} selected={state.celebrationStyle} labelsMap={labels.celebrationStyle} onChange={(value) => setField("celebrationStyle", value)} />
            <OptionGroup title="人均预算" values={budgetLevels} selected={state.budgetLevel} labelsMap={labels.budgetLevel} onChange={(value) => setField("budgetLevel", value)} />
            <OptionGroup title="期待人数" values={groupSizes} selected={state.groupSize} labelsMap={labels.groupSize} onChange={(value) => setField("groupSize", value)} />
            <div className="field option-field">
              <span>当天想做什么（最多五项）</span>
              <div className="choice-grid activities-grid">
                {activityOptions.map((activity) => (
                  <label key={activity} className="choice-card">
                    <input type="checkbox" checked={state.activities.includes(activity)} onChange={() => toggleActivity(activity)} />
                    <span>{labels.activity[activity]}</span>
                  </label>
                ))}
              </div>
            </div>
          </fieldset>
        ) : null}

        {step === 3 ? (
          <fieldset>
            <legend>联系方式与安全确认</legend>
            <p className="fieldset-intro">联系方式会加密传输，并且只在双方匹配成功后向对方开放。</p>
            <div className="field-row contact-row">
              <label className="field">
                <span>联系方式类型</span>
                <select value={state.contactKind} onChange={(event) => setField("contactKind", event.target.value)} required>
                  {contactKinds.map((value) => <option key={value} value={value}>{labels.contactKind[value]}</option>)}
                </select>
              </label>
              <label className="field">
                <span>联系方式</span>
                <input value={state.contactValue} onChange={(event) => setField("contactValue", event.target.value)} maxLength={80} placeholder={state.contactKind === "wechat" ? "微信号" : state.contactKind === "email" ? "name@example.com" : "手机号"} required />
              </label>
            </div>
            {initialProfile ? (
              <div className="field option-field">
                <span>档案状态</span>
                <div className="choice-grid two-columns">
                  <Choice checked={state.visibility === "active"} label="继续参与匹配" onChange={() => setField("visibility", "active")} name="visibility" />
                  <Choice checked={state.visibility === "paused"} label="暂时停止匹配" onChange={() => setField("visibility", "paused")} name="visibility" />
                </div>
              </div>
            ) : null}
            <label className="check-line">
              <input type="checkbox" checked={state.isAdult} onChange={(event) => setField("isAdult", event.target.checked)} />
              <span>我已年满 18 周岁。</span>
            </label>
            <label className="check-line">
              <input type="checkbox" checked={state.safetyAccepted} onChange={(event) => setField("safetyAccepted", event.target.checked)} />
              <span>我会遵守安全守则：首次只在公共场所见面，不强迫他人饮酒、消费或继续联系。</span>
            </label>
          </fieldset>
        ) : null}

        {error ? <p className="form-message error" role="alert">{error}</p> : null}
        <div className="form-navigation">
          {step > 1 ? <button className="text-button" type="button" onClick={() => setStep((current) => current - 1)}><ArrowLeft aria-hidden="true" size={17} />上一步</button> : <span />}
          <button className="button button-primary" type="submit" disabled={loading}>
            {step < 3 ? <>下一步<ArrowRight aria-hidden="true" size={17} /></> : loading ? "正在保存" : initialProfile ? "保存档案" : "开始匹配"}
          </button>
        </div>
      </form>
    </div>
  );
}

function OptionGroup<T extends string>({ title, values, selected, labelsMap, onChange }: {
  title: string;
  values: readonly T[];
  selected: string;
  labelsMap: Record<T, string>;
  onChange: (value: string) => void;
}) {
  return (
    <div className="field option-field">
      <span>{title}</span>
      <div className="choice-grid">
        {values.map((value) => <Choice key={value} checked={selected === value} label={labelsMap[value]} onChange={() => onChange(value)} name={title} />)}
      </div>
    </div>
  );
}

function Choice({ checked, label, onChange, name }: { checked: boolean; label: string; onChange: () => void; name: string }) {
  return (
    <label className="choice-card">
      <input type="radio" name={name} checked={checked} onChange={onChange} />
      <span>{label}</span>
    </label>
  );
}

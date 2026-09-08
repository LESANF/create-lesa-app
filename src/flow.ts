/**
 * 프롬프트 스텝 머신 — 순수 함수. UI(ink) 밖에 두어 TTY 없이 테스트한다.
 *
 * 언어를 고르게 하지 않는다. 이름을 받고 ASCII 인지 검사한다:
 *   ASCII      → 그 값이 곧 slug. displayName 은 비운다(템플릿이 name 을 그대로 쓴다)
 *   비 ASCII   → displayName 으로 쓰고 slug 을 따로 묻는다
 */

import { validateSlug } from './derive.ts';

import type { AppInput } from './derive.ts';

export type StepId = 'name' | 'slug' | 'team' | 'ready';

export type FlowState = {
  step: StepId;
  /** 사용자가 처음 입력한 이름. ASCII 면 slug 과 같다. */
  name: string;
  slug: string;
  appleTeamId: string;
  error: string | null;
};

export const initialFlow: FlowState = {
  appleTeamId: '',
  error: null,
  name: '',
  slug: '',
  step: 'name',
};

/** slug 으로 바로 쓸 수 있는 이름인지 — 통과하면 slug 질문을 건너뛴다. */
export function isUsableAsSlug(name: string): boolean {
  return validateSlug(name) === null;
}

/** 텍스트를 담는 필드만 — `error` 가 섞이면 호출부에서 string 으로 못 쓴다. */
export type TextField = 'name' | 'slug' | 'appleTeamId';

/** 지금 스텝이 편집 중인 필드. null 이면 입력 스텝이 아니다. */
export function editingField(step: StepId): TextField | null {
  if (step === 'name') return 'name';
  if (step === 'slug') return 'slug';
  if (step === 'team') return 'appleTeamId';
  return null;
}

export function setField(state: FlowState, value: string): FlowState {
  const field = editingField(state.step);
  if (!field) return state;
  return { ...state, [field]: value, error: null };
}

/** Enter. 검증 실패면 error 를 채운 같은 스텝을 돌려준다. */
export function advance(state: FlowState): FlowState {
  if (state.step === 'name') {
    const name = state.name.trim();
    if (!name) return { ...state, error: 'Enter an app name.' };
    // ASCII 로 쓸 수 있으면 slug 질문을 건너뛴다.
    if (isUsableAsSlug(name)) {
      return { ...state, error: null, name, slug: name, step: 'team' };
    }
    return { ...state, error: null, name, step: 'slug' };
  }

  if (state.step === 'slug') {
    const problem = validateSlug(state.slug.trim());
    if (problem) return { ...state, error: problem };
    return { ...state, error: null, slug: state.slug.trim(), step: 'team' };
  }

  if (state.step === 'team') {
    return { ...state, appleTeamId: state.appleTeamId.trim(), error: null, step: 'ready' };
  }

  return state;
}

/** 'ready' 에서 결과로 변환. name 이 ASCII 면 displayName 은 비운다. */
export function toInput(state: FlowState): AppInput {
  return {
    appleTeamId: state.appleTeamId,
    displayName: isUsableAsSlug(state.name) ? '' : state.name,
    slug: state.slug,
  };
}

export const STEP_LABELS: Record<StepId, string> = {
  name: 'NAME',
  ready: 'READY',
  slug: 'SLUG',
  team: 'TEAM',
};

/** 진행 표시용 — slug 을 건너뛴 경우에도 자리를 유지한다. */
export const STEP_ORDER: StepId[] = ['name', 'slug', 'team', 'ready'];

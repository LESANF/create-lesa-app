/**
 * 프롬프트 UI — 팔레트·StepRail 은 `ascii-cli-test/preview.js` 목업에서 가져왔다(원본 제거).
 * 스텝 전이는 `flow.ts` 의 순수 함수가 전부 결정한다(여기는 그리기만).
 * 사용자에게 보이는 문구는 영어로 맞춘다.
 */

import { Box, Text, useApp, useInput } from 'ink';
import React, { useState } from 'react';

import { derive } from './derive.ts';
import {
  advance,
  editingField,
  initialFlow,
  isUsableAsSlug,
  setField,
  STEP_LABELS,
  STEP_ORDER,
  toInput,
} from './flow.ts';

import type { AppInput } from './derive.ts';
import type { FlowState, StepId } from './flow.ts';

const colors = {
  active: '#FBBF24',
  activeSoft: '#FDE68A',
  doneSoft: '#99F6E4',
  error: '#FB7185',
  faint: '#475569',
  muted: '#94A3B8',
  softText: '#CBD5E1',
  text: '#F8FAFC',
} as const;

function StepRail({ step }: { step: StepId }) {
  const current = STEP_ORDER.indexOf(step);
  return (
    <Text>
      {STEP_ORDER.map((id, index) => (
        <Text
          color={
            index === current ? colors.activeSoft : index < current ? colors.doneSoft : colors.muted
          }
          key={id}
        >
          {`${index > 0 ? '  ──  ' : ''}${index === current ? '◆' : index < current ? '◇' : '○'} 0${index + 1} ${STEP_LABELS[id]}`}
        </Text>
      ))}
    </Text>
  );
}

function Field({ hint, label, value }: { hint: string; label: string; value: string }) {
  return (
    <Box flexDirection="column">
      <Text color={colors.softText}>{`  ${label}`}</Text>
      <Text color={colors.faint}>{`  ${hint}`}</Text>
      <Text>
        <Text color={colors.faint}>{'  › '}</Text>
        <Text color={colors.text}>{value}</Text>
        <Text color={colors.active}>▌</Text>
      </Text>
    </Box>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Text color={colors.muted}>
      {`  ${label.padEnd(13)}`}
      <Text color={colors.text}>{value}</Text>
    </Text>
  );
}

function Summary({ state }: { state: FlowState }) {
  const fields = derive(toInput(state));
  return (
    <Box flexDirection="column">
      <Text color={colors.doneSoft}>{'  Ready to create'}</Text>
      <Box flexDirection="column" marginTop={1}>
        <Row label="name" value={fields.name} />
        <Row label="displayName" value={fields.displayName || `(same as name)`} />
        <Row
          label="scheme"
          value={`${fields.scheme.development} / ${fields.scheme.preview} / ${fields.scheme.production}`}
        />
        <Row
          label="bundleId"
          value={`${fields.bundleId.development} / ${fields.bundleId.preview} / ${fields.bundleId.production}`}
        />
        <Row label="package" value="(same as bundleId)" />
        <Row label="version" value="0.0.1 (1)" />
        <Row label="appleTeamId" value={state.appleTeamId || '(Xcode automatic signing)'} />
      </Box>
    </Box>
  );
}

export type PromptResult = AppInput;

/** 입력만 담당한다 — 생성은 호출부가 한다. */
export function Prompt({ onDone }: { onDone: (result: PromptResult) => void }) {
  const { exit } = useApp();
  const [state, setState] = useState<FlowState>(initialFlow);

  const field = editingField(state.step);

  useInput((input, key) => {
    if (key.escape || (key.ctrl && input === 'c')) return exit();

    if (key.backspace || key.delete) {
      if (field) setState(setField(state, state[field].slice(0, -1)));
      return;
    }

    // 붙여넣기는 여러 글자가 한 번에 오고 줄바꿈이 섞일 수 있다 — 제어문자를 걷어내고
    // 줄바꿈이 섞여 있었으면 Enter 로 본다(안 그러면 값에 \r 이 그대로 들어간다).
    const text = input.replace(/\p{Cc}/gu, '');
    const filled = text && field ? setField(state, state[field] + text) : state;

    if (!(key.return || /[\r\n]/.test(input))) return setState(filled);
    if (filled.step === 'ready') return onDone(toInput(filled));
    setState(advance(filled));
  });

  return (
    <Box flexDirection="column" marginTop={1} paddingLeft={2}>
      <StepRail step={state.step} />
      <Box marginTop={1} />

      {state.step === 'name' ? (
        <Field
          hint="Shown on the home screen — any language (e.g. workout, 워크아웃)"
          label="App name"
          value={state.name}
        />
      ) : null}

      {state.step === 'slug' ? (
        <Field
          hint="Lowercase, digits, hyphens — drives the Xcode project, schemes and bundle id"
          label="Slug"
          value={state.slug}
        />
      ) : null}

      {state.step === 'team' ? (
        <Field
          hint="Optional — press Enter to skip and use Xcode automatic signing"
          label="Apple Team ID"
          value={state.appleTeamId}
        />
      ) : null}

      {state.step === 'ready' ? <Summary state={state} /> : null}

      {state.error ? <Text color={colors.error}>{`  ${state.error}`}</Text> : null}

      <Box marginTop={1}>
        <Text color={colors.faint}>
          {state.step === 'ready'
            ? '  Enter create · Esc cancel'
            : state.step === 'name' && isUsableAsSlug(state.name)
              ? '  Enter continue (slug: reuses this name) · Esc cancel'
              : '  Enter continue · Esc cancel'}
        </Text>
      </Box>
    </Box>
  );
}

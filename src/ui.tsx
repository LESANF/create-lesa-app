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
  stepOrder,
  toInput,
} from './flow.ts';

import type { AppInput } from './derive.ts';
import type { FlowState } from './flow.ts';

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

function StepRail({ state }: { state: FlowState }) {
  const order = stepOrder(state);
  const current = order.indexOf(state.step);
  return (
    <Text>
      {order.map((id, index) => (
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

const ENVS = ['development', 'preview', 'production'] as const;

function Row({ label, note, value, width }: Row) {
  return (
    <Text color={colors.muted}>
      {`    ${label.padEnd(width)}`}
      <Text color={colors.text}>{value}</Text>
      {note ? <Text color={colors.faint}>{`   ${note}`}</Text> : null}
    </Text>
  );
}

type Row = { label: string; note?: string; value: string; width: number };

function Summary({ state }: { state: FlowState }) {
  const fields = derive(toInput(state));

  const top: Omit<Row, 'width'>[] = [
    {
      label: 'Display name',
      note: fields.displayName ? 'under the app icon' : 'same as project name',
      value: fields.displayName || fields.name,
    },
    { label: 'Project name', note: 'Xcode project · Expo slug', value: fields.name },
    { label: 'Version', value: '0.0.1 (build 1)' },
    {
      label: 'iOS signing',
      note: state.appleTeamId ? 'Apple Team ID' : undefined,
      value: state.appleTeamId || 'Xcode automatic',
    },
  ];
  // 라벨·환경명·scheme 열 폭을 내용에서 잡는다 — slug 길이에 따라 안 어긋나게.
  const labelWidth = Math.max(...top.map(row => row.label.length), 'production'.length) + 2;
  const schemeWidth = Math.max(...ENVS.map(env => fields.scheme[env].length), 'URL scheme'.length) + 3;

  return (
    <Box flexDirection="column">
      <Text color={colors.doneSoft}>{'  Ready to create'}</Text>
      <Box flexDirection="column" marginTop={1}>
        {top.map(row => (
          <Row key={row.label} {...row} width={labelWidth} />
        ))}
      </Box>
      <Box flexDirection="column" marginTop={1}>
        <Text color={colors.faint}>
          {`    ${''.padEnd(labelWidth)}${'URL scheme'.padEnd(schemeWidth)}iOS bundle ID · Android package`}
        </Text>
        {ENVS.map(env => (
          <Text color={colors.muted} key={env}>
            {`    ${env.padEnd(labelWidth)}`}
            <Text color={colors.text}>{fields.scheme[env].padEnd(schemeWidth)}</Text>
            <Text color={colors.text}>{fields.bundleId[env]}</Text>
          </Text>
        ))}
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
      <StepRail state={state} />
      <Box marginTop={1} />

      {state.step === 'name' ? (
        <Field
          hint="Any language. Lowercase ASCII doubles as the slug; anything else asks for one"
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

      {state.step === 'display' ? (
        <Field
          hint={`Optional — Enter keeps "${state.name}". Set it to control casing and spacing`}
          label="Display name"
          value={state.display}
        />
      ) : null}

      {state.step === 'team' ? (
        <Field
          hint="Optional, iOS only — Enter to skip and use Xcode automatic signing. Android needs nothing here."
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
              : state.step === 'display' || state.step === 'team'
                ? '  Enter skip or continue · Esc cancel'
                : '  Enter continue · Esc cancel'}
        </Text>
      </Box>
    </Box>
  );
}

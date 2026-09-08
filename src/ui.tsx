/**
 * 프롬프트 UI — @clack/prompts 의 세로 레일 + ink 내장 박스(`cli-boxes`) 조합.
 * 답한 값은 레일에 남겨 무엇을 입력했는지 계속 보이게 한다.
 * 스텝 전이는 `flow.ts` 순수 함수가 결정한다(여기는 그리기만). 문구는 영어.
 */

import { Box, Text, useApp, useInput } from 'ink';
import React, { useState } from 'react';

import { derive } from './derive.ts';
import { advance, answered, editingField, initialFlow, setField, toInput } from './flow.ts';

import type { AppInput } from './derive.ts';
import type { FlowState } from './flow.ts';

const colors = {
  accent: '#FBBF24',
  done: '#2DD4BF',
  doneSoft: '#99F6E4',
  error: '#FB7185',
  /** 힌트·지시문. 종전 #475569 는 어두운 터미널에서 거의 안 보였다. */
  faint: '#94A3B8',
  muted: '#CBD5E1',
  pending: '#64748B',
  /** 세로선·테두리. 종전 #334155 는 배경에 묻혔다. */
  rail: '#7C8DA6',
  softText: '#E2E8F0',
  text: '#F8FAFC',
} as const;

const ENVS = ['development', 'preview', 'production'] as const;

const PANEL_WIDTH = 66;

/**
 * 세로 레일 — 왼쪽 테두리만 켠 Box 라 내용 높이만큼 `│` 가 알아서 늘어난다.
 * 마커(◆/◇)는 각 절의 첫 줄 안에 넣는다(별도 열로 두면 박스 옆에서 레일이 끊긴다).
 */
export function Rail({ children }: { children: React.ReactNode }) {
  return (
    <Box
      borderBottom={false}
      borderLeftColor={colors.rail}
      borderRight={false}
      borderStyle="single"
      borderTop={false}
      flexDirection="column"
      marginLeft={2}
      paddingLeft={2}
    >
      {children}
    </Box>
  );
}

/** 레일 위 한 절 — 마커 + 제목, 그 아래 내용. */
export function Section({
  children,
  color,
  marker,
  title,
}: {
  children?: React.ReactNode;
  color: string;
  marker: string;
  title: string;
}) {
  return (
    <>
      <Text color={colors.rail}>{'\u00a0'}</Text>
      <Text>
        <Text color={color}>{`${marker} `}</Text>
        <Text color={colors.softText}>{title}</Text>
      </Text>
      {children}
    </>
  );
}

/** `width` 를 주면 고정폭(입력 칸), 안 주면 내용에 맞춘다(요약 표는 잘리면 안 된다). */
function Panel({
  children,
  color,
  width,
}: {
  children: React.ReactNode;
  color: string;
  width?: number;
}) {
  return (
    // alignSelf 없으면 flex column 의 기본 stretch 로 레일 폭까지 늘어난다.
    <Box
      alignSelf="flex-start"
      borderColor={color}
      borderStyle="round"
      flexDirection="column"
      paddingX={1}
      width={width}
    >
      {children}
    </Box>
  );
}

function Summary({ state }: { state: FlowState }) {
  const fields = derive(toInput(state));
  const rows = [
    {
      label: 'Home screen',
      note: fields.displayName ? undefined : 'same as project name',
      value: fields.displayName || fields.name,
    },
    { label: 'Project name', note: 'Xcode · Expo slug', value: fields.name },
    { label: 'Version', note: undefined, value: '0.0.1 (build 1)' },
    {
      label: 'iOS signing',
      note: undefined,
      value: state.appleTeamId || 'Xcode automatic',
    },
  ];
  // 열 폭을 내용에서 잡는다 — slug 이 길어도 어긋나지 않는다.
  const labelWidth = Math.max(...rows.map(row => row.label.length), 'development'.length) + 2;
  const schemeWidth = Math.max(...ENVS.map(env => fields.scheme[env].length), 10) + 3;

  return (
    <Panel color={colors.done}>
      {rows.map(row => (
        <Text color={colors.muted} key={row.label}>
          {row.label.padEnd(labelWidth)}
          <Text color={colors.text}>{row.value}</Text>
          {row.note ? <Text color={colors.faint}>{`   ${row.note}`}</Text> : null}
        </Text>
      ))}
      <Box marginTop={1} />
      <Text color={colors.faint}>
        {`${''.padEnd(labelWidth)}${'URL scheme'.padEnd(schemeWidth)}Bundle ID · Android package`}
      </Text>
      {ENVS.map(env => (
        <Text color={colors.muted} key={env}>
          {env.padEnd(labelWidth)}
          <Text color={colors.text}>{fields.scheme[env].padEnd(schemeWidth)}</Text>
          <Text color={colors.text}>{fields.bundleId[env]}</Text>
        </Text>
      ))}
    </Panel>
  );
}

const PROMPTS: Record<string, { hint: (state: FlowState) => string; title: string }> = {
  display: {
    hint: state => `optional · Enter keeps "${state.name}"`,
    title: 'Name on the home screen',
  },
  name: { hint: () => 'any language', title: 'App name' },
  slug: { hint: () => 'lowercase letters, digits, hyphens', title: 'Slug' },
  team: { hint: () => 'optional · iOS only · Enter to skip', title: 'Apple Team ID' },
};

export const railColors = colors;

const BAR_WIDTH = 28;

/** 채운 막대 + 개수. 총계를 모르면 막대를 안 그린다. */
export function Progress({ done, total }: { done: number; total: number }) {
  const filled = Math.round((done / total) * BAR_WIDTH);
  return (
    <Text>
      {'  '}
      <Text color={colors.done}>{'█'.repeat(filled)}</Text>
      <Text color={colors.pending}>{'░'.repeat(BAR_WIDTH - filled)}</Text>
      <Text color={colors.muted}>{`  ${done}/${total} files`}</Text>
    </Text>
  );
}

/** 생성 단계 목록 — 끝난 것·지금 것·남은 것을 한눈에 보여준다. */
export function Steps({
  current,
  details,
  labels,
  progress,
  skipped,
}: {
  current: number;
  /** 끝난 단계 옆에 붙는 설명 — `216 files` 처럼. */
  details?: Record<number, string>;
  labels: readonly string[];
  progress?: { done: number; total: number };
  skipped: Set<number>;
}) {
  const width = Math.max(...labels.map(label => label.length)) + 2;
  return (
    <>
      {labels.map((label, index) => {
        const state =
          skipped.has(index) ? 'skipped' : index < current ? 'done' : index === current ? 'now' : 'todo';
        const color =
          state === 'now' ? colors.accent : state === 'todo' ? colors.pending : colors.done;
        return (
          <React.Fragment key={label}>
            {index === 0 ? <Text color={colors.rail}>{'\u00a0'}</Text> : null}
            <Text>
              <Text color={color}>
                {`${state === 'now' ? '◆' : state === 'todo' ? '○' : state === 'skipped' ? '◌' : '◇'} `}
              </Text>
              <Text color={state === 'todo' ? colors.pending : colors.softText}>
                {details?.[index] || state === 'skipped' ? label.padEnd(width) : label}
              </Text>
              {state === 'skipped' ? (
                <Text color={colors.pending}>{'skipped'}</Text>
              ) : details?.[index] ? (
                <Text color={colors.faint}>{details[index]}</Text>
              ) : null}
            </Text>
            {state === 'now' && progress ? (
              <Progress done={progress.done} total={progress.total} />
            ) : null}
          </React.Fragment>
        );
      })}
    </>
  );
}

/** `┌ create-lesa-app` … `└ <footer>` 껍데기 — 프롬프트·진행·완료가 같은 모양을 쓴다. */
export function Frame({ children, footer }: { children: React.ReactNode; footer: string }) {
  return (
    <Box flexDirection="column" marginTop={1}>
      <Text>
        <Text color={colors.rail}>{'  ┌  '}</Text>
        <Text color={colors.softText}>create-lesa-app</Text>
      </Text>
      <Rail>
        {children}
        <Text color={colors.rail}>{'\u00a0'}</Text>
      </Rail>
      <Text>
        <Text color={colors.rail}>{'  └  '}</Text>
        <Text color={colors.faint}>{footer}</Text>
      </Text>
    </Box>
  );
}

export type PromptResult = AppInput;

/** 입력만 담당한다 — 생성은 호출부가 한다. */
export function Prompt({ onDone }: { onDone: (result: PromptResult) => void }) {
  const { exit } = useApp();
  const [state, setState] = useState<FlowState>(initialFlow);

  const field = editingField(state.step);
  const prompt = PROMPTS[state.step];
  const history = answered(state);

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

  const footer =
    state.step === 'ready'
      ? 'Enter create · Esc cancel'
      : state.step === 'display' || state.step === 'team'
        ? 'Enter skip or continue · Esc cancel'
        : 'Enter continue · Esc cancel';

  return (
    <Frame footer={footer}>
      {history.map(row => (
        <Section color={colors.done} key={row.label} marker="◇" title={row.label}>
          <Text color={colors.text}>{`  ${row.value}`}</Text>
        </Section>
      ))}

      <Section
        color={state.error ? colors.error : state.step === 'ready' ? colors.done : colors.accent}
        marker="◆"
        title={state.step === 'ready' ? 'Ready to create' : prompt.title}
      >
        {state.step === 'ready' ? (
          <Summary state={state} />
        ) : (
          <>
            <Text>
              {'  '}
              <Text color={colors.text}>{state[field!]}</Text>
              <Text color={state.error ? colors.error : colors.accent}>▌</Text>
            </Text>
            <Text color={colors.faint}>{`  ${prompt.hint(state)}`}</Text>
          </>
        )}
        {state.error ? <Text color={colors.error}>{`  ${state.error}`}</Text> : null}
      </Section>
    </Frame>
  );
}

import assert from 'node:assert/strict';
import { advance, editingField, initialFlow, setField, toInput } from './flow.ts';

/** 타이핑 시뮬레이션: 문자열을 넣고 Enter. */
function type(state, text) {
  return advance(setField(state, text));
}

// 1) 영문 이름 → slug 질문을 건너뛰고 team 으로, slug 은 이름과 같다
{
  let s = type(initialFlow, 'workout');
  assert.equal(s.step, 'team', 'ASCII name should skip the slug step');
  assert.equal(s.slug, 'workout');
  s = type(s, 'ABCDE12345');
  assert.equal(s.step, 'ready');
  assert.deepEqual(toInput(s), { appleTeamId: 'ABCDE12345', displayName: '', slug: 'workout' });
}

// 2) 한글 이름 → slug 을 반드시 묻는다
{
  let s = type(initialFlow, '워크아웃');
  assert.equal(s.step, 'slug', 'non-ASCII name must ask for a slug');
  assert.equal(editingField(s.step), 'slug');
  s = type(s, 'workout');
  assert.equal(s.step, 'team');
  s = advance(s); // Team ID 건너뛰기
  assert.equal(s.step, 'ready');
  assert.deepEqual(toInput(s), { appleTeamId: '', displayName: '워크아웃', slug: 'workout' });
}

// 3) 이름 비어 있으면 전진하지 않는다
{
  const s = advance(initialFlow);
  assert.equal(s.step, 'name');
  assert.ok(s.error);
}

// 4) 잘못된 slug 은 slug 스텝에 머문다
{
  let s = type(initialFlow, '워크아웃');
  for (const bad of ['Workout', '1workout', 'work_out', '-work', 'work out', '']) {
    const r = type(s, bad);
    assert.equal(r.step, 'slug', `"${bad}" should be rejected`);
    assert.ok(r.error, `"${bad}" should set an error`);
  }
  // 하이픈 포함은 통과
  assert.equal(type(s, 'my-workout').step, 'team');
}

// 5) 이름을 고쳐서 ASCII → 비ASCII 로 바꾸면 slug 을 다시 묻는다
{
  let s = type(initialFlow, 'workout');          // team
  assert.equal(s.slug, 'workout');
  s = advance({ ...s, step: 'name', name: '워크아웃' });
  assert.equal(s.step, 'slug', 'switching to a non-ASCII name must re-ask');
}

// 6) 공백만 있는 이름
{
  const s = advance(setField(initialFlow, '   '));
  assert.equal(s.step, 'name');
  assert.ok(s.error);
}

// 7) 앞뒤 공백은 잘린다
{
  const s = type(initialFlow, '  workout  ');
  assert.equal(s.name, 'workout');
  assert.equal(s.slug, 'workout');
  assert.equal(s.step, 'team');
}

console.log('flow: 7/7 groups pass');

// 8) 하이픈 slug — Android package 는 하이픈을 못 쓴다
{
  const { derive } = await import('./derive.ts');
  const f = derive({ displayName: '', slug: 'gym-log' });
  assert.equal(f.slug, 'gym-log');
  assert.equal(f.scheme.development, 'gym-log-dev', 'scheme allows hyphens');
  for (const value of [...Object.values(f.bundleId), ...Object.values(f.package)]) {
    assert.match(value, /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/, `invalid identifier: ${value}`);
  }
  assert.equal(f.package.development, 'com.gymlog.development');
  assert.equal(f.bundleId.production, 'com.gymlog');
  assert.deepEqual(f.package, f.bundleId, 'package must equal bundleId');
}

console.log('derive: hyphen slug produces a valid Android package');

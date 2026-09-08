import assert from 'node:assert/strict';

import { derive } from './derive.ts';
import { advance, editingField, initialFlow, setField, stepOrder, toInput } from './flow.ts';

/** 타이핑 시뮬레이션: 문자열을 넣고 Enter. */
function type(state, text) {
  return advance(setField(state, text));
}

// 1) 영문 이름 → slug 질문을 건너뛰고 홈 화면 이름을 묻는다
{
  let s = type(initialFlow, 'myapp');
  assert.equal(s.step, 'display', 'ASCII name should skip the slug step');
  assert.equal(s.slug, 'myapp');
  assert.deepEqual(stepOrder(s), ['name', 'display', 'team', 'ready']);
  s = advance(s); // 홈 화면 이름 생략
  assert.equal(s.step, 'team');
  s = type(s, 'ABCDE12345');
  assert.equal(s.step, 'ready');
  // 생략하면 비워둔다 — 템플릿이 `name` 으로 폴백한다
  assert.deepEqual(toInput(s), { appleTeamId: 'ABCDE12345', displayName: '', slug: 'myapp' });
}

// 2) 영문 이름 + 홈 화면 이름을 다듬는 경우 (my-app → "My App")
{
  let s = type(initialFlow, 'my-app');
  assert.equal(s.step, 'display');
  s = type(s, 'My App');
  assert.equal(s.step, 'team');
  s = advance(s);
  assert.deepEqual(toInput(s), { appleTeamId: '', displayName: 'My App', slug: 'my-app' });
}

// 3) 한글 이름 → slug 을 반드시 묻고, 이름이 곧 홈 화면 이름이다
{
  let s = type(initialFlow, '마이앱');
  assert.equal(s.step, 'slug', 'non-ASCII name must ask for a slug');
  assert.equal(editingField(s.step), 'slug');
  assert.deepEqual(stepOrder(s), ['name', 'slug', 'team', 'ready']);
  s = type(s, 'myapp');
  assert.equal(s.step, 'team', 'non-ASCII path must not ask for a display name');
  s = advance(s);
  assert.deepEqual(toInput(s), { appleTeamId: '', displayName: '마이앱', slug: 'myapp' });
}

// 4) 이름 비어 있거나 공백만이면 전진하지 않는다
{
  for (const bad of ['', '   ']) {
    const s = advance(setField(initialFlow, bad));
    assert.equal(s.step, 'name');
    assert.ok(s.error);
  }
}

// 5) 잘못된 slug 은 slug 스텝에 머문다
{
  const base = type(initialFlow, '마이앱');
  for (const bad of ['MyApp', '1myapp', 'my_app', '-work', 'my app', '']) {
    const r = type(base, bad);
    assert.equal(r.step, 'slug', `"${bad}" should be rejected`);
    assert.ok(r.error, `"${bad}" should set an error`);
  }
  assert.equal(type(base, 'my-app').step, 'team');
}

// 6) 이름을 ASCII → 비ASCII 로 고치면 slug 을 다시 묻는다
{
  const s = type(initialFlow, 'myapp'); // display
  assert.equal(s.slug, 'myapp');
  assert.equal(advance({ ...s, name: '마이앱', step: 'name' }).step, 'slug');
}

// 7) 앞뒤 공백은 잘린다
{
  const s = type(initialFlow, '  myapp  ');
  assert.equal(s.name, 'myapp');
  assert.equal(s.slug, 'myapp');
  const d = type(s, '  Work Out  ');
  assert.equal(d.display, 'Work Out');
}

console.log('flow: 7/7 groups pass');

// 8) 하이픈 slug — Android package 는 하이픈을 못 쓴다
{
  const f = derive({ displayName: '', slug: 'my-app' });
  assert.equal(f.slug, 'my-app');
  assert.equal(f.scheme.development, 'my-app-dev', 'scheme allows hyphens');
  for (const value of [...Object.values(f.bundleId), ...Object.values(f.package)]) {
    assert.match(value, /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/, `invalid identifier: ${value}`);
  }
  assert.equal(f.package.development, 'com.myapp.development');
  assert.equal(f.bundleId.production, 'com.myapp');
  assert.deepEqual(f.package, f.bundleId, 'package must equal bundleId');
}

console.log('derive: hyphen slug produces a valid Android package');

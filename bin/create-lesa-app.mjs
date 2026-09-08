#!/usr/bin/env node
/**
 * bin 진입점. `src/index.tsx` 를 node 가 직접 실행할 수 없어서(.tsx 확장자)
 * tsx 로더를 등록한 뒤 넘긴다 — 빌드 단계를 두지 않기 위한 4줄.
 */
import { register } from 'tsx/esm/api';

register();
await import('../src/index.tsx');

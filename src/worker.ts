import { blockingFunc } from './blockingFunc';

self.addEventListener('message', (e) => {
  const iterations = Number.parseInt(String(e.data));
  // 時間がかかる処理
  const result = blockingFunc(iterations);
  return result;
});

export default {};

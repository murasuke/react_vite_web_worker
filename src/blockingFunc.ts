/**
 * 時間がかかる処理(iterations:300で2秒前後)
 * @param iterations
 * @returns random()の合計
 */
export const blockingFunc = (iterations: number): number => {
  console.log(`\titerations: ${iterations} * 1,000,000 loop`);

  let result = 0;
  for (let i = 0; i < iterations; i++) {
    for (let j = 0; j < 1_000_000; j++) {
      result += Math.random();
    }
  }
  console.log(`\tresult:${result}`);
  // randomの合計を返す
  return result;
};

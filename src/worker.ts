self.addEventListener('message', (e) => {
  console.log('Web Workerで受信');
  console.log(e);
  setTimeout(() => {
    // 2秒後に処理終了
    self.postMessage('Web Workerで処理完了');
  }, 2000);
});

export default {};

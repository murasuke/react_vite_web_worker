import { useEffect, useRef } from 'react';
import Worker from './worker?worker'; // ?workerをつける
import { blockingFunc } from './blockingFunc';
import './App.css';

function App() {
  const roopCount = 300;
  const workerRef = useRef<Worker | null>(null);
  useEffect(() => {
    workerRef.current = new Worker(); // worker読み込み

    workerRef.current.onmessage = (event) => {
      const data = event.data;
      console.log('メインスレッドで受信:', data);
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const handleClickWorker = () => {
    if (workerRef.current) {
      console.log('start blockingFunc() in web worker');
      workerRef.current.postMessage(roopCount);
      console.log('end blockingFunc() in web worker');
    }
  };

  const handleClickSync = async () => {
    if (workerRef.current) {
      console.log('start blockingFunc()');
      const result = blockingFunc(roopCount);
      console.log(`end blockingFunc(): ${result}`);
    }
  };

  return (
    <div>
      <button onClick={() => handleClickWorker()}>
        時間がかかる関数をWebWorkerで非同期的に実行
      </button>
      <br />
      <button onClick={() => handleClickSync()}>
        時間がかかる関数を同期的に実行
      </button>
      <div className="return">実行結果はDevToolsのConsoleに出力されます。</div>
    </div>
  );
}

export default App;

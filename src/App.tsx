import { useEffect, useRef } from 'react';
// import Worker from './worker?worker'; // ?workerをつける
import './App.css';

function App() {
  const workerRef = useRef<Worker | null>(null);
  useEffect(() => {
    // workerRef.current = new Worker(); // worker読み込み
    workerRef.current = new Worker(new URL('./worker', import.meta.url), {
      type: 'module',
    });

    workerRef.current.onmessage = (event) => {
      const data = event.data;
      console.log('メインスレッドで受信:', data);
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const handleClick = () => {
    if (workerRef.current) {
      console.log('メインスレッドで送信');
      workerRef.current.postMessage('開始');
    }
  };

  return (
    <div>
      <button id="exec" onClick={() => handleClick()}>
        Web Workerで処理実行
      </button>
      <p>実行結果はDevToolsのConsoleに出力されます。</p>
    </div>
  );
}

export default App;

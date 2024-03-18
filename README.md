# React（Vite環境）でWeb Workerを導入する手順

## はじめに
create-react-appでは、Web Workerを導入するのが困難(※1)でした。

Viteの場合はどうやるか？気になったので調べてみると、
Web Workerの読み込みをサポートしているので、簡単に実現できました。


※1. できないことはないですが、トリッキーな方法でしか実現できませんでした
* publicフォルダにWorkerのJSファイルを配置して読み込む(TypeScriptで書けない)
* ejectしてからWebPackの設定に worker-loader または worker-plugin を追加する
* react-app-rewired を使ってWebPackの設定を無理やり書き換える
* WorkerのJSファイルをBlobとして読み込んでからWorkerスレッドを生成する

参考：
[create-react-app(TypeScript)で作成したアプリにWeb Workerを導入する方法](https://qiita.com/murasuke/items/897faa6b2e6e071bbcd0)


### [サンプルプログラム](https://murasuke.github.io/react_vite_web_worker/)
  ![img10](./img/img10.png)

※「実行結果は・・・」はCSSアニメーションで左右に動いています。時間がかかる処理をWeb Workerで実行した場合、画面はブロックされません。


作成したソースはこちら
https://github.com/murasuke/react_vite_web_worker

GitHub Pagesのページ
https://murasuke.github.io/react_vite_web_worker/


## 作成手順

### プロジェクト作成
* viteでReactプロジェクトを作成

```bash
$ npm create vite@latest react_vite_web_worker  -- --template react-ts
$ cd react_vite_web_worker
$ code .
```

### 時間がかかるテスト関数を作成

そのまま実行すると、メインスレッド(画面の再描画)をブロックする関数を作成します

```typescript:./src/blockingFunc.ts
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
```




### Web Workerから呼び出す

* Web Workerでイベントを受信後、2秒したら完了を返すテスト処理

```typescript:./src/worker.ts
import { blockingFunc } from './blockingFunc';

self.addEventListener('message', (e) => {
  const iterations = Number.parseInt(String(e.data));
  // 時間がかかる処理
  const result = blockingFunc(iterations);
  return result;
});

export default {};
```


### ReactからWeb Workerを呼び出す

* Reactコンポーネントの`useEffect()`でWeb Workerを読み込む
* ボタンクリックでWeb Workerの処理を呼び出す
*

```typescript:./src/database.ts
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
```

### CSSにアニメーション効果を追加

画面描画がブロックされていることがわかるように、「実行結果は・・・」を左右にアニメーションさせる。


```css:./src/App.css
@keyframes return {
  50% {
    left: 200px;
  }
  100% {
    left: 0px;
  }
}

.return {
  width:  320px;
  position: relative;
  left: 0px;
  top: 0;

  animation-name: return;
  animation-duration: 3s;
  animation-iteration-count: infinite;
  animation-timing-function: ease;
}

```

## 動作確認

```bash
$ npm run dev

  VITE v5.1.5  ready in 191 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```


* コンソールを開いてから、ボタンをクリックすると各処理の流れを追うことができます
  * App.tsxからの呼び出し
  * Web Workerで実行
  * 2秒後にApp.tsxで処理結果の受け取り

  ![img20](./img/img20.png)

* `Web Worker`で実行した場合は、画面のアニメーションが動き続けます
* `同期的`に実行した場合、計算が終わるでアニメーションが固まります


## おまけ GitHub Pagesにデプロイ

### `vite.config.ts` に`base:`を追加

`react_vite_web_worker` の部分は、リポジトリ名です

```javascript:vite.config.ts
export default defineConfig({
  base: process.env.GITHUB_PAGES ? 'react_vite_web_worker' : './',
```

### `package.json` の`build'を変更

* `dist`を`docs`にコピー

```json:package.json
    "build": "tsc && vite build && cp -r dist docs",
```


### GitHub Pagesで公開するための設定

* ①`Setting` ⇒ ②`Pages` をクリック
* ③公開するブランチ(main or master)と、公開するディレクトリ`docs`を選択して`Save`をクリック

![img30](./img/img30.png)

### ビルドとデプロイ

* ビルドの際`docs`ディレクトリが作成されることを確認（公開用）
```bash
$ npm run build
```

* デプロイ

コミットしてから、通常通りpushを行う

```bash
$ git push
```


### GitHub Pagesで公開されたことを確認

数分待ってから`https://murasuke.github.io/react_vite_web_worker/`へアクセスすると、GitHub Pagesで公開されたことが確認できる



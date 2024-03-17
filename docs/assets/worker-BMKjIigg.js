(function(){"use strict";self.addEventListener("message",e=>{console.log("Web Workerで受信"),console.log(e),setTimeout(()=>{self.postMessage("Web Workerで処理完了")},2e3)})})();

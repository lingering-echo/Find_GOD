const stages = [
  { size: 2, normal: "祝", god: "神" },
  { size: 3, normal: "伸", god: "神" },
  { size: 3, normal: "押", god: "神" },
  { size: 4, normal: "祌", god: "神" },
  { size: 5, normal: "袖", god: "神" }
];

let currentStage = 0;
let startTime;
let totalTime = 0;
let timerInterval;
let penalty = 0;
let godPosition = -1;

// 画面要素をグローバルに保持（タイミング問題回避）
let screens = null;

document.addEventListener('DOMContentLoaded', function() {
  screens = {
    title: document.getElementById("title"),
    intro: document.getElementById("intro"),
    game: document.getElementById("game"),
    nextStage: document.getElementById("nextStage"),
    result: document.getElementById("result"),
    godPop: document.getElementById("godPop")
  };
  console.log("DOMロード完了！screens初期化OK"); // デバッグ

  document.getElementById("startBtn").onclick = () => {
    if (screens) {
      screens.title.classList.remove("active");
      screens.intro.classList.add("active");
      startCountdown(3, () => startGame());
    }
  };
});

function startCountdown(num, callback) {
  if (!screens) {
    console.error("screensがnull！初期化待機");
    setTimeout(() => startCountdown(num, callback), 100);
    return;
  }
  let cdElement;
  if (screens.intro.classList.contains("active")) {
    cdElement = document.getElementById("countdown");
  } else if (screens.nextStage.classList.contains("active")) {
    cdElement = document.getElementById("nextCount");
  }
  if (cdElement) {
    cdElement.textContent = num;
    console.log(`カウントダウン: ${num}`); // デバッグ
  }
  if (num <= 0) {
    console.log("カウントダウン0！コールバック実行中...");
    setTimeout(() => {
      callback();
      console.log("コールバック完了！");
    }, 500);
    return;
  }
  setTimeout(() => startCountdown(num - 1, callback), 1000);
}

function startGame() {
  if (!screens) return;
  screens.intro.classList.remove("active");
  screens.game.classList.add("active");
  currentStage = 0;
  totalTime = 0;
  penalty = 0;
  nextStageFunc();
}

function nextStageFunc() {
  if (!screens) {
    console.error("nextStageFunc: screens null");
    return;
  }
  console.log(`nextStageFunc呼び出し: ステージ${currentStage + 1}`);
  
  // 次ステージ画面からゲーム画面へ強制切り替え
  screens.nextStage.classList.remove("active");
  screens.game.classList.add("active");
  console.log("画面切り替え: nextStage → game");

  if (currentStage >= stages.length) {
    showResult();
    return;
  }

  const stage = stages[currentStage];
  document.getElementById("stageNum").textContent = currentStage + 1;

  const grid = document.getElementById("grid");
  if (!grid) {
    console.error("grid要素なし");
    return;
  }
  grid.innerHTML = "";
  grid.style.gridTemplateColumns = `repeat(${stage.size}, 1fr)`;

  godPosition = Math.floor(Math.random() * (stage.size * stage.size));
  console.log(`ステージ${currentStage + 1}: 神位置 = ${godPosition}`);

  for (let i = 0; i < stage.size * stage.size; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.textContent = i === godPosition ? stage.god : stage.normal;
    
    (function(cellIndex) {
      cell.addEventListener('click', function() {
        console.log(`クリック: セル${cellIndex} (神? ${cellIndex === godPosition})`);
        clickCell(cellIndex === godPosition, this);
      });
    })(i);
    
    grid.appendChild(cell);
  }

  startTime = performance.now();
  clearInterval(timerInterval);
  timerInterval = setInterval(updateTimer, 10);
  console.log("グリッド生成&タイマー開始完了！");
}

function clickCell(isGod, cell) {
  clearInterval(timerInterval);
  const elapsed = (performance.now() - startTime) / 1000;
  
  if (!isGod) {
    penalty += 1;
    const wrongText = document.getElementById("wrong");
    if (wrongText) wrongText.style.opacity = "1";
    setTimeout(() => {
      if (wrongText) wrongText.style.opacity = "0";
      startTime = performance.now() - (elapsed * 1000);
      timerInterval = setInterval(updateTimer, 10);
    }, 800);
    return;
  }

  totalTime += elapsed + penalty;
  penalty = 0;
  cell.style.background = "#ffeb3b";
  console.log(`正解！総時間: ${totalTime.toFixed(2)}s`);
  showGodPop();
}

function showGodPop() {
  if (!screens) return;
  screens.godPop.style.display = "flex";
  console.log("神ポップアップ表示");

  const sparkles = document.querySelectorAll(".sparkle");
  sparkles.forEach((s) => {
    const angle = Math.random() * Math.PI * 2;
    const dist = 200 + Math.random() * 200;
    s.style.setProperty('--x', Math.cos(angle) * dist + "px");
    s.style.setProperty('--y', Math.sin(angle) * dist + "px");
    s.style.left = "50%";
    s.style.top = "50%";
    s.style.opacity = "1";
  });

  setTimeout(() => {
    screens.godPop.style.display = "none";
    currentStage++;
    console.log(`ステージ進捗: ${currentStage}/${stages.length}`);
    if (currentStage >= stages.length) {
      setTimeout(showResult, 500);
    } else {
      screens.game.classList.remove("active");
      screens.nextStage.classList.add("active");
      console.log("次ステージ画面表示 → カウントダウン開始");
      startCountdown(3, nextStageFunc);
    }
  }, 1800);
}

function updateTimer() {
  const elapsed = ((performance.now() - startTime) / 1000) + penalty;
  document.getElementById("timer").textContent = elapsed.toFixed(2) + "秒";
}

function showResult() {
  if (!screens) return;
  clearInterval(timerInterval);
  screens.game.classList.remove("active");
  screens.result.classList.add("active");
  console.log("リザルト画面表示");

  document.getElementById("finalTime").textContent = totalTime.toFixed(2);

  let rank = "地下落ち";
  let imgFile = "result_D.png";
  if (totalTime <= 5) { rank = "神"; imgFile = "result_S.png"; }
  else if (totalTime <= 7) { rank = "ワンヘッド"; imgFile = "result_A.png"; }
  else if (totalTime <= 10) { rank = "ハーフライフ"; imgFile = "result_B.png"; }
  else if (totalTime < 15) { rank = "凡人"; imgFile = "result_C.png"; }

  document.getElementById("rankText").textContent = rank;
  document.getElementById("resultBg").src = "images/" + imgFile;

  const text = `【神を探せ！】で${rank}（${totalTime.toFixed(2)}秒）になりました！あなたはどこまで行ける？`;
  document.getElementById("shareBtn").onclick = () => {
    if (navigator.share) {
      navigator.share({ title: '神を探せ！', text: text, url: location.href });
    } else {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(location.href)}`, '_blank');
    }
  };
}
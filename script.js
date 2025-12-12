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
let godPosition = -1; // 神の位置をグローバルに持つ

const screens = {
  title: document.getElementById("title"),
  intro: document.getElementById("intro"),
  game: document.getElementById("game"),
  nextStage: document.getElementById("nextStage"),
  result: document.getElementById("result"),
  godPop: document.getElementById("godPop")
};

// DOMが完全にロードされたら実行
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById("startBtn").onclick = () => {
    screens.title.classList.remove("active");
    screens.intro.classList.add("active");
    startCountdown(3, () => startGame());
  };
});

function startCountdown(num, callback) {
  let cdElement;
  if (document.getElementById("intro").classList.contains("active")) {
    cdElement = document.getElementById("countdown");
  } else if (document.getElementById("nextStage").classList.contains("active")) {
    cdElement = document.getElementById("nextCount");
  }
  if (cdElement) cdElement.textContent = num;
  if (num <= 0) {
    setTimeout(callback, 500);
    return;
  }
  setTimeout(() => startCountdown(num - 1, callback), 1000);
}

function startGame() {
  screens.intro.classList.remove("active");
  screens.game.classList.add("active");
  currentStage = 0;
  totalTime = 0;
  penalty = 0;
  nextStageFunc();
}

function nextStageFunc() {
  if (currentStage >= stages.length) {
    showResult();
    return;
  }

  const stage = stages[currentStage];
  document.getElementById("stageNum").textContent = currentStage + 1;

  const grid = document.getElementById("grid");
  grid.innerHTML = "";
  grid.style.gridTemplateColumns = `repeat(${stage.size}, 1fr)`;

  // 神の位置をランダム決定（グローバルに保存）
  godPosition = Math.floor(Math.random() * (stage.size * stage.size));

  for (let i = 0; i < stage.size * stage.size; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.textContent = i === godPosition ? stage.god : stage.normal;
    
    // 修正: イベントリスナーを個別に追加（クロージャ問題回避）
    cell.addEventListener('click', function() {
      clickCell(i === godPosition, this);
    });
    
    grid.appendChild(cell);
  }

  startTime = performance.now();
  clearInterval(timerInterval);
  timerInterval = setInterval(updateTimer, 10);
}

function clickCell(isGod, cell) {
  clearInterval(timerInterval);
  const elapsed = (performance.now() - startTime) / 1000;
  totalTime += elapsed + penalty;
  penalty = 0;

  if (!isGod) {
    // 不正解ペナルティ +1秒
    penalty = 1;
    const wrongText = document.getElementById("wrong");
    wrongText.style.opacity = 1;
    setTimeout(() => {
      wrongText.style.opacity = 0;
      // タイマー再開（経過時間を引き継ぎ）
      startTime = performance.now() - (elapsed * 1000);
      timerInterval = setInterval(updateTimer, 10);
    }, 800);
    return;
  }

  // 正解！✨神✨ポップアップ！
  cell.style.background = '#ffeb3b'; // 正解セルを金色に光らせるボーナス演出
  showGodPop();
}

function showGodPop() {
  screens.godPop.style.display = "flex";

  // キラキラ4つをランダムに飛ばす
  const sparkles = document.querySelectorAll(".sparkle");
  sparkles.forEach((s, index) => {
    const angle = Math.random() * Math.PI * 2;
    const dist = 200 + Math.random() * 200;
    s.style.setProperty('--x', (Math.cos(angle) * dist) + 'px');
    s.style.setProperty('--y', (Math.sin(angle) * dist) + 'px');
    s.style.left = '50%';
    s.style.top = '50%';
    s.style.opacity = '1'; // 初期表示
  });

  setTimeout(() => {
    screens.godPop.style.display = "none";
    currentStage++;
    if (currentStage >= stages.length) {
      setTimeout(showResult, 500);
    } else {
      screens.game.classList.remove("active");
      screens.nextStage.classList.add("active");
      startCountdown(3, nextStageFunc);
    }
  }, 1800);
}

function updateTimer() {
  const elapsed = ((performance.now() - startTime) / 1000) + penalty;
  document.getElementById("timer").textContent = elapsed.toFixed(2) + "秒";
}

function showResult() {
  clearInterval(timerInterval);
  screens.game.classList.remove("active");
  screens.result.classList.add("active");

  document.getElementById("finalTime").textContent = totalTime.toFixed(2);

  let rank = "地下落ち";
  let imgFile = "result_D.png";
  if (totalTime <= 5) { 
    rank = "神"; 
    imgFile = "result_S.png"; 
  } else if (totalTime <= 7) { 
    rank = "ワンヘッド"; 
    imgFile = "result_A.png"; 
  } else if (totalTime <= 10) { 
    rank = "ハーフライフ"; 
    imgFile = "result_B.png"; 
  } else if (totalTime < 15) { 
    rank = "凡人"; 
    imgFile = "result_C.png"; 
  }

  document.getElementById("rankText").textContent = rank;
  document.getElementById("resultBg").src = "images/" + imgFile;

  // Xシェアボタン
  const text = `【神を探せ！】で${rank}（${totalTime.toFixed(2)}秒）になりました！あなたはどこまで行ける？`;
  document.getElementById("shareBtn").onclick = () => {
    if (navigator.share) {
      navigator.share({ title: '神を探せ！', text: text, url: location.href });
    } else {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(location.href)}`, '_blank');
    }
  };
}
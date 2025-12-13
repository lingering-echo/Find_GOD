const stages = [
  { size: 2, normal: "祝", god: "神" },
  { size: 3, normal: "伸", god: "神" },
  { size: 3, normal: "視", god: "神" },
  { size: 4, normal: "押", god: "神" },
  { size: 5, normal: "袖", god: "神" }
];

let currentStage = 0, startTime, totalTime = 0, timerInterval, penalty = 0, godPosition = -1;
let screens = null;

document.addEventListener('DOMContentLoaded', () => {
  screens = {
    title: document.getElementById("title"),
    intro: document.getElementById("intro"),
    game: document.getElementById("game"),
    nextStage: document.getElementById("nextStage"),
    result: document.getElementById("result"),
    godPop: document.getElementById("godPop")
  };

  document.getElementById("startBtn").onclick = () => {
    screens.title.classList.remove("active");
    screens.intro.classList.add("active");
    startCountdown(3, startGame);
  };
});

function startCountdown(num, callback) {
  if (!screens) return setTimeout(() => startCountdown(num, callback), 100);
  const cd = screens.intro.classList.contains("active") ? document.getElementById("countdown") : document.getElementById("nextCount");
  if (cd) cd.textContent = num;
  if (num <= 0) return setTimeout(callback, 500);
  setTimeout(() => startCountdown(num - 1, callback), 1000);
}

function startGame() {
  screens.intro.classList.remove("active");
  screens.game.classList.add("active");
  currentStage = 0; totalTime = 0; penalty = 0;
  nextStageFunc();
}

function nextStageFunc() {
  if (!screens) return;
  screens.nextStage.classList.remove("active");
  screens.game.classList.add("active");

  if (currentStage >= stages.length) return showResult();

  const stage = stages[currentStage];
  document.getElementById("stageNum").textContent = currentStage + 1;

  const grid = document.getElementById("grid");
  grid.innerHTML = "";
  grid.style.gridTemplateColumns = `repeat(${stage.size}, 1fr)`;

  const cellSize = Math.min(
    (window.innerWidth * 0.9) / stage.size,
    (window.innerHeight * 0.6) / stage.size
  );
  const gridSize = cellSize * stage.size;
  grid.style.width = gridSize + 'px';
  grid.style.height = gridSize + 'px';
  grid.style.gap = Math.max(4, cellSize * 0.05) + 'px';

  godPosition = Math.floor(Math.random() * (stage.size * stage.size));

  for (let i = 0; i < stage.size * stage.size; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.textContent = i === godPosition ? stage.god : stage.normal;
    cell.style.fontSize = Math.min(cellSize * 0.7, 80) + 'px';
    (function(idx) { cell.addEventListener('click', () => clickCell(idx === godPosition, cell)); })(i);
    grid.appendChild(cell);
  }

  startTime = performance.now();
  clearInterval(timerInterval);
  timerInterval = setInterval(updateTimer, 10);
}

function clickCell(isGod, cell) {
  clearInterval(timerInterval);
  const elapsed = (performance.now() - startTime) / 1000;

  if (!isGod) {
    penalty += 1;
    const wrong = document.getElementById("wrong");
    wrong.textContent = "咎人！";
    wrong.style.opacity = "1";
    setTimeout(() => {
      wrong.style.opacity = "0";
      startTime = performance.now() - (elapsed * 1000);
      timerInterval = setInterval(updateTimer, 10);
    }, 800);
    return;
  }

  totalTime += elapsed + penalty;
  penalty = 0;
  cell.style.background = "#ffeb3b";
  showGodPop();
}

function showGodPop() {
  screens.godPop.style.display = "flex";
  document.querySelectorAll(".sparkle").forEach(s => {
    const a = Math.random() * Math.PI * 2;
    const d = 200 + Math.random() * 200;
    s.style.setProperty('--x', Math.cos(a) * d + 'px');
    s.style.setProperty('--y', Math.sin(a) * d + 'px');
    s.style.left = "50%"; s.style.top = "50%"; s.style.opacity = "1";
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
  const elapsed = (performance.now() - startTime) / 1000 + penalty;
  document.getElementById("timer").textContent = elapsed.toFixed(2) + "秒";
}

function showResult() {
  clearInterval(timerInterval);
  screens.game.classList.remove("active");
  screens.result.classList.add("active");

  document.getElementById("finalTime").textContent = totalTime.toFixed(2);

  let rank = "地下落ち", img = "result_D.png";
  if (totalTime <= 5)  { rank = "神";         img = "result_S.png"; }
  else if (totalTime <= 7)  { rank = "ワンヘッド";   img = "result_A.png"; }
  else if (totalTime <= 10) { rank = "ハーフライフ"; img = "result_B.png"; }
  else if (totalTime < 15)  { rank = "凡人";       img = "result_C.png"; }

  const rankEl = document.getElementById("rankText");
  rankEl.textContent = rank;
  rankEl.setAttribute("data-rank", rank);
  document.getElementById("resultBg").src = "images/" + img;

  const tweetText = `【非公式】【神を探せ！】で${rank}（${totalTime.toFixed(2)}秒）になりました！あなたは神ランクにたどりつける？`;
  const shareBtn = document.getElementById("shareBtn");
  shareBtn.textContent = "Xで神を布教する";
  shareBtn.onclick = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(location.href)}`, '_blank');
  };
}
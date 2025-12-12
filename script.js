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

const screens = {
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
  startCountdown(3, () => startGame());
};

function startCountdown(num, callback) {
  const cd = document.querySelector("#intro.active #countdown, #nextStage.active #nextCount") || {};
  if (cd) cd.textContent = num;
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

  const godPos = Math.floor(Math.random() * (stage.size * stage.size));
  for (let i = 0; i < stage.size * stage.size; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.textContent = i === godPos ? stage.god : stage.normal;
    cell.onclick = () => clickCell(i === godPos ? correct() : wrong());
    grid.appendChild(cell);
  }

  startTime = performance.now();
  clearInterval(timerInterval);
  timerInterval = setInterval(updateTimer, 10);
}

function wrong() {
  penalty += 1;
  const wrongText = document.getElementById("wrong");
  wrongText.style.opacity = 1;
  clearInterval(timerInterval);
  setTimeout(() => {
    wrongText.style.opacity = 0;
    timerInterval = setInterval(updateTimer, 10);
  }, 800);
}

function correct() {
  clearInterval(timerInterval);
  const elapsed = (performance.now() - startTime) / 1000;
  totalTime += elapsed + penalty;
  penalty = 0;
  showGodPop();
}

function showGodPop() {
  screens.godPop.style.display = "flex";

  const sparkles = document.querySelectorAll(".sparkle");
  sparkles.forEach(s => {
    const angle = Math.random() * Math.PI * 2;
    const dist = 200 + Math.random() * 200;
    s.style.setProperty('--x', Math.cos(angle) * dist + 'px');
    s.style.setProperty('--y', Math.sin(angle) * dist + 'px');
    s.style.left = '50%';
    s.style.top = '50%';
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
  screens.game.classList.remove("active");
  screens.result.classList.add("active");

  document.getElementById("finalTime").textContent = totalTime.toFixed(2);

  let rank = "地下落ち";
  let img = "D";
  if (totalTime <= 5) { rank = "神"; img = "S"; }
  else if (totalTime <= 7) { rank = "ワンヘッド"; img = "A"; }
  else if (totalTime <= 10) { rank = "ハーフライフ"; img = "B"; }
  else if (totalTime < 15) { rank = "凡人"; img = "C"; }

  document.getElementById("rankText").textContent = rank;
  document.getElementById("resultBg").src = `images/result_${img}.png`;

  const text = `【神を探せ！】で${rank}（${totalTime.toFixed(2)}秒）になりました！`;
  const url = location.href;
  document.getElementById("shareBtn").onclick = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
  };
}
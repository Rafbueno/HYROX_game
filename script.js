const player = document.getElementById('player');
const gameArea = document.getElementById('gameArea');
const scoreDisplay = document.getElementById('score');
const highscoreDisplay = document.getElementById('highscore');
const restartBtn = document.getElementById('restart');

let playerX = window.innerWidth / 2;
let score = 0;
let gameOver = false;
let highScore = localStorage.getItem('hyroxHighScore') || 0;
let spawnRate = 800;
let speed = 5;
let difficultyTimer;
let spawnTimeout;

highscoreDisplay.textContent = "High Score: " + highScore;

const obstacleData = [
  { img: 'images/hyroxrow.jpeg', width: 40, height: 40, speedFactor: 1 },
  { img: 'images/Hyroxrun.jpeg', width: 50, height: 50, speedFactor: 1.2 },
  { img: 'images/Hyroxsledw.jpeg', width: 30, height: 30, speedFactor: 0.8 },
  { img: 'images/rowererg.png', width: 50, height: 50, speedFactor: 0.5 },
  { img: 'images/SkiErg.png', width: 60, height: 60, speedFactor: 1.3 }
];

// Create background stars
function createStars() {
  for (let i = 0; i < 100; i++) {
    const star = document.createElement('div');
    star.classList.add('star');
    star.style.top = Math.random() * window.innerHeight + 'px';
    star.style.left = Math.random() * window.innerWidth + 'px';
    gameArea.appendChild(star);
  }
}

function animateStars() {
  const stars = document.querySelectorAll('.star');
  stars.forEach(star => {
    let top = parseFloat(star.style.top);
    top += 1;
    if (top > window.innerHeight) top = 0;
    star.style.top = top + 'px';
  });
  if (!gameOver) requestAnimationFrame(animateStars);
}

createStars();
requestAnimationFrame(animateStars);

// Handle window resizing
window.addEventListener('resize', () => {
  if (playerX > window.innerWidth - 40) playerX = window.innerWidth - 40;
  player.style.left = playerX + 'px';
});

// Player movement
document.addEventListener('keydown', e => {
  if (gameOver) return;
  if (e.key === 'ArrowLeft' && playerX > 0) playerX -= 20;
  if (e.key === 'ArrowRight' && playerX < window.innerWidth - 40) playerX += 20;
  player.style.left = playerX + 'px';
});

// Create obstacle with horizontal movement
function createObstacle() {
  if (gameOver) return;
  const data = obstacleData[Math.floor(Math.random() * obstacleData.length)];
  const obstacle = document.createElement('div');
  obstacle.classList.add('obstacle');
  obstacle.style.width = data.width + 'px';
  obstacle.style.height = data.height + 'px';
  let obstacleX = Math.floor(Math.random() * (window.innerWidth - data.width));
  obstacle.style.left = obstacleX + 'px';
  obstacle.style.backgroundImage = `url(${data.img})`;
  obstacle.style.backgroundSize = 'cover';
  gameArea.appendChild(obstacle);

  let obstacleY = -data.height;
  const obstacleSpeed = speed * data.speedFactor;
  const xSpeed = (Math.random() - 0.5) * 4; // horizontal drift

  function drop() {
    if (gameOver) return;
    obstacleY += obstacleSpeed;
    obstacleX += xSpeed;
    if (obstacleX < 0) obstacleX = 0;
    if (obstacleX > window.innerWidth - data.width) obstacleX = window.innerWidth - data.width;
    obstacle.style.top = obstacleY + 'px';
    obstacle.style.left = obstacleX + 'px';

    const playerRect = player.getBoundingClientRect();
    const obstacleRect = obstacle.getBoundingClientRect();

    if (
      playerRect.left < obstacleRect.right &&
      playerRect.right > obstacleRect.left &&
      playerRect.top < obstacleRect.bottom &&
      playerRect.bottom > obstacleRect.top
    ) {
      endGame();
    } else if (obstacleY > window.innerHeight) {
      obstacle.remove();
      score++;
      scoreDisplay.textContent = 'Score: ' + score;
      return;
    } else {
      requestAnimationFrame(drop);
    }
  }

  requestAnimationFrame(drop);
}

function endGame() {
  gameOver = true;
  clearInterval(difficultyTimer);
  clearTimeout(spawnTimeout);

  if (score > highScore) {
    highScore = score;
    localStorage.setItem('hyroxHighScore', highScore);
    highscoreDisplay.textContent = 'High Score: ' + highScore;
  }

  restartBtn.style.display = 'block';
}

function startDifficultyScaling() {
  clearInterval(difficultyTimer);
  difficultyTimer = setInterval(() => {
    if (spawnRate > 300) spawnRate -= 50;
    speed += 0.5;
  }, 10000);
}

function spawnObstacle() {
  if (!gameOver) {
    createObstacle();
    spawnTimeout = setTimeout(spawnObstacle, spawnRate);
  }
}

function startGame() {
  score = 0;
  gameOver = false;
  spawnRate = 800;
  speed = 5;
  playerX = window.innerWidth / 2;
  player.style.left = playerX + 'px';
  scoreDisplay.textContent = 'Score: 0';
  restartBtn.style.display = 'none';

  document.querySelectorAll('.obstacle').forEach(o => o.remove());

  clearTimeout(spawnTimeout);
  spawnObstacle();
  startDifficultyScaling();
}

restartBtn.addEventListener('click', startGame);
startGame();

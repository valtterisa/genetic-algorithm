const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

const target = { x: canvas.width / 2, y: canvas.height }; // target position

const ballCount = 150;
const ballRadius = 5;
let step = 0; // current step in the gene sequence

let balls = [];

function createGenesForBall() {
  // gene length 200
  let genes = [];
  for (let i = 0; i < 200; i++) {
    genes.push({
      vx: Math.random() * 2 - 1,
      vy: Math.random() * 2 - 1,
    });
  }
  return genes; // returns genes [{vx: 0.5, vy: 0.3}, {vx: 0.2, vy: 0.8}, ...]
}

function calcFitness(balls) {
  for (let i = 0; i < balls.length; i++) {
    let distance = sqrt(
      (balls[i].x - target.x) ^ (2 + (balls[i].y - target.y)) ^ 2,
    );
    balls[i].fitness = 1 / (distance + 1); // fitness is higher when distance is smaller
  }
  balls.sort((a, b) => b.fitness - a.fitness); // sort balls by fitness in descending order
}

function crossoverAndMutate(parent1, parent2, alpha) {}

// Create 100 balls with 200 random genes
for (let i = 0; i < 100; i++) {
  balls.push({
    genes: createGenesForBall(),
    fitness: 0,
    x: canvas.width / 2,
    y: 10,
  });
}

function drawBall(ball, step) {
  ball.x += ball.genes[step].vx;
  ball.y += ball.genes[step].vy;

  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2, false);
  ctx.fillStyle = "green";
  ctx.fill();
  ctx.closePath();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.rect(target.x, target.y, 20, 20);
  ctx.fillStyle = "green";
  ctx.fill();
  ctx.closePath();

  if (step === 200) {
    // calculate fitness and set it for all balls, sort balls by fitness in descending order
    calcFitness(balls);
    // select best 20% of balls and take 5% of top 50% mediocre balls
    let selectedBalls = balls
      .slice(0, 20)
      .concat(balls.slice(balls.length / 2, balls.length / 2 + 10));
    // crossover and mutation to create new generation of balls
    // loop over all balls and decide alpha
    let alpha = Math.random(); // alpha is a random number between 0 and 1
    for (let i = 0; i < balls.length; i++) {
      let parent1 =
        selectedBalls[Math.floor(Math.random() * selectedBalls.length)];
      let parent2 =
        selectedBalls[Math.floor(Math.random() * selectedBalls.length)];
      crossoverAndMutate(parent1, parent2, alpha);
    }
    // update x and y position of balls to start point
    // step = 0; start a new generation
  }

  for (let i = 0; i < balls.length; i++) {
    drawBall(balls[i], step);
  }

  step++;
}

function start() {
  setInterval(draw, 1000 / 60);
}

window.onload = () => {
  start();
};

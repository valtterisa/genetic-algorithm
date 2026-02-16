const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

const target = { x: canvas.width / 2, y: canvas.height - 20 };

let generation = 0;
const mutation = 0.02;
const ballCount = 100;
const geneCount = 600;
let bestTime = geneCount;
const ballRadius = 5;
const maxForce = 15;
let hitTarget = false;

let step = 0; // current step in the gene sequence

let balls = [];

function createGenesForBall() {
  let genes = [];

  for (let i = 0; i < geneCount; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const mag = Math.random() * maxForce; // 0..maxForce
    const vx = Math.cos(angle) * mag;
    const vy = Math.sin(angle) * mag;
    genes.push({
      vx: vx,
      vy: vy,
    });
  }
  return genes; // returns genes [{vx: 0.5, vy: 0.3}, {vx: 0.2, vy: 0.8}, ...]
}

function selectParent(balls, k) {
  let best = null;

  for (let i = 0; i < k; i++) {
    const randomIndex = Math.floor(Math.random() * balls.length);
    const contender = balls[randomIndex];

    if (best === null || contender.fitness > best.fitness) {
      best = contender;
    }
  }

  return best;
}

function calcFitness(balls) {
  for (let i = 0; i < balls.length; i++) {
    distance = Math.sqrt(
      (balls[i].x - target.x) ** 2 + (balls[i].y - target.y) ** 2,
    );

    const distanceScore = 1 / (distance + 1);

    let timeScore;
    let fitness;

    if (balls[i].hit) {
      timeScore = 1 - step / geneCount; // fitness is higher when it reaches the target faster
      bestTime = step; // update best time if this ball reached the target faster than the previous best time
      fitness += 5; // add a significant bonus for hitting the target
      fitness += 0.5 * timeScore; // add a smaller bonus for reaching the target faster
    } else {
      timeScore = 0; // no time score if it doesn't hit the target
    }

    // combine scores
    let alpha = 0.7; // alpha is a random number between 0 and 1, it determines the weight of distance score and time score in the final fitness score

    fitness = alpha * distanceScore + (1 - alpha) * timeScore; // fitness is higher when distance is smaller and when it reaches the target faster

    balls[i].fitness = fitness;
  }
  balls.sort((a, b) => b.fitness - a.fitness); // sort balls by fitness in descending order
}

function crossover(p1, p2, alpha) {
  const child1 = { genes: [] };
  const child2 = { genes: [] };

  for (let i = 0; i < p1.genes.length; i++) {
    child1.genes[i] = {
      vx: alpha * p1.genes[i].vx + (1 - alpha) * p2.genes[i].vx,
      vy: alpha * p1.genes[i].vy + (1 - alpha) * p2.genes[i].vy,
    };
    child2.genes[i] = {
      vx: (1 - alpha) * p1.genes[i].vx + alpha * p2.genes[i].vx,
      vy: (1 - alpha) * p1.genes[i].vy + alpha * p2.genes[i].vy,
    };
  }
  return { child1, child2 };
}

function mutate(childGenes) {
  // mutate children per Gaussian distribution
  let rate = 0.02; // 1% of the genes are mutated
  let sigma = 0.05; // standard deviation of the Gaussian distribution
  for (let i = 0; i < childGenes.length; i++) {
    if (Math.random() < rate) {
      const u1 = Math.random();
      const u2 = Math.random();
      const standardNormal =
        Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);

      childGenes[i].vx = childGenes[i].vx + standardNormal * sigma;
      childGenes[i].vy = childGenes[i].vy + standardNormal * sigma;
    }
  }
  return childGenes;
}

for (let i = 0; i < ballCount; i++) {
  balls.push({
    genes: createGenesForBall(),
    fitness: 0,
    distance: 0,
    x: canvas.width / 2,
    y: 10,
    hit: false,
    bestTime: bestTime,
  });
}

function drawBall(ball, step) {
  if (!ball.hit) {
    ball.x += ball.genes[step].vx;
    ball.y += ball.genes[step].vy;
  }
  const dx = ball.x - target.x;
  const dy = ball.y - target.y;
  const hitRadius = 15;

  if (dx * dx + dy * dy < hitRadius * hitRadius) {
    hitTarget = true;
    ball.hit = true;
  }

  if (ball.hit) {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2, false);
    ctx.fillStyle = "green";
    ctx.fill();
    ctx.closePath();
  } else {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2, false);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.closePath();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.beginPath();
  ctx.rect(target.x, target.y, 20, 20);
  ctx.fillStyle = "green";
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.font = "16px Arial";
  ctx.fillStyle = "black";
  ctx.fillText("Generation: " + generation, 10, 20);
  ctx.fillText("Best time: " + bestTime, 10, 40);
  ctx.fillText("Mutation: " + mutation, 10, 60);
  ctx.closePath();

  if (step === geneCount || hitTarget) {
    // calculate fitness and set it for all balls, sort balls by fitness in descending order
    calcFitness(balls);

    let selectedBalls = [];
    let elitismCount = 5;

    for (let i = 0; i < elitismCount; i++) {
      selectedBalls.push(balls[i]);
      balls[i].genes = mutate(balls[i].genes);
      balls[i] = {
        genes: balls[i].genes,
        fitness: 0,
        distance: 0,
        x: canvas.width / 2,
        y: 10,
        hit: false,
      };
    }

    let alpha = Math.random(); // alpha is a random number between 0 and 1

    for (let i = 0; i < selectedBalls.length; i += 2) {
      let parent1 = selectedBalls[i];
      let parent2 = selectedBalls[i + 1];
      let { child1, child2 } = crossover(parent1, parent2, alpha);

      child1.genes = mutate(child1.genes);
      child2.genes = mutate(child2.genes);

      balls[i] = {
        genes: child1.genes,
        fitness: 0,
        distance: 0,
        x: canvas.width / 2,
        y: 10,
        hit: false,
      };
      balls[i + 1] = {
        genes: child2.genes,
        fitness: 0,
        distance: 0,
        x: canvas.width / 2,
        y: 10,
        hit: false,
      };
    }
    step = 0;
    hitTarget = false;
    generation++;
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

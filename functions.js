const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

const target = { x: canvas.width / 2, y: canvas.height - 20 };

let generation = 0;
const ballCount = 200;
const geneCount = 400;
const ballRadius = 5;
let step = 0; // current step in the gene sequence

let balls = [];

function createGenesForBall() {
  // gene length 200
  let genes = [];
  for (let i = 0; i < 400; i++) {
    genes.push({
      vx: Math.random() * 2 - 1,
      vy: Math.random() * 2 - 1,
    });
  }
  return genes; // returns genes [{vx: 0.5, vy: 0.3}, {vx: 0.2, vy: 0.8}, ...]
}

function selectParent(balls, k) {
  let best = null;

  for (let i = 0; i < k; i++) {
      // Valitaan satunnainen indeksi väliltä 0 - 149
      const randomIndex = Math.floor(Math.random() * balls.length);
      const contender = balls[randomIndex];

      // Jos tämä on ensimmäinen valittu tai parempi kuin edellinen paras
      if (best === null || contender.fitness > best.fitness) {
          best = contender;
      }
  }

  return best;
}

// this should track the closest ball gets and that is the best ball. Last position is not good
// since ball might go fast to the target and then come same distance back.
function calcFitness(balls) {
  for (let i = 0; i < balls.length; i++) {
    let minDistance = Infinity; // per ball minDistance looking for that best gene
    let x =  canvas.width / 2
    let y = 10
    for (let j = 0; j < balls[i].genes.length; j++) {
      let distance = 0;

      x += balls[i].genes[j].vx
      y += balls[i].genes[j].vy

      distance = Math.sqrt(
        ((x - target.x) ** 2) + ((y - target.y) ** 2)
      );
      if (distance < minDistance) {
        minDistance = distance
        balls[i].fitness = 1 / (distance + 1); // fitness is higher when distance is smaller
      }
    }
  }
  balls.sort((a, b) => b.fitness - a.fitness); // sort balls by fitness in descending order
}

function crossover(p1, p2, alpha) {
  const child1 = { genes: [] };
  const child2 = { genes: [] };

    for (let i = 0; i < p1.genes.length; i++) {
        child1.genes[i] = { vx: alpha * p1.genes[i].vx + (1 - alpha) * p2.genes[i].vx, vy: alpha * p1.genes[i].vy + (1 - alpha) * p2.genes[i].vy };
        child2.genes[i] = { vx: (1 - alpha) * p1.genes[i].vx + alpha * p2.genes[i].vx, vy: (1 - alpha) * p1.genes[i].vy + alpha * p2.genes[i].vy };
    }    
    return {child1, child2};
}

function mutate(childGenes) {
  // mutate children per Gaussian distribution
  let rate = 0.05; // 1% of the genes are mutated
  let sigma = 0.1; // standard deviation of the Gaussian distribution
  for (let i = 0; i < childGenes.length; i++) {
      if (Math.random() < rate) {
        const u1 = Math.random();
        const u2 = Math.random();
        const standardNormal = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        
        childGenes[i].vx = childGenes[i].vx + standardNormal * sigma;
        childGenes[i].vy = childGenes[i].vy + standardNormal * sigma;

      }
  }
  return childGenes
}

// Create 100 balls with 200 random genes
for (let i = 0; i < ballCount; i++) {
  balls.push({
    genes: createGenesForBall(),
    fitness: 0,
    distance: 0,
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

  if (ball.x === target.x && ball.y === target.y) {
    ctx.fillStyle = "red"
    ctx.fill();
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
  ctx.closePath();

  if (step === geneCount) {
    // calculate fitness and set it for all balls, sort balls by fitness in descending order
    calcFitness(balls);

    let selectedBalls = [];
    let elitismCount = 20;

    for (let i = 0; i < elitismCount; i++) {
      selectedBalls.push(balls[i])
      // balls[i].genes = mutate(balls[i].genes)
      balls[i] = {
        genes: balls[i].genes,
        fitness: 0,
        distance: 0,
        x: canvas.width / 2,
        y: 10,
      };
    }
  
    // Tournament selection
    let alpha = Math.random(); // alpha is a random number between 0 and 1

    for (let i = elitismCount; i < balls.length; i+=2) {
      let parent1 = selectParent(balls, 3)
      let parent2 = selectParent(balls, 3)
      let {child1, child2} = crossover(parent1, parent2, alpha);
      
      child1.genes = mutate(child1.genes)
      child2.genes = mutate(child2.genes)

      balls[i] = {
      genes: child1.genes,
      fitness: 0,
      distance: 0,
      x: canvas.width / 2,
      y: 10,
    };
    balls[i + 1] = {
      genes: child2.genes,
      fitness: 0,
      distance: 0,
      x: canvas.width / 2,
      y: 10,
    };
    }
    step = 0;
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

let balls = [];
let playerBall;
let gameState = 'waiting';
let blinkCount = 0;
let maxBlinks = 5;
let startTime;
let score;

function setup() {
  createCanvas(windowWidth, windowHeight);
  playerBall = new PlayerBall();
  noStroke();
  initGame();
}

function draw() {
  background(0);

  if (gameState === 'running') {
    updateScore();
    displayScore();
    runGame();
  } else if (gameState === 'gameOver') {
    if (blinkCount < maxBlinks * 2) {
      blinkEffect();
    } else {
      displayRestartMessage();
    }
  }
}

function runGame() {
  for (let ball of balls) {
    ball.move();
    ball.display();
    ball.checkBorderCollision();
  }

  playerBall.move();
  playerBall.displayTrail();
  playerBall.display();

  for (let ball of balls) {
    if (playerBall.intersects(ball)) {
      gameState = 'gameOver';
      break;
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
  if (gameState === 'waiting' || (gameState === 'gameOver' && blinkCount >= maxBlinks * 2)) {
    initGame();
    gameState = 'running';
    blinkCount = 0;
    startTime = millis();
    score = 0;
  }
}

function initGame() {
  balls = [];
  balls.push(new Ball(width / 2, height / 2, 3, 3));
  playerBall.resetTrail();
}

function updateScore() {
  score = int((millis() - startTime) / 1000);
}

function displayScore() {
  textSize(20);
  fill(255);
  textAlign(CENTER, TOP);
  text("SECONDS SURVIVED: " + score, width / 2, 20);
}

function blinkEffect() {
  blinkCount++;
  if (blinkCount % 30 < 15) {
    for (let ball of balls) {
      ball.display();
    }
    playerBall.display();
  }
}

function displayRestartMessage() {
  textSize(32);
  fill(255);
  textAlign(CENTER, CENTER);
  text("CLICK TO RESTART", width / 2, height / 2);
}

class Ball {
  constructor(x, y, xSpeed, ySpeed) {
    this.x = x;
    this.y = y;
    this.diameter = 30;
    this.radius = this.diameter / 2;
    this.xSpeed = xSpeed;
    this.ySpeed = ySpeed;
    this.maxSpeed = 5;
    this.speedIncreaseFactor = 1.2;
    this.splitAllowed = true;
    this.splitTimer = 0;
    this.splitCooldown = 500;
    this.color = this.randomColor();
  }

  randomColor() {
    return color(random(255), random(255), random(255));
  }

  move() {
    this.x += this.xSpeed;
    this.y += this.ySpeed;

    if (!this.splitAllowed) {
      this.splitTimer += deltaTime;
      if (this.splitTimer > this.splitCooldown) {
        this.splitAllowed = true;
        this.splitTimer = 0;
      }
    }
  }

  display() {
    fill(this.color);
    ellipse(this.x, this.y, this.diameter, this.diameter);
  }

  checkBorderCollision() {
    let collided = false;

    if (this.x > width - this.radius || this.x < this.radius) {
      this.xSpeed *= -1;
      this.xSpeed = constrain(this.xSpeed * this.speedIncreaseFactor, -this.maxSpeed, this.maxSpeed);
      this.x = constrain(this.x, this.radius, width - this.radius);
      collided = true;
    }

    if (this.y > height - this.radius || this.y < this.radius) {
      this.ySpeed *= -1;
      this.ySpeed = constrain(this.ySpeed * this.speedIncreaseFactor, -this.maxSpeed, this.maxSpeed);
      this.y = constrain(this.y, this.radius, height - this.radius);
      collided = true;
    }

    if (collided) {
      this.color = this.randomColor();
      if (this.splitAllowed) {
        this.split();
      }
    }
  }

  split() {
    if (balls.length < 500) {
      let newBallSpeedX = random(-5, 5);
      let newBallSpeedY = random(-5, 5);
      balls.push(new Ball(this.x, this.y, newBallSpeedX, newBallSpeedY));
      this.splitAllowed = false;
    }
  }
}

class PlayerBall {
  constructor() {
    this.diameter = 30;
    this.radius = this.diameter / 2;
    this.trail = [];
    this.maxTrailLength = 10;
  }

  move() {
    this.x = mouseX;
    this.y = mouseY;
    this.trail.push({ x: this.x, y: this.y });

    if (this.trail.length > this.maxTrailLength) {
      this.trail.shift();
    }
  }

  display() {
    fill(255);
    ellipse(this.x, this.y, this.diameter, this.diameter);
  }

  displayTrail() {
    for (let i = 0; i < this.trail.length; i++) {
      let alpha = map(i, 0, this.trail.length, 0, 255);
      fill(255, 255, 255, alpha);
      let pos = this.trail[i];
      ellipse(pos.x, pos.y, this.diameter * (i / this.trail.length));
    }
  }

  resetTrail() {
    this.trail = [];
  }

  intersects(otherBall) {
    let d = dist(this.x, this.y, otherBall.x, otherBall.y);
    return d < this.radius + otherBall.radius;
  }
}

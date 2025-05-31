const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let brickRowCount = 3;
let brickColumnCount = 5;
let brickWidth, brickHeight, brickPadding, brickOffsetTop, brickOffsetLeft;
let ballRadius, paddleHeight, paddleWidth;

var paddleX;
let rightPressed = false, leftPressed = false;

function setDynamicSizes() {
    brickWidth = canvas.width / (brickColumnCount + 1);
    brickHeight = canvas.height / 16;
    brickPadding = brickWidth * 0.1;
    brickOffsetTop = canvas.height * 0.08;
    brickOffsetLeft = brickWidth * 0.5;
    ballRadius = Math.max(6, canvas.width / 60);
    paddleHeight = Math.max(8, canvas.height / 32);
    paddleWidth = Math.max(60, canvas.width / 5);
}

function resizeCanvas() {
    let w = Math.min(window.innerWidth * 0.98, 480);
    let h = Math.min(window.innerHeight * 0.8, 320);
    canvas.width = w;
    canvas.height = h;
    setDynamicSizes();
    paddleX = (canvas.width - paddleWidth) / 2;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 2;
let dy = -2;

let isTouching = false;
let lastTouchX = null;

let bricks = [];
function initBricks() {
    bricks = [];
    for(let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for(let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }
}
initBricks();

let score = 0;
let isGameOver = false;

document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);
canvas.addEventListener('touchstart', touchStartHandler, false);
canvas.addEventListener('touchmove', touchMoveHandler, false);
canvas.addEventListener('touchend', touchEndHandler, false);

function keyDownHandler(e) {
    if(e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = true;
    }
    else if(e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = true;
    }
}
function keyUpHandler(e) {
    if(e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = false;
    }
    else if(e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = false;
    }
}

function touchStartHandler(e) {
    if(e.touches.length === 1) {
        isTouching = true;
        lastTouchX = e.touches[0].clientX;
    }
}
function touchMoveHandler(e) {
    if(isTouching && e.touches.length === 1) {
        let touchX = e.touches[0].clientX;
        let deltaX = touchX - lastTouchX;
        paddleX += deltaX * (canvas.width / window.innerWidth);
        if(paddleX < 0) paddleX = 0;
        if(paddleX > canvas.width - paddleWidth) paddleX = canvas.width - paddleWidth;
        lastTouchX = touchX;
        e.preventDefault();
    }
}
function touchEndHandler(e) {
    isTouching = false;
    lastTouchX = null;
}

function collisionDetection() {
    for(let c = 0; c < brickColumnCount; c++) {
        for(let r = 0; r < brickRowCount; r++) {
            let b = bricks[c][r];
            if(b.status === 1) {
                if(x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                    dy = -dy;
                    b.status = 0;
                    score++;
                    if(score === brickRowCount * brickColumnCount) {
                        alert('축하합니다! 모든 벽돌을 깼어요!');
                        window.location.reload();
                    }
                }
            }
        }
    }
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI*2);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    for(let c = 0; c < brickColumnCount; c++) {
        for(let r = 0; r < brickRowCount; r++) {
            if(bricks[c][r].status === 1) {
                let brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
                let brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = '#FF7043';
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function drawScore() {
    ctx.font = '16px Arial';
    ctx.fillStyle = '#333';
    ctx.fillText('점수: ' + score, 8, 20);
}

function drawGameOver() {
    ctx.font = "32px Arial";
    ctx.fillStyle = "#d32f2f";
    ctx.textAlign = "center";
    ctx.fillText("게임 오버!", canvas.width/2, canvas.height/2);
}

function draw() {
    if (isGameOver) {
        drawGameOver();
        return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    collisionDetection();

    // 벽 충돌
    if(x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
    }
    if(y + dy < ballRadius) {
        dy = -dy;
    } else if(y + dy > canvas.height - ballRadius) {
        if(x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy;
        } else {
            isGameOver = true;
            drawGameOver();
            return;
        }
    }

    // 패들 이동
    if(rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 5;
    } else if(leftPressed && paddleX > 0) {
        paddleX -= 5;
    }

    x += dx;
    y += dy;
    requestAnimationFrame(draw);
}
draw();

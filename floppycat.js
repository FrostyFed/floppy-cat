//board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

//cat
let catWidth = 44;
let catHeight = 44;
let catX = boardWidth/8;
let catY = boardHeight/2;
let catImg;

let cat = {
    x : catX,
    y : catY,
    width : catWidth,
    height : catHeight
}

let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

let velocityX = -2;
let velocityY = 0;
let gravity = 0.4;
let gravityIncreaseRate = 0.002;

let gameOver = false;
let score = 0;

let jumpSound = new Audio('./jump.mp3');
let scoreSound = new Audio('./score.mp3');
let deathSound = new Audio('./death.mp3');
let bgMusic = new Audio('./background.mp3'); // Path to your background music file
bgMusic.loop = true;
let bgMusicPlayed = false;


window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d")

    catImg = new Image();
    catImg.src = "./floppycat.png";
    catImg.onload = function() {
        context.drawImage(catImg, cat.x, cat.y, cat.width, cat.height);
    }

    topPipeImg = new Image();
    topPipeImg.src = "./topscratchpost.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottomscratchpost.png"

    requestAnimationFrame(update);
    setInterval(placePipes, 1500);
    document.addEventListener("keydown", moveCat)

}

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    velocityY += gravity;
    cat.y = Math.max(cat.y + velocityY, 0);
    context.drawImage(catImg, cat.x, cat.y, cat.width, cat.height);

    if (cat.y > board.height) {
        gameOver = true;

        deathSound.currentTime = 0; // Reset sound
        deathSound.play();
    }

    velocityX = -2 - (score * 0.05); // Increase pipe speed as score increases
    if (velocityX < -8) {
        velocityX = -8; // Cap pipe speed to prevent it from getting too fast
    }

    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && cat.x > pipe.x + pipe.width) {
            score += 0.5;
            
            scoreSound.currentTime = 0; // Reset sound to the beginning
            scoreSound.play();


            pipe.passed = true;
        }

        if (detectCollision(cat, pipe)) {
            gameOver = true;

            deathSound.currentTime = 0; // Reset sound to the beginning
            deathSound.play();
        }
    }

    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift();
    }

    context.fillStyle = "white";
    context.font = "50px sans-serif"; 
    context.fillText(score, 10, 50);

    if (gameOver) {
        context.font = "60px sans-serif";  
        let textWidth = context.measureText("GAME OVER").width;
        let textX = (board.width - textWidth) / 2;  
        let textY = board.height / 2;  
        context.fillText("GAME OVER", textX, textY);

        context.font = "40px sans-serif";  
        let scoreText = "Final Score: " + Math.floor(score);  
        let scoreTextWidth = context.measureText(scoreText).width;
        let scoreTextX = (board.width - scoreTextWidth) / 2;  
        let scoreTextY = textY + 50;  
        context.fillText(scoreText, scoreTextX, scoreTextY);

        context.font = "15px sans-serif";  
        let restartText = "(Press Space to Restart)";
        let restartTextWidth = context.measureText(restartText).width;
        let restartTextX = (board.width - restartTextWidth) / 2;  
        let restartTextY = scoreTextY + 20;  
        context.fillText(restartText, restartTextX, restartTextY);
    }
}

function placePipes() {
    if (gameOver) {
        return;
    }

    let randomPipeY = pipeY - pipeHeight/4 - Math.random()*(pipeHeight/2);
    openingSpace = board.height/4;

    let topPipe = {
        img : topPipeImg,
        x : pipeX,
        y : randomPipeY,
        width : pipeWidth,
        height : pipeHeight,
        passed : false

    }

    pipeArray.push(topPipe);

    let bottomPipe = {
        img : bottomPipeImg,
        x : pipeX,
        y : randomPipeY + pipeHeight + openingSpace,
        width : pipeWidth,
        height : pipeHeight,
        passed: false
    }

    pipeArray.push(bottomPipe);
}

function moveCat(e) {
    if (e.code == "Space") {
        velocityY = -6;

        if (!bgMusicPlayed) {
            bgMusic.play().catch((error) => {
                console.log("Music couldn't play:", error);
            });
            bgMusicPlayed = true;
        }

        jumpSound.currentTime = .1; // Reset the sound to the start
        jumpSound.play();

        if (gameOver) {
            cat.y = catY;
            pipeArray = [];
            score = 0;
            gameOver = false;
        }
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}
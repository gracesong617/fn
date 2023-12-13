let socket = io.connect();
let playerID;

let playerAdded = false;

document.addEventListener("DOMContentLoaded", function () {
    var login = new Login();
    login.init();
});

function Login() {
    this.socket = io.connect();
}



Login.prototype.init = function () {
    var self = this;
    var backgroundMusic = document.getElementById("backgroundMusic");
    var musicPlayed = false;

    //score become 0
    self.socket.emit('initScores');

    self.socket.on("connect", function () {
        if (!musicPlayed) {
            var noticeElement = document.querySelector(".result .notice");
            if (noticeElement) {
                noticeElement.innerHTML = "";
            } else {
                console.error("Element with selector '.result .notice' not found.");
            }

            var textElement = document.querySelector(".result .connect");
            if (textElement) {
                textElement.textContent = "Connect Success!";
                backgroundMusic.volume = 0.2;
                document.addEventListener("click",function(){
                    backgroundMusic.play();
                    musicPlayed = true;
                });
            } else {
                console.error("Element with selector '.result .connect' not found.");
            }
        }
    });


    // create new room
    document.getElementById("build-button").addEventListener("click", function () {
        var buildTextValue = document.getElementById("build-button").value;

        var playerName = buildTextValue;
        self.socket.emit("login", playerName);

    });

    // get room code
    self.socket.on("loginSuccess", function (roomCode) {
        var textElement = document.querySelector(".result .text");
        if (textElement) {
            textElement.textContent = 'Your room code is ' + roomCode;
        } else {
            console.error("Element with selector '.result .text' not found.");
        }
    });


    // use room code to join the game
    document.getElementById("join-button").addEventListener("click", function () {
        var joinTextValue = document.getElementById("join-text").value;

        if (joinTextValue.trim().length <= 0) {
            var noticeElement = document.querySelector(".result .notice");
            var textElement = document.querySelector(".result .text");
            if (noticeElement) {
                noticeElement.textContent = "ERROR";
            }
            if (textElement) {
                textElement.textContent = "RoomCode Wrong";
            }
        } else {
            self.socket.emit("createRoom", joinTextValue);
        }
    });
    self.socket.on("addSuccess", function () {
        var textElement = document.querySelector(".join .text");
        if (textElement) {
            textElement.textContent = "Wait For Another Player";
            playerAdded = true;
            console.log(playerID);
        }
    });
    self.socket.on("gameStart", function () {
        var textElement = document.querySelector(".join .text");
        if (textElement) {
            textElement.textContent = "Scroll down to start the game!";
            console.log(playerID);
        }
    });
    self.socket.on("playerID", function (receivedPlayerID) {
        playerID = receivedPlayerID;
        window.player = playerID;
        console.log("Received playerID:", playerID);

    });

};



//game

let p1, p2, p1Image, p2Image, flashImage, roadImage, bgImage, hintImage;
let p1_X = 400, p2_X = 600;
let p1_Y = 520, p2_Y = 520;
let ystart = 520;
let move;
let isKeyPressed = false;
let p1score = 0, p2score = 0;

const badArray = [
    "images/bad1.png",
    "images/bad2.png",
    "images/bad3.png",
    "images/bad4.png",
];

const goodArray = [
    "images/good1.png",
    "images/good2.png",
    "images/good3.png",
    "images/good4.png",
    "images/good5.png",
    "images/good6.png",
    "images/good7.png",
    "images/good8.png",
];

let goodFoods = [];
let badFoods = [];
let goodImages = [];
let badImages = [];
let foodsize = 20;
let foodImagesLoaded = false;

let p1good, p1bad, p2good, p2bad, winsound;

function preload() {
    p1Image = loadImage('images/p1.png');

    p2Image = loadImage('images/p4.png');

    hintImage = loadImage('images/hint.png');

    bgImage = loadImage('images/bg1.png');

    // load good 
    for (let i = 0; i < goodArray.length; i++) {
        goodImages.push(loadImage(goodArray[i]));
    }

    // load bad
    for (let i = 0; i < badArray.length; i++) {
        badImages.push(loadImage(badArray[i]));
    }

    p1good = loadSound('music/p1good.m4a', () => { p1good.setVolume(8); });
    p1bad = loadSound('music/p1bad.m4a', () => { p1bad.setVolume(8); });
    p2good = loadSound('music/p2good.m4a', () => { p2good.setVolume(20); });
    p2bad = loadSound('music/p2bad.m4a', () => { p2bad.setVolume(0.5); });
    winsound = loadSound('music/win.m4a', () => { winsound.setVolume(8); });


}



function setup() {
    const myCanvas = createCanvas(1280, 720);
    //Set the parent of the canvas to an exisitng html element's id value 
    myCanvas.parent("canvas-container");
    // createCanvas(1280, 720);
    socket = io.connect();



    p1Image.resize(p1Image.width * 0.2, p1Image.height * 0.2);
    p2Image.resize(p2Image.width * 0.2, p2Image.height * 0.2);

    p1score = 0;
    p2score = 0;
};



function draw() {
    const myCanvas = createCanvas(windowWidth, 720);
    //Set the parent of the canvas to an exisitng html element's id value 
    myCanvas.parent("canvas-container");
    clear();

    background("#f3e8cc");
    fill("#ffe5e5");
    noStroke();
    rect(250, 20, 1030, 700);
    image(bgImage, 0, 0, 1280, 720);

    // hint
    textSize(18);
    fill(209, 81, 87);
    textFont('Indie Flower');

    text('Press w,a,s,d to move character.', 5, 130);
    text('Collect foods to get points.', 20, 160)
    text('Avoid non-food !', 50, 190)
    text('How to win : get 20 points.', 20, 220);



    if (playerID) {
        // playerInfo
        textSize(20);
        fill(209, 81, 87);
        textFont('Indie Flower');
        text(`You are: ${playerID}`, 65, 100);
    }

    //score

    handleKeyInput();

    //p1
    image(p1Image, 20, 350);
    text('p1 Momonga', 10, 340);
    text(`Score: ${p1score}`, 90, 380);

    //p2
    image(p2Image, 20, 450);
    text('p2 Usagi', 10, 440);
    text(`Score: ${p2score}`, 90, 480);

    if (playerAdded) {
        // p1 character
        if (playerID == '1p') {
            image(p1Image, p1_X, p1_Y);
        }

        // p2 character
        if (playerID == '2p') {
            image(p1Image, p1_X, p1_Y);
            image(p2Image, p2_X, p2_Y);
        } else {
            image(p1Image, p1_X, p1_Y);
            image(p2Image, p2_X, p2_Y);
        }
    }

    // good food
    for (let i = 0; i < goodFoods.length; i++) {
        image(goodImages[i % goodImages.length], goodFoods[i].x, goodFoods[i].y, foodsize, foodsize);
    }

    // bad food
    for (let i = 0; i < badFoods.length; i++) {
        image(badImages[i % badImages.length], badFoods[i].x, badFoods[i].y, foodsize, foodsize);
    }

    //check good food collision
    for (let i = goodFoods.length - 1; i >= 0; i--) {
        let distance1 = dist(p1_X, p1_Y, goodFoods[i].x, goodFoods[i].y);
        let distance2 = dist(p2_X, p2_Y, goodFoods[i].x, goodFoods[i].y);

        if (distance1 < foodsize / 2 + 11) {
            // good food, add score
            p1score++;
            p1good.play();
            // move good food
            goodFoods.splice(i, 1);
            //send to server
            socket.emit('eatFood', { playerId: '1p', foodType: 'good', foodIndex: i, p1score });
        }

        if (distance2 < foodsize / 2 + 11) {
            p2score++;
            p2good.play();
            goodFoods.splice(i, 1);
            //send to server
            socket.emit('eatFood', { playerId: '2p', foodType: 'good', foodIndex: i, p2score });
        }
    }


    // check bad food collision
    for (let i = badFoods.length - 1; i >= 0; i--) {
        let distance1 = dist(p1_X, p1_Y, badFoods[i].x, badFoods[i].y);
        let distance2 = dist(p2_X, p2_Y, badFoods[i].x, badFoods[i].y);

        if (distance1 < foodsize / 2 + 11) {
            // bad food, decrese socre
            p1score--;
            p1bad.play();
            p1score = max(p1score, 0);
            // move bad food
            badFoods.splice(i, 1);
            //send to server
            socket.emit('eatFood', { playerId: '1p', foodType: 'bad', foodIndex: i, p1score });
        }

        if (distance2 < foodsize / 2 + 11) {
            p2score--;
            p2bad.play();
            p2score = max(p2score, 0);
            badFoods.splice(i, 1);
            //send to server
            socket.emit('eatFood', { playerId: '2p', foodType: 'bad', foodIndex: i, p2score });
        }
    }


    socket.on('foodPositions', (foodPositions) => {
        // receive food position
        goodFoods = foodPositions.goodFoods;
        badFoods = foodPositions.badFoods;
        p1score = foodPositions.p1score;
        p2score = foodPositions.p2score;
    });


    socket.on("position1Fresh", function (position1) {
        if (playerID == "2p") {
            p1_Y = position1.y;
            p1_X = position1.x;
        }
    });

    socket.on("position2Fresh", function (position2) {
        if (playerID == "1p") {
            p2_Y = position2.y;
            p2_X = position2.x;
        }
    });


    socket.on("refresh", function () {
        location.reload();
    });

    socket.on("gameOver", function (result) {
        winsound.play();

        var userConfirmed = window.confirm(result + " is the Winner. Do you want to play again?");

        if (userConfirmed) {
            window.location.reload();
        } else {
            window.close();
        }
    });
}


function handleKeyInput() {
    //w
    if (keyCode === 87) {
        if (playerID == "1p") {
            p1_Y -= 1;
            socket.emit("position1", { x: p1_X, y: p1_Y });
        } else if (playerID == "2p") {
            p2_Y -= 1;
            socket.emit("position2", { x: p2_X, y: p2_Y });
        }
    }
    //a
    if (keyCode === 65) {
        if (playerID == "1p") {
            p1_X -= 1;
            socket.emit("position1", { x: p1_X, y: p1_Y });
        } else if (playerID == "2p") {
            p2_X -= 1;
            socket.emit("position2", { x: p2_X, y: p2_Y });
        }
    }
    //s
    if (keyCode === 83) {
        if (playerID == "1p") {
            p1_Y += 1;
            socket.emit("position1", { x: p1_X, y: p1_Y });
        } else if (playerID == "2p") {
            p2_Y += 1;
            socket.emit("position2", { x: p2_X, y: p2_Y });
        }
    }
    //d
    if (keyCode === 68) {
        if (playerID == "1p") {
            p1_X += 1;
            socket.emit("position1", { x: p1_X, y: p1_Y });
        } else if (playerID == "2p") {
            p2_X += 1;
            socket.emit("position2", { x: p2_X, y: p2_Y });
        }
    }
    if (!isKeyPressed) {
        // 停止移动的逻辑
        if (playerID === "1p") {
            socket.emit("position1", { x: p1_X, y: p1_Y });
        } else if (playerID === "2p") {
            socket.emit("position2", { x: p2_X, y: p2_Y });
        }
    }

}


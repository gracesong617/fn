let socket = io.connect();
let playerID;

document.addEventListener("DOMContentLoaded", function () {
    var login = new Login();
    login.init();
});

function Login() {
    this.socket = io.connect();
}

Login.prototype.init = function () {
    var self = this;
    
    self.socket.on("connect", function () {
        var noticeElement = document.querySelector(".result .notice");
        if (noticeElement) {
            noticeElement.innerHTML = "";
        } else {
            console.error("Element with selector '.result .notice' not found.");
        }

        var textElement = document.querySelector(".result .connect");
        if (textElement) {
            textElement.textContent = "Connect Success!";
        } else {
            console.error("Element with selector '.result .connect' not found.");
        }
    });

    // create new room
    document.getElementById("build-button").addEventListener("click", function () {
        var buildTextValue = document.getElementById("build-button").value;

            var playerName = buildTextValue;
            self.socket.emit("login",playerName);
    
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

let p1, p2, p1Image, p2Image, flashImage, roadImage, bgImage;
let p1_X = 310,p2_X = 410;
let p1_Y = 520,p2_Y = 520;
let ystart = 520;
let move;
let isKeyPressed = false;

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
let goodImages = []; // 新增数组用于存储好食物图像
let badImages = []; // 新增数组用于存储坏食物图像
let foodsize= 20;

function preload(){
    p1Image = loadImage('images/p1.png');

    p2Image = loadImage('images/p2.png');

    flashImage = loadImage('images/flash.jpg');
    roadImage = loadImage('images/road_bg.jpg');
    bgImage = loadImage('images/bg1.png');
   
    // 加载好食物图像
    for (let i = 0; i < goodArray.length; i++) {
        goodImages.push(loadImage(goodArray[i]));
    }

    // 加载坏食物图像
    for (let i = 0; i < badArray.length; i++) {
        badImages.push(loadImage(badArray[i]));
    }

   // 随机生成好食物的初始位置
   for (let i = 0; i < 60; i++) {
    goodFoods.push({
        x: random(200, 1240),
        y: random(50, 660)
    });
}

// 随机生成坏食物的初始位置
for (let i = 0; i < 50; i++) {
    badFoods.push({
        x: random(200, 1240),
        y: random(50, 660)
    });
}
}

function setup() {
    createCanvas(1280, 720);
    socket = io.connect();

    image(roadImage,200,50);
   
    p1Image.resize(p1Image.width * 0.2, p1Image.height * 0.2);
    p2Image.resize(p2Image.width * 0.2, p2Image.height * 0.2);
};



function draw(){
    clear();
    background("#f3e8cc");
    fill("#ffe5e5");
    noStroke();
    rect(200,20,1080,700);
    image(bgImage,0,0,1280,720);

     // hint
     textSize(15);
     fill(0);
     textFont('DotGothic16');
     text('press w to move character',10,130);

    image(roadImage,200,50);
    if (playerID) { 
        // playerInfo
        textSize(15);
        fill(0);
        textFont('DotGothic16');
        text(`You are: ${playerID}`, 10, 100);
    }
    
    //score
    //p1
    image(p1Image,20,250);
    text('p1 Momonga', 10, 240);
    text('Score:', 90, 280);

    //p2
    image(p2Image,20,350);
    text('p2 Chiikawa', 10, 340);
    text('Score:', 90, 380);

    //p1
      image(p1Image,p1_X,p1_Y);
    //p2
      image(p2Image,p2_X,p2_Y);
    // 绘制好食物
      for (let i = 0; i < goodFoods.length; i++) {
       image(goodImages[i % goodImages.length], goodFoods[i].x, goodFoods[i].y, foodsize, foodsize);
    }

    // 绘制坏食物
      for (let i = 0; i < badFoods.length; i++) {
       image(badImages[i % badImages.length], badFoods[i].x, badFoods[i].y, foodsize, foodsize);
    }




   
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
        alert(result + " is the Winner");
    });
}


function keyPressed() {
    //w
    if (keyCode === 87 && isKeyPressed === false) {
        if (playerID == "1p") {
            p1_Y -= 10;
            socket.emit("position1", { x: p1_X, y: p1_Y });
        } else if (playerID == "2p") {
            p2_Y -= 10;
            socket.emit("position2", { x: p2_X, y: p2_Y });
        }
        isKeyPressed = true;
    }
    //a
    if (keyCode === 65 && isKeyPressed === false) {
        if (playerID == "1p") {
            p1_X -= 10;
            socket.emit("position1", { x: p1_X, y: p1_Y });
        } else if (playerID == "2p") {
            p2_X -= 10;
            socket.emit("position2", { x: p2_X, y: p2_Y });
        }
        isKeyPressed = true;
    }
    //s
    if (keyCode === 83 && isKeyPressed === false) {
        if (playerID == "1p") {
            p1_Y += 10;
            socket.emit("position1", { x: p1_X, y: p1_Y });
        } else if (playerID == "2p") {
            p2_Y += 10;
            socket.emit("position2", { x: p2_X, y: p2_Y });
        }
        isKeyPressed = true;
    }
    //d
    if (keyCode === 68 && isKeyPressed === false) {
        if (playerID == "1p") {
            p1_X += 10;
            socket.emit("position1", { x: p1_X, y: p1_Y });
        } else if (playerID == "2p") {
            p2_X += 10;
            socket.emit("position2", { x: p2_X, y: p2_Y });
        }
        isKeyPressed = true;
    }
}

function keyReleased() {
    if (keyCode === 87) {
        isKeyPressed = false;
    }
    if (keyCode === 65) {
        isKeyPressed = false;
    }
    if (keyCode === 83) {
        isKeyPressed = false;
    }
    if (keyCode === 68) {
        isKeyPressed = false;
    }
}




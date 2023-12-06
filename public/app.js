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
    //score become 0
    self.socket.emit('initScores');
    
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
let p1_X = 400,p2_X = 600;
let p1_Y = 520,p2_Y = 520;
let ystart = 520;
let move;
let isKeyPressed = false;
let p1score=0, p2score=0;

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
let foodsize= 20;


function preload(){
    p1Image = loadImage('images/p1.png');

    p2Image = loadImage('images/p2.png');

    flashImage = loadImage('images/flash.jpg');
    roadImage = loadImage('images/road_bg.jpg');
    bgImage = loadImage('images/bg1.png');
   
    // load good 
    for (let i = 0; i < goodArray.length; i++) {
        goodImages.push(loadImage(goodArray[i]));
    }

    // load bad
    for (let i = 0; i < badArray.length; i++) {
        badImages.push(loadImage(badArray[i]));
    }

}



function setup() {
    createCanvas(1280, 720);
    socket = io.connect();

    
   
    p1Image.resize(p1Image.width * 0.2, p1Image.height * 0.2);
    p2Image.resize(p2Image.width * 0.2, p2Image.height * 0.2);

     p1score = 0;
     p2score = 0;
};



function draw(){
    clear();
    background("#f3e8cc");
    fill("#ffe5e5");
    noStroke();
    rect(250,20,1080,700);
    image(bgImage,0,0,1280,720);

     // hint
     textSize(15);
     fill(0);
     textFont('DotGothic16');
     text('press w,a,s,d to move character',10,130);
     text('Collect foods to get points',10,150)
     text('Avoid non-food',10,170)
     text('How to win: get 10 points', 10,190);

    
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
    text(`Score: ${p1score}`, 90, 280);

    //p2
    image(p2Image,20,350);
    text('p2 Chiikawa', 10, 340);
    text(`Score: ${p2score}`, 90, 380);

    //p1 character
      image(p1Image,p1_X,p1_Y);
    //p2 character
      image(p2Image,p2_X,p2_Y);

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
            // move good food
            goodFoods.splice(i, 1);
            //send to server
            socket.emit('eatFood', { playerId: '1p', foodType: 'good', foodIndex: i, p1score});
        }

        if (distance2 < foodsize / 2 + 11) {
            p2score++;
            goodFoods.splice(i, 1);
             //send to server
             socket.emit('eatFood', { playerId: '2p', foodType: 'good', foodIndex: i,p2score});
        }
    }


    // check bad food collision
    for (let i = badFoods.length - 1; i >= 0; i--) {
        let distance1 = dist(p1_X, p1_Y, badFoods[i].x, badFoods[i].y);
        let distance2 = dist(p2_X, p2_Y, badFoods[i].x, badFoods[i].y);

        if (distance1 < foodsize / 2 + 11) {
            // bad food, decrese socre
            p1score--;
            p1score = max(p1score, 0);
            // move bad food
            badFoods.splice(i, 1);
             //send to server
             socket.emit('eatFood', { playerId: '1p', foodType: 'bad', foodIndex: i,p1score});
        }

        if (distance2 < foodsize / 2 + 11) {
            p2score--;
            p2score = max(p2score, 0);
            badFoods.splice(i, 1);
             //send to server
             socket.emit('eatFood', { playerId: '2p', foodType: 'bad', foodIndex: i, p2score});
        }
    }


    socket.on('foodPositions', (foodPositions) => {
    // 从服务器接收到的食物位置
    goodFoods = foodPositions.goodFoods;
    badFoods = foodPositions.badFoods;
    p1score = foodPositions.p1score; // 更新 p1score
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




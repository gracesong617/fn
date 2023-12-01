
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
let p1_X,p2_X;
let p1_Y =520,p2_Y = 520;
let ystart = 520;
let move;
let isKeyPressed = false;


function preload(){
    p1Image = loadImage('images/p1.png');

    p2Image = loadImage('images/p2.png');

    flashImage = loadImage('images/flash.jpg');
    roadImage = loadImage('images/road_bg.jpg');
    bgImage = loadImage('images/bg1.png');
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

      //p1
      image(p1Image,310,p1_Y);
      //p2
      image(p2Image,410,p2_Y);



    socket.on("position1Fresh", function (position1) {
        if (playerID == "2p") {
          p1_Y = position1;
        }
    });
  
    socket.on("position2Fresh", function (position2) {
        if (playerID == "1p") {
          p2_Y = position2;
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
    if (keyCode === 87 && isKeyPressed === false) {
        if (window.player == "1p") {
            p1_Y -= 10;
            socket.emit("position1", p1_Y);
        } else if (window.player == "2p") {
            p2_Y -= 10;
            socket.emit("position2", p2_Y);
        }
        isKeyPressed = true;
    }
}

function keyReleased() {
    if (keyCode === 87) {
        isKeyPressed = false;
    }
}



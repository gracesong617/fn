//creating the express app
let express= require("express");
let app = express();
app.use("/", express.static("public"));

//creating the http server - this is a new step!
let http = require("http");
let server = http.createServer(app);
const PORT = process.env.PORT || 9999;
server.listen(PORT, () => {
    console.log("server on port ",PORT);
});

let roomCodeList = [];
let gamePlayer = 0;
  

//initialise socket.io
let io = require("socket.io")(server);

//listen for a new connection
io.sockets.on("connection", (socket) => {
  console.log("new connection :", socket.id);

  if (roomCodeList.length > 2 ){
    return;
  }
  //create room
  socket.on("login", (playerName) => {
    console.log(playerName);
    const roomCode = Math.floor(Math.random() * 10000);
    roomCodeList.push(roomCode);
    socket.join(roomCode);

    // Print the room code to the server console
    console.log("Room code created:", roomCode);
    
    // Send the room code to all clients
     io.emit("loginSuccess", roomCode);
  })

  //incase of disconnection
  socket.on("disconnect", function() {
    console.log("disconnection :", socket.id)
    roomCodeList = [];
    gamePlayer = 0;
    socket.broadcast.emit("refresh");
  });

  socket.on("createRoom", function(roomCode){
    //check roomcode
    //if roomcode not exist
    if (roomCodeList.indexOf(parseInt(roomCode)) != -1) {
        //add roomcode
        roomCodeList.push(roomCode);

        //send add success
        socket.emit("addSuccess");

        //add player number
        gamePlayer++;

        //check player number
        if (gamePlayer == 1 ){
            socket.position = "1p";
            socket.join(roomCode);
            const playerID = "1p";
            io.to(socket.id).emit("playerID", playerID);    
            console.log("player joined:",playerID);

        } else if (gamePlayer == 2) {
            socket.position = "2p";
            socket.join(roomCode);
            const playerID = "2p";
            io.to(socket.id).emit("playerID", playerID);
            console.log("player joined:",playerID);
        } else {
            socket.position = "wrong";
        }
        if (gamePlayer == 2) {
            console.log("Reached enough players");
            socket.emit("gameStart",socket.position)
            socket.broadcast.emit("GameStart","1p");
        }else {
            socket.position = "wrong";
        }
    }
  });

  socket.on("position1", function (position1) {
    socket.broadcast.emit("position1Fresh", { x: position1.x, y: position1.y });
    if (position1.y <= 50) {
        var result = "1p";
        socket.emit("gameOver", result);
        socket.broadcast.emit("gameOver", result);
    }
  
  });
  
  socket.on("position2", function (position2) {
    socket.broadcast.emit("position2Fresh", { x: position2.x, y: position2.y });
    if (position2.y <= 50) {
        var result = "2p";
        socket.broadcast.emit("gameOver", result);
        socket.emit("gameOver", result);
    }
  });

});





//game



//1
//setting up an http server
//setting up socket.io

//2
//ensure that the client can connect to the server via sockets
//server recognising the connect
//client attempting to connect

//3
//client draws and sends to server

//4
//server recieves and sends to all the clients

//5
//clients recieve and draw on their screens
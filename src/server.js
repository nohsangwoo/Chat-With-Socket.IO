import http from "http";
import SocketIO from "socket.io";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

// 처음 client와 연결됐을때 console로 소켓정보 찍어줌
wsServer.on("connection", (socket) => {
  // 프론트에서 "enter_room" 이라는 트리거작동 요청이 들어오면 작동하는 내용

  socket.on("enter_room", (roomName, done) => {
    console.log(roomName);
    // done은 작업이 완료됐다는걸 프론트 서버로 보내주는 동작임
    setTimeout(() => {
      done("hello from the backend");
    }, 3000);
  });
});

/*
const wss = new WebSocket.Server({ server });
const sockets = [];
wss.on("connection", (socket) => {
  sockets.push(socket);
  socket["nickname"] = "Anon";
  console.log("Connected to Browser ✅");
  socket.on("close", onSocketClose);
  socket.on("message", (msg) => {
    const message = JSON.parse(msg);
    switch (message.type) {
      case "new_message":
        sockets.forEach((aSocket) =>
          aSocket.send(`${socket.nickname}: ${message.payload}`)
        );
      case "nickname":
        socket["nickname"] = message.payload;
    }
  });
}); */

const handleListen = () => console.log(`Listening on http://localhost:3000`);
httpServer.listen(3000, handleListen);

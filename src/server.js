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

function publicRooms() {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = wsServer;
  const publicRooms = [];

  // 사용자키는 무시하고 방이름만 찾아서 publicRooms배열에 넣어준다.
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

// 처음 client와 연결됐을때 console로 소켓정보 찍어줌
wsServer.on("connection", (socket) => {
  // 임시 이름을 설정
  socket["nickname"] = "Anon";
  // 어떤 이벤트(트리거)가 동작했는지 동작한 이벤트 이름을 알려줌
  console.log("id: ", socket.id);
  socket.onAny((event) => {
    console.log(wsServer.sockets.adapter);
    console.log(`Socket Event: ${event}`);
  });

  socket.on("enter_room", (roomName, nickName, done) => {
    socket["nickname"] = nickName;
    // 방을 생성하는 socketIO명령어
    // 방이없으면 방을 생성하고 방이 이미 존재하면 해당 방에 참여시켜주는 기능
    // 자세한 동작은 socket.rooms에 추가된 방 리스트를 연결한다.
    // 이때 연결방식은 {"접속한 자신의 id, 방제목"} 이렇게 두개의 값을 가진다
    socket.join(roomName);
    console.log(socket.rooms);
    done();

    // 방을 만든직후 나를 제외한 방 안의 모든 접속자에게 프론트의 welcome트리거를 건드린다.
    // 또한 nickname변수를 같이 보낸다
    socket.to(roomName).emit("welcome", socket.nickname);
  });

  // 자동으로 유저가 나가면 작동되는 트리거
  socket.on("disconnecting", () => {
    console.log(socket.rooms);
    socket.rooms.forEach((room) => {
      // early return
      // 아이디정보를 가진 첫번째 요소에서는 emit작동을 안하게 만듬
      if (socket.id === room) {
        return;
      }
      console.log("disconnecting room?: ", room);
      socket.to(room).emit("bye", socket.nickname);
    });
  });

  socket.on("new_message", (msg, room, done) => {
    // 자동으로 나를 제외한 방 안의 나머지 사람들에게 데이터를 보냄
    // 나를 제외하는 타겟을 설정하기위해 filter작업을 할필요 없음(넘편함)
    socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);

    done();
  });
  socket.on("nickname", (nickname) => (socket["nickname"] = nickname));
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

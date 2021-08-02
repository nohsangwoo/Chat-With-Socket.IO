// 백엔드와 프론트가 같은서버에서 돌아가기때문에 이런식으로 설정가능
// 프론트 백엔드가 나뉘어져있다면 연결방식도 조금 달라짐
const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");

// form에서 submit 이벤트 핸들링
function handleRoomSubmit(event) {
  event.preventDefault();
  // form안의 input제어를 위해 dom을 불러온다
  const input = form.querySelector("input");
  // 백엔드로 "enter_room"이라는 트리거를 작동하게 요청을 보낸다
  // 이때 데이터를 같이보낸다
  socket.emit("enter_room", { payload: input.value }, () => {
    console.log("server is done!");
  });
  input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);

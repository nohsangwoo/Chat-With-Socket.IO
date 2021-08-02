// 백엔드와 프론트가 같은서버에서 돌아가기때문에 이런식으로 설정가능
// 프론트 백엔드가 나뉘어져있다면 연결방식도 조금 달라짐
const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

// 기본적으로 room이라는 아이디를 가진 태그를 hidden처리한다.
room.hidden = true;

let roomName;

// Backend에서 done응답과 동시에 메시지가 같이오는 경우 핸들링
// 방만들어진게 성공했을때 작동하는 함수
function showRoom() {
  // 방이름 입력할수있는 부분을 hidden처리
  welcome.hidden = true;
  // 메시지 입력해서 방만드는 부분(room 아이디를 가진 태그)의 hidden은 false처리
  room.hidden = false;

  // room의 h3태그안에 방제목을 TEXT로 넣기
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName}`;
}

// form에서 submit 이벤트 핸들링
function handleRoomSubmit(event) {
  event.preventDefault();
  // form안의 input제어를 위해 dom을 불러온다
  const input = form.querySelector("input");
  // 백엔드로 "enter_room"이라는 트리거를 작동하게 요청을 보낸다
  // 이때 데이터를 같이보낸다
  // emit의 세번째 인자엔 백엔드 서버에서 done작업 응답이 오는경우 작동하는 작업을 구현한다.
  socket.emit("enter_room", input.value, showRoom);
  roomName = input.value;
  input.value = "";
}

// welcome태그안의 form에서 submit이벤트가 동작할때 핸들링
form.addEventListener("submit", handleRoomSubmit);

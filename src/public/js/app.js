// 백엔드와 프론트가 같은서버에서 돌아가기때문에 이런식으로 설정가능
// 프론트 백엔드가 나뉘어져있다면 연결방식도 조금 달라짐
const socket = io();

const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");
const room = document.getElementById("room");

// 기본적으로 room이라는 아이디를 가진 태그를 hidden처리한다.
room.hidden = true;

let roomName;

// 전달받은 메시지를li태그로 감싸서 ul태그 안에 추가하여 렌더링해주는 함수
function addMessage(message) {
  // room태그의 ul태그를 찾아온다
  const ul = room.querySelector("ul");

  // li태그를 만들고
  const li = document.createElement("li");

  // li태그안의 텍스트 내용은 백엔드에서 전달받은 message를 넣고
  li.innerText = message;

  // 위 만들어진 li태그를 ul태그의 하위태그로 넣어준다.
  ul.appendChild(li);
}

// message보내는 작업
function handleMessageSubmit(event) {
  event.preventDefault();
  const input = room.querySelector("#msg input");
  const value = input.value;
  // 내가 방안의 모든 사람에게 메시지를 보내는 작업이 백엔드에서 작업완료가 됐다면
  // 작업완료 이후 내가 보낸 메시지를 내화면에 렌더링 시켜준다
  socket.emit("new_message", input.value, roomName, () => {
    addMessage(`You: ${value}`);
  });
  input.value = "";
}

// Backend에서 done응답과 동시에 메시지가 같이오는 경우 핸들링
// 방만들어진게 성공했을때 작동하는 함수
function showRoom() {
  // 방이름 입력할수있는 부분을 hidden처리
  // 방을 만들거나 참여했다면 이제는 채팅을 시작해야하는 단계니깐 방만드는 기능을 비활성화 시키는 것
  welcome.hidden = true;

  // 메시지 입력해서 방만드는 부분(room 아이디를 가진 태그)의 hidden은 false처리
  // 메시지 전달 기능을 활성화 시키는것
  room.hidden = false;

  // room의 h3태그안에 방제목을 TEXT로 넣기
  // 내가 만들거나 참여중인 방의 이름을 화면에 렌더링 하기 위한 것
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName}`;

  // 아래내용은 한번만 실행되는것처럼 보이지만 function이 실행되고 아래내용이 사라지는게 아님
  // room태그 안의 form을 불러온다
  const msgForm = room.querySelector("#msg");
  // room > form에서 submit 이벤트가 동작할시 핸들링
  // 이제 사용자가 메시지를 보내면 roomForm의 submit 이벤트가 작동함
  // 아래내용은 함수가 종료되도 계속 살아있음
  msgForm.addEventListener("submit", handleMessageSubmit);
}

// room태그의 form에서 submit 이벤트 핸들링
function handleRoomSubmit(event) {
  event.preventDefault();
  // form안의 input제어를 위해 dom을 불러온다
  const input = welcomeForm.querySelector("input");
  // 백엔드로 "enter_room"이라는 트리거를 작동하게 요청을 보낸다
  // 이때 데이터를 같이보낸다
  // emit의 세번째 인자엔 백엔드 서버에서 done작업 응답이 오는경우 작동하는 작업을 구현한다.
  socket.emit("enter_room", input.value, showRoom);
  roomName = input.value;
  input.value = "";
}

// welcome태그안의 form에서 submit이벤트가 동작할때 핸들링
welcomeForm.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (user) => {
  addMessage(`${user} arrived!`);
});

socket.on("bye", (left) => {
  addMessage(`${left} left ㅠㅠ`);
});

socket.on("new_message", addMessage);

const serverUrl = "http://localhost:4500/";
const videoGrid = document.getElementById("video-grid");
var peers = new Peer(undefined, { host: "/", port: "3000" });
const socket = io(serverUrl);

const myVideo = document.createElement("video");
myVideo.muted = true;

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    addVideoStream(myVideo, stream);

    peers.on("call", (call) => {
      call.answer(stream);
    });

    socket.on("user-connected", (data) => {
      connectToNewUser(data, stream);
    });
  });
peers.on("open", (id) => {
  socket.emit("Join-room", Room_Id, id);
});

function connectToNewUser(userId, stream) {
  const call = peers.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  call.on("close", () => {
    video.remove();
  });
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
}

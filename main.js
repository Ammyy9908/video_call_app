const peer = new Peer();
var currentCall;
peer.on("open", function (id) {
  document.getElementById("uuid").textContent = id;
});

async function callUser() {
  // get the id entered by the user
  const peerId = document.querySelector("input").value;
  // grab the camera and mic
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
  });
  // switch to the video call and play the camera preview
  document.getElementById("menu").style.display = "none";
  document.getElementById("live").style.display = "block";
  document.getElementById("local-audio").srcObject = stream;
  document.getElementById("local-audio").play();
  // make the call
  const call = peer.call(peerId, stream);
  call.on("stream", (stream) => {
    document.getElementById("remote-audio").srcObject = stream;
    document.getElementById("remote-audio").play();
  });
  call.on("data", (stream) => {
    document.querySelector("#remote-audio").srcObject = stream;
  });
  call.on("error", (err) => {
    console.log(err);
  });
  call.on("close", () => {
    endCall();
  });
  // save the close function
  currentCall = call;
}

peer.on("call", (call) => {
  if (confirm(`Accept call from ${call.peer}?`)) {
    // grab the camera and mic
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        // play the local preview
        document.querySelector("#local-audio").srcObject = stream;
        document.querySelector("#local-audio").play();
        // answer the call
        call.answer(stream);
        // save the close function
        currentCall = call;
        // change to the video view
        document.querySelector("#menu").style.display = "none";
        document.querySelector("#live").style.display = "block";
        call.on("stream", (remoteStream) => {
          // when we receive the remote stream, play it
          document.getElementById("remote-audio").srcObject = remoteStream;
          document.getElementById("remote-audio").play();
        });
      })
      .catch((err) => {
        console.log("Failed to get local stream:", err);
      });
  } else {
    // user rejected the call, close it
    call.close();
  }
});

function endCall() {
  // Go back to the menu
  document.querySelector("#menu").style.display = "block";
  document.querySelector("#live").style.display = "none";
  // If there is no current call, return
  if (!currentCall) return;
  // Close the call, and reset the function
  try {
    currentCall.close();
  } catch {}
  currentCall = undefined;
}

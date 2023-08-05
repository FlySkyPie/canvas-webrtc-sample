import { SampleViewSource } from "./sample-view-source";
import { ReceiverSession } from "./receiver-session";
import { TransmitterSession } from "./transmitter-session";
import "./style.css";

const canvasEl = document.querySelector("canvas")!;
const startBtn = document.querySelector("#startButton") as HTMLButtonElement;
const stopBtn = document.querySelector("#stopButton") as HTMLButtonElement;
const remoteVideo = document.getElementById("remoteVideo") as HTMLVideoElement;

stopBtn.disabled = true;

new SampleViewSource(canvasEl);

const handleClickStart = () => {
  startBtn.disabled = true;
  stopBtn.disabled = false;

  const remoteStream = new MediaStream();
  remoteVideo.srcObject = remoteStream;

  const transmitter = new TransmitterSession();
  const receiver = new ReceiverSession();

  transmitter.on("icecandidate", (candidate) =>
    receiver.addIceCandidate(candidate)
  );
  receiver.on("icecandidate", (candidate) =>
    transmitter.addIceCandidate(candidate)
  );

  transmitter.on("offer", (sdp) => receiver.offer(sdp));
  receiver.on("answer", (sdp) => transmitter.answer(sdp));

  receiver.on("track", (track) => remoteStream.addTrack(track));

  transmitter.attach(canvasEl.captureStream(20)); // Not work in Firefox.
  transmitter.start();

  const handleClickStop = () => {
    startBtn.disabled = false;
    stopBtn.disabled = true;
    stopBtn.removeEventListener("click", handleClickStop);

    remoteVideo.srcObject = null;

    transmitter.dispose();
    receiver.dispose();
  };

  stopBtn.addEventListener("click", handleClickStop);
};

startBtn.addEventListener("click", handleClickStart);

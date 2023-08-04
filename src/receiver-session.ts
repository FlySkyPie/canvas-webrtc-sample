import type {
  IRTCAnswerable,
  IRTCAnswerableEventMap,
} from "./types/rtc-answerable";
import type { IReceivable, IReceivableEventMap } from "./types/receivable";
import { TypedEventEmitter } from "./typed-event-emitter";

type IEventMap = IRTCAnswerableEventMap & IReceivableEventMap;

export class ReceiverSession implements IReceivable, IRTCAnswerable {
  private peerConnection = new RTCPeerConnection();
  private eventEmitter = new TypedEventEmitter<IEventMap>();

  constructor() {
    this.peerConnection.addEventListener(
      "icecandidate",
      this.handleIceCandidate
    );

    this.peerConnection.addEventListener("track", this.handleTrack);
  }

  public offer(value: RTCSessionDescriptionInit): void {
    console.log("ReceiverSession.offer", value);
    this.peerConnection.setRemoteDescription(value).then(() => {
      console.log("ReceiverSession", "setRemoteDescription", "done");
    });
    this.peerConnection.createAnswer().then((asnwer) => {
      console.log("ReceiverSession", "asnwer", asnwer.sdp);
      this.peerConnection.setLocalDescription(asnwer).then(()=>{
        console.log("ReceiverSession", "setLocalDescription", "done");
      });
      this.eventEmitter.emit("answer", asnwer);
    });
  }

  public addIceCandidate(candidate: RTCIceCandidateInit) {
    console.log("ReceiverSession.addIceCandidate", candidate);
    this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  }

  public on<K extends keyof IEventMap>(
    type: K,
    listener: (...eventArg: IEventMap[K]) => void
  ): void {
    this.eventEmitter.on(type, listener);
  }

  public dispose() {
    this.peerConnection.close();
    this.peerConnection.removeEventListener("track", this.handleTrack);
    this.peerConnection.removeEventListener(
      "icecandidate",
      this.handleIceCandidate
    );
    this.eventEmitter.removeAllListeners();
  }

  private handleIceCandidate = (event: RTCPeerConnectionIceEvent) => {
    console.log("ReceiverSession.handleIceCandidate", event);
    const { candidate } = event;
    candidate && this.eventEmitter.emit("icecandidate", candidate);
  };

  private handleTrack = ({ track }: RTCTrackEvent) => {
    console.log("ReceiverSession.handleTrack", track);
    this.eventEmitter.emit("track", track);
  };
}

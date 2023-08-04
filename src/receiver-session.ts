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
    this.peerConnection.setRemoteDescription(value);
  }

  public addIceCandidate(candidate: RTCIceCandidateInit) {
    this.peerConnection.addIceCandidate(candidate);
  }

  public on<K extends keyof IEventMap>(
    type: K,
    listener: (...eventArg: IEventMap[K]) => void
  ): void {
    this.eventEmitter.on(type, listener);
  }

  private handleIceCandidate = (event: RTCPeerConnectionIceEvent) => {
    this.eventEmitter.emit("icecandidate", event);
  };

  private handleTrack = ({ track }: RTCTrackEvent) => {
    this.eventEmitter.emit("track", track);
  };
}

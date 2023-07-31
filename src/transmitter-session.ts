import type {
  IRTCOfferable,
  IRTCOfferableEventMap,
} from "./types/rtc-offerable";
import type { ITransmittable } from "./types/transmittable";
import { TypedEventEmitter } from "./typed-event-emitter";

export class TransmitterSession implements ITransmittable, IRTCOfferable {
  private peerConnection = new RTCPeerConnection();
  private eventEmitter = new TypedEventEmitter<IRTCOfferableEventMap>();

  constructor() {
    this.peerConnection.addEventListener(
      "icecandidate",
      this.handleIceCandidate
    );
  }

  public attach(stream: MediaStream): void {
    stream.getTracks().forEach((track) => {
      this.peerConnection.addTrack(track, stream);
    });
  }

  public start(): void {
    this.peerConnection.createOffer().then((offer) => {
      this.peerConnection.setLocalDescription(offer);
      this.eventEmitter.emit("offer", offer);
    });
  }

  public answer(value: RTCSessionDescriptionInit): void {
    this.peerConnection.setRemoteDescription(value);
  }

  public addIceCandidate(candidate: RTCIceCandidateInit) {
    this.peerConnection.addIceCandidate(candidate);
  }

  public on<K extends keyof IRTCOfferableEventMap>(
    type: K,
    listener: (...eventArg: IRTCOfferableEventMap[K]) => void
  ): void {
    this.eventEmitter.on(type, listener);
  }

  private handleIceCandidate = (event: RTCPeerConnectionIceEvent) => {
    this.eventEmitter.emit("icecandidate", event);
  };
}

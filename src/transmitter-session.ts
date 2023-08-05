import type {
  IRTCOfferable,
  IRTCOfferableEventMap,
} from "./types/rtc-offerable";
import type { ITransmittable } from "./types/transmittable";
import { TypedEventEmitter } from "./typed-event-emitter";

const offerOptions = {
  offerToReceiveVideo: true,
};

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
    this.peerConnection.createOffer(offerOptions).then((offer) => {
      this.peerConnection.setLocalDescription(offer)
      this.eventEmitter.emit("offer", offer);
    });
  }

  public answer(value: RTCSessionDescriptionInit): void {
    this.peerConnection.setRemoteDescription(value)
  }

  public addIceCandidate(candidate: RTCIceCandidateInit) {
    this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  }

  public on<K extends keyof IRTCOfferableEventMap>(
    type: K,
    listener: (...eventArg: IRTCOfferableEventMap[K]) => void
  ): void {
    this.eventEmitter.on(type, listener);
  }

  public dispose() {
    this.peerConnection.close();
    this.peerConnection.removeEventListener(
      "icecandidate",
      this.handleIceCandidate
    );
    this.eventEmitter.removeAllListeners();
  }

  private handleIceCandidate = (event: RTCPeerConnectionIceEvent) => {
    const { candidate } = event;
    candidate && this.eventEmitter.emit("icecandidate", candidate);
  };
}

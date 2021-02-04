import { Container, Sprite, Texture } from 'pixi.js';

export default class Tsuro extends Container {
  constructor() {
    super();

    // eslint-disable-next-line max-len
    this.videoURL = 'https://assets.moovly.com/converted/video/video-web_c37ff62b-9b0f-4297-bde3-ca64e7aa5c10-cfc590c0-a435-11e7-9e5d-065f749c91a0-480p.webm';
    this.texture = Texture.from(this.videoURL);

    this.videoSprite = new Sprite(this.texture);
    this.video = this.videoSprite.texture.baseTexture.resource.source;

    this.video.loop = true;
    this.video.muted = true;
    this.video.play();

    this.video.addEventListener('loadeddata', this.init.bind(this));
  }

  init() {
    this.videoSprite.anchor.set(0, 1);
    this.addChild(this.videoSprite);

    this.emit(Tsuro.events.SHOW_START);
    setTimeout(() => { this.emit(Tsuro.events.SHOW_END); }, 2000);
  }

  static get events() {
    return {
      SHOW_END: 'show_end',
      SHOW_START: 'show_start',
    };
  }
}
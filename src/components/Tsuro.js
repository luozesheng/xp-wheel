import { Container, Sprite, Texture } from 'pixi.js';

export default class Tsuro extends Container {
  constructor() {
    super();

    // eslint-disable-next-line max-len
    this.texture = Texture.from('https://assets.moovly.com/converted/video/video-web_c37ff62b-9b0f-4297-bde3-ca64e7aa5c10-cfc590c0-a435-11e7-9e5d-065f749c91a0-480p.webm');

    this.videoSprite = new Sprite(this.texture);

    this.addChild(this.videoSprite);

    this.emit(Tsuro.events.SHOW_START);
    setTimeout(() => { this.emit(Tsuro.events.SHOW_END); }, 1500);
  }

  static get events() {
    return {
      SHOW_END: 'show_end',
      SHOW_START: 'show_start',
    };
  }
}
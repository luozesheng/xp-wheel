import { Sprite, Texture } from 'pixi.js';
import gsap from 'gsap';

export default class Flap extends Sprite {
  constructor() {
    super(Texture.from('flap'));

    this.name = 'flap';
  }

  async flap() {
    await gsap.to(this, { keyframes: [
      { rotation: -0.4, duration: 0.1 }, 
      { rotation: 0, ease: 'power1.in', duration: 0.3 }
    ] });
  }
}
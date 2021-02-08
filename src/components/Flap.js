import { Sprite, Texture } from 'pixi.js';
import gsap from 'gsap';

/**
 * Class representing the wheel's flap
 * @extends PIXI.Sprite
 */
export default class Flap extends Sprite {
  constructor() {
    super(Texture.from('flap'));

    this.name = 'flap';
  }

  /**
   * Animates the flap
   * @return {Promise}
   */
  async flap() {
    await gsap.to(this, { keyframes: [
      { rotation: -0.4, duration: 0.1 }, 
      { rotation: 0, ease: 'power1.in', duration: 0.3 }
    ] });
  }
}
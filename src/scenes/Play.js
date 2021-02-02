import Scene from './Scene';
import gsap from 'gsap';
import Wheel from '../components/Wheel';
import { fit } from '../core/utils';

export default class Play extends Scene {
  async onCreated() {
    this.wheel = new Wheel();

    this.fitWheel(window.innerWidth, window.innerHeight);
    this.bounceWheel();
    this.addChild(this.wheel);

    document.addEventListener('keydown', this._handleKeydown.bind(this));
  }

  _handleKeydown(e) {
    if (e.code === 'Space') this.wheel.spinWheel();
  }

  fitWheel(width, height) {
    this.wheel.y = height / 2;

    fit(this.wheel, {
      width,
      height: height - 10,
    }, false, true);
  }

  async bounceWheel() {
    const height = window.innerHeight / 2;
    await gsap.fromTo(this.wheel, { y: -2000 }, { y: height, duration: 2, ease: 'bounce' });
    // this.wheel.idleSpin();
  }

  /**
   * Hook called by the application when the browser window is resized.
   * Use this to re-arrange the game elements according to the window size
   *
   * @param  {Number} width  Window width
   * @param  {Number} height Window height
   */
  onResize(width, height) { // eslint-disable-line no-unused-vars
    this.fitWheel(width, height);
  }
}

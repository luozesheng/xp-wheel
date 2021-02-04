import Scene from './Scene';
import gsap from 'gsap';
import Wheel from '../components/Wheel';
import { fit } from '../core/utils';
import Tsuro from '../components/Tsuro';

export default class Play extends Scene {
  async onCreated() {
    this.wheel = new Wheel();
    this.tsuro = new Tsuro();
    
    this.wheel.once(Wheel.events.SPIN_END, this.hideWheel.bind(this));
    this.tsuro.once(Tsuro.events.SHOW_END, this.showWheel.bind(this));

    this.showTsuro();

    document.addEventListener('keydown', this.handleKeydown.bind(this));
  }

  /**
   * Adds 'tsuro' to the scene with an animation
   */
  showTsuro() {
    gsap.fromTo(this.tsuro, { x: 1000 }, { x: 400, duration: 2 });
    this.addChild(this.tsuro);
  }

  /**
   * Handles the keydown event
   * @param {Event} e keydown event
   */
  handleKeydown(e) {
    if (e.code === 'Space') this.wheel.spinWheel();
  }

  /**
   * Fits the wheel in the window
   * @param {Number} width window width
   * @param {Number} height window height
   */
  fitWheel(width, height) {
    this.wheel.y = height / 2;

    fit(this.wheel, {
      width,
      height: height - 10,
    }, false, true);
  }

  /**
   * Shows the wheel
   */
  showWheel() {
    this.addChild(this.wheel);
    this.bounceWheel();
  }

  /**
   * Hides the wheel and tsuro
   * @return {Promise}
   */
  async hideWheel() {
    this.wheel.emit(Wheel.events.HIDE_START);

    const tweenConfig = { y: window.innerHeight * 2, duration: 1, ease: 'back.in' };

    gsap.to(this.tsuro, tweenConfig);
    await gsap.to(this.wheel, tweenConfig);

    this.wheel.emit(Wheel.events.HIDE_END);

    this.removeChild(this.wheel);
    this.removeChild(this.tsuro);
  }

  /**
   * Scales the wheel and bounces it into view
   * @return {Promise}
   */
  async bounceWheel() {
    this.fitWheel(window.innerWidth, window.innerHeight);
    const height = window.innerHeight / 2;

    await gsap.fromTo(this.wheel, { y: -2000 }, { y: height, duration: 2, ease: 'bounce' });
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

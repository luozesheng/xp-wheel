import Scene from './Scene';
import gsap from 'gsap';
import Wheel from '../components/Wheel';
import { fit } from '../core/utils';
import Tsuro from '../components/Tsuro';
import config from '../config';

export default class Play extends Scene {
  async onCreated(sectorValues) {
    this.tsuro = new Tsuro();
    this.wheel = new Wheel(sectorValues);
    
    this.tsuro.once(config.events.SHOW_START, this.showTsuro.bind(this));
    this.tsuro.once(config.events.SHOW_END, this.showWheel.bind(this));
    this.wheel.once(config.events.SPIN_START, () => { this.emit(config.events.SPIN_START); });
    this.wheel.once(config.events.SPIN_END, this.hideWheel.bind(this));
  }

  /**
   * Adds 'tsuro' to the scene with an animation
   */
  showTsuro() {
    this.emit(config.events.SHOW_START);
    this.tsuro.y = window.innerHeight / 2;

    gsap.fromTo(this.tsuro, 
      { x: window.innerWidth / 2 }, 
      { x: 400, duration: 2 }
    );
    
    this.addChild(this.tsuro);
  }

  /**
   * Handles the keydown event
   * @param {Event} e keydown event
   */
  handleKeydown(e) {
    if (e.code === 'Space') {
      this.wheel.spinWheel();
    }
  }

  /**
   * Fits the wheel inside the window
   * @param {Number} width window width
   * @param {Number} height window height
   */
  fitElements(width, height) {
    this.wheel.y = height / 2;
    this.tsuro.y = height / 2;

    fit(this.wheel, {
      width,
      height: height - 10,
    }, false, true);
  }

  /**
   * Shows the wheel
   */
  async showWheel() {
    this.emit(config.events.SHOW_END);
    this.addChild(this.wheel);
    await this.bounceWheel();
    
    document.addEventListener('keydown', this.handleKeydown.bind(this));
  }

  /**
   * Hides the wheel and tsuro
   * @return {Promise}
   */
  async hideWheel() {
    this.emit(config.events.SPIN_END);
    this.emit(config.events.HIDE_START);

    const tweenConfig = { y: window.innerHeight * 2, duration: 1, ease: 'back.in' };

    gsap.to(this.tsuro, tweenConfig);
    await gsap.to(this.wheel, tweenConfig);

    this.emit(config.events.HIDE_END);

    this.removeChild(this.wheel);
    this.removeChild(this.tsuro);
  }

  /**
   * Scales the wheel and bounces it into view
   * @return {Promise}
   */
  async bounceWheel() {
    this.fitElements(window.innerWidth, window.innerHeight);
    const height = window.innerHeight / 2;

    await gsap.fromTo(this.wheel, { y: -window.innerHeight }, { y: height, duration: 2, ease: 'bounce' });
  }

  /**
   * Hook called by the application when the browser window is resized.
   * Use this to re-arrange the game elements according to the window size
   *
   * @param  {Number} width  Window width
   * @param  {Number} height Window height
   */
  onResize(width, height) { // eslint-disable-line no-unused-vars
    this.fitElements(width, height);
  }
}

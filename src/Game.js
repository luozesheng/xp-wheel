import Splash from './scenes/Splash';
import Play from './scenes/Play';
import { Container } from 'pixi.js';
import config from './config';

/**
 * Main game stage, manages scenes/levels.
 *
 * @extends {PIXI.Container}
 */
export default class Game extends Container {

  static get events() {
    return {
      SWITCH_SCENE: 'switch_scene'
    };
  }

  /**
   * @param {PIXI.Sprite} background 
   */
  constructor(sectorValues) {
    super();

    this.sectorValues = sectorValues;
    this.play = new Play();
    this.currentScene = null;
  }

  async start() {
    await this.switchScene(Splash, { scene: 'splash' });
    await this.currentScene.finish;

    // this.switchScene(Play, { scene: 'play' });
    this.switchScenePlay();
  }

  /**
   * Switches to the play scene
   */
  switchScenePlay() {
    this.removeChild(this.currentScene);

    Object.values(config.events).forEach((event) => {
      this.play.once(event, () => { 
        this.emit(event);
      });
    });

    this.addChild(this.play);
    this.emit(Game.events.SWITCH_SCENE, { scene: 'play' });

    return this.play.onCreated(this.sectorValues);
  }

  /**
   * @param {Function} constructor 
   * @param {String} scene 
   */
  switchScene(constructor, scene) {
    this.removeChild(this.currentScene);
    this.currentScene = new constructor();
    this.currentScene.background = this._background;
    this.addChild(this.currentScene);
    this.emit(Game.events.SWITCH_SCENE, { scene });

    return this.currentScene.onCreated();
  }

  /**
   * Hook called by the application when the browser window is resized.
   * Use this to re-arrange the game elements according to the window size
   *
   * @param  {Number} width  Window width
   * @param  {Number} height Window height
   */
  onResize(width, height) {
    if (this.currentScene === null) return;

    this.currentScene.onResize(width, height);
  }
}

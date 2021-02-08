import { Sprite, Application, utils } from 'pixi.js';
import config from '../config';
import Game from '../Game';
import { Viewport } from 'pixi-viewport';
import { center } from './utils';
import Assets from './AssetManager';

/**
 * Game entry point. Holds the game's viewport and responsive background
 * All configurations are described in src/config.js
 */
export default class GameApplication extends Application {
  // eslint-disable-next-line max-len
  constructor(sectorValues = ['100xp', '200xp', '300xp', '400xp', '500xp', '600xp', '700xp', '800xp', '900xp', '910xp', '920xp', '930xp']) {
    super(config.view);

    this.sectorValues = sectorValues;
    this.emitter = new utils.EventEmitter();
    this.config = config;
    Assets.renderer = this.renderer;

    this.setupViewport();
    this.initGame();

    this.container = this.view;
  }

  /**
   * Spin the wheel to the chosen result
   * @param {String} result The result that you want the wheel to spin to
   */
  spin(result) {
    this.game.play.wheel.spinWheel(result);
  }

  /**
   * Game main entry point. Loads and prerenders assets.
   * Creates the main game container.
   *
   */
  async initGame() {
    // await this.createBackground();
    this.game = new Game(this.sectorValues);
    
    Object.values(config.events).forEach((event) => {
      this.game.once(event, () => { 
        this.emitter.emit(event);
      });
    });

    this.game.once(config.events.SHOW_END, () => {
      document.addEventListener('keydown', this.handleKeydown.bind(this));
    });

    this.viewport.addChild(this.game);

    center(this.viewport, this.config.view);
    this.onResize();

    this.game.start();
  }

  /**
   * Handles the keydown event
   * @param {Event} e keydown event
   */
  handleKeydown(e) {
    if (e.code === 'Space') {
      this.spin(this.sectorValues[Math.floor(Math.random() * this.sectorValues.length)]);
    }
  }

  /**
     * Initialize the game world viewport.
     * Supports handly functions like dragging and panning on the main game stage
     *
     * @return {PIXI.Application}
     */
  setupViewport() {
    const viewport = new Viewport({
      screenWidth: this.config.view.width,
      screenHeight: this.config.view.height,
      worldWidth: this.config.game.width,
      worldHeight: this.config.game.height,
      // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
      interaction: this.renderer.plugins.interaction,
    });

    this.renderer.runners.resize.add({
      resize: this.onResize.bind(this),
    });
    document.body.appendChild(this.view);

    this.stage.addChild(viewport);

    if (this.config.game.drag) viewport.drag();
    if (this.config.game.pinch) viewport.pinch();
    if (this.config.game.wheel) viewport.wheel();
    if (this.config.game.decelerate) viewport.decelerate();

    this.viewport = viewport;
  }

  /**
     * Called after the browser window has been resized.
     * Implement game specific resize logic here
     * @param  {PIXI.Application} app The PIXI Appliaction instance
     * @param  {Number} width         The updated viewport width
     * @param  {Number} height        The updated viewport width
     */
  onResize(width = this.config.view.width, height = this.config.view.height) {
    // this.background.x = width / 2;
    // this.background.y = height / 2;
    this.game.onResize(width, height);

    if (this.config.view.centerOnResize) {
      this.viewport.x = width / 2;
      this.viewport.y = height / 2;
    }
  }

  /**
   * Initializes the static background that is used to
   * fill the empty space around our game stage. This is used to compensate for the different browser window sizes.
   *
   */
  async createBackground() {
    const images = { background: Assets.images.background };

    await Assets.load({ images });
    await Assets.prepareImages(images);

    const sprite = Sprite.from('background');

    this.background = sprite;
    this.background.anchor.set(0.5);
    this.background.name = 'background';

    this.stage.addChildAt(sprite);
  }
}


import gsap from 'gsap/gsap-core';
import { Container, Sprite, filters, Text, Graphics } from 'pixi.js';
import { delay, distanceBetween2PointsSquared } from '../core/utils';

/**
 * Class representing a 'wheel of fortune'
 * @extends PIXI.Container
 */
export default class Wheel extends Container {
  constructor() {
    super();

    this._wheel = new Sprite.from('wheel');
    this._flap = new Sprite.from('flap');

    this._sectors = new Container();
    this._brightnessFilter = this._createBrightnessFilter(0.5);

    this.idleSpinTween = null;

    this._prompt = new Container();

    this.spinning = false;

    this._addParts();
  }

  /**
   * Get wheel events
   * @return {Object} { SPIN_START, SPIN_END, HIDE_START, HIDE_END }
   */
  static get events() {
    return {
      SPIN_START: 'spin_start',
      SPIN_END: 'spin_end',
      HIDE_START: 'hide_start',
      HIDE_END: 'hide_end',
    };
  }

  /**
   * Adds the text prompt
   * @private
   */
  _addPrompt() {
    const promptText = 'НАТИСНИ "SPACE"';

    const text = new Text(promptText, {
      fill: 0xFFD81F,
      fontSize: 40,
      fontWeight: 'bold'
    });
    text.anchor.set(0.5);

    const borderGraphics = new Graphics();
    borderGraphics.lineStyle(5, 0xFFD81F);
    borderGraphics.drawRect(-225, -30, 450, 60);
    
    this._prompt.addChild(text);
    this._prompt.addChild(borderGraphics);
    this.addChild(this._prompt);
  }

  /**
   * Adds the wheel sectors/slices
   * @private
   */
  _addSectors() {
    const numberOfSectors = 12;

    for (let i = 0; i < numberOfSectors; i++) {
      const sector = new Sprite.from(`sector${i % 2 + 1}`);

      sector.anchor.set(0.5, 1);
      sector.rotation = i * Math.PI / (numberOfSectors / 2);
      
      this._sectors.addChild(sector);
    }

    this._sectors.y = -this._wheel.height / 2 - 75;
    this.addChild(this._sectors);
  }

  /**
   * @private
   * @param {Number} brightness from -1 to 1  
   * @return {PIXI.filters.ColorMatrixFilter}
   */
  _createBrightnessFilter(b) {
    const filter = new filters.ColorMatrixFilter();

    if (b > 0) {
      filter.matrix = [
        1 - b, 0, 0, 0, b,
        0, 1 - b, 0, 0, b,
        0, 0, 1 - b, 0, b,
        0, 0, 0, 1, 0];
    } else {
      filter.matrix = [
        1, 0, 0, 0, b,
        0, 1, 0, 0, b,
        0, 0, 1, 0, b,
        0, 0, 0, 1, 0];
    }

    return filter;
  }

  /**
   * Get the active sector (slice under the triangle)
   * @return {PIXI.Sprite}
   */
  get activeSector() {
    return this._sectors.children[this._getActiveSectorIndex()];
  }

  /**
   * Get the selected sector index
   * @private
   * @return {Number} The selected sector index
   */
  _getActiveSectorIndex() {
    const sectors = this._sectors.children;

    const flapBounds = this._flap.getBounds();
    const flapPoint = {
      x: flapBounds.x + flapBounds.width / 2,
      y: flapBounds.y + flapBounds.height
    };

    const closestSector = {
      distance: Number.POSITIVE_INFINITY,
      index: -1,
    };

    sectors.forEach((sector, index) => {
      const sectorBounds = sector.getBounds();
      const sectorPoint = {
        x: sectorBounds.x + sectorBounds.width / 2,
        y: sectorBounds.y
      };

      const distance = distanceBetween2PointsSquared(flapPoint, sectorPoint);

      if (distance < closestSector.distance) {
        closestSector.distance = distance;
        closestSector.index = index;
      }
    });

    return closestSector.index;
  }

  /**
   * Called every time the wheel's rotation changes
   * @private
   */
  _onRotation() {
    const activeSectorIndex = this._getActiveSectorIndex();

    this._sectors.children.forEach((sector, index) => {
      sector.filters = activeSectorIndex === index ? [this._brightnessFilter] : [];
    });
  }

  /**
   * Spins the wheel
   * @return {Promise}
   */
  async spinWheel() {
    if (this.spinning) return;
    if (this.idleSpinTween) this.idleSpinTween.kill();

    this.emit(Wheel.events.SPIN_START);

    this.spinning = true;
    gsap.to(this._prompt, { alpha: 0, duration: 0.1 });

    this._sectors.rotation = 0;
    await gsap.to(this._sectors, {
      rotation: 40 + (Math.random() * Math.PI * 2),
      duration: 7,
      onUpdate: this._onRotation.bind(this),
      onComplete: this._onSpinComplete.bind(this)
    });
  }

  /**
   * Called when the wheel stops spinning
   * @private
   * @return {Promise}
   */
  async _onSpinComplete() {
    await this._flashActiveSector();
    this.emit(Wheel.events.SPIN_END);
    this.spinning = false;
  }

  /**
   * Flashes the active sector 3 times when the wheel stops spinning
   * @private
   * @return {Promise}
   */
  async _flashActiveSector() {
    for (let i = 0; i < 3; i++) {
      this.activeSector.filters = [];
      await delay(500);
      this.activeSector.filters = [this._brightnessFilter];
      await delay(500);
    }
    await delay(500);
  }

  /**
   * Starts the idle spinning animation
   */
  idleSpin() {
    this._sectors.rotation = 0;
    this.idleSpinTween = gsap.to(this._sectors, { 
      rotation: Math.PI * 2, 
      repeat: -1, 
      duration: 12, 
      ease: 'linear', 
      onUpdate: this._onRotation.bind(this)
    });
  }

  /**
   * Adds all the parts of the wheel
   * @private
   */
  _addParts() {
    this._wheel.anchor.set(0.5, 1);
    this._wheel.y = + 5;

    this._flap.anchor.set(0.5);
    this._flap.y = -this._wheel.height + 60;
    
    this._prompt.y = -this._wheel.height - 70;

    this.addChild(this._wheel);
    this._addSectors();
    this.addChild(this._flap);
    this._addPrompt();

    this.idleSpin();
  }
}
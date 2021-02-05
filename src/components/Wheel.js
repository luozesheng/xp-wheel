import gsap from 'gsap/gsap-core';
import { Container, Sprite, filters } from 'pixi.js';
import { delay, distanceBetween2PointsSquared } from '../core/utils';
import Assets from '../core/AssetManager';
import Prompt from './Prompt';
import Flap from './Flap';
import Sector from './Sector';
import config from '../config';

/**
 * Class representing a 'wheel of fortune'
 * @extends PIXI.Container
 */
export default class Wheel extends Container {
  constructor(sectorValues) {
    super();

    this.sectorValues = sectorValues;
    this._wheel = new Sprite.from('wheel');
    this._wheel.name = 'wheel';

    this._prompt = new Prompt('НАТИСНИ "SPACE"');
    this._flap = new Flap();

    this._sectors = new Container();
    this._brightnessFilter = this._createBrightnessFilter(0.5);

    this.idleSpinTween = null;

    this._particles = new Container();

    this.spinning = false;
    this.previousActiveSector = -1;

    this._addParts();
  }

  /**
   * Adds the wheel sectors/slices
   * @private
   */
  _addSectors() {
    const numberOfSectors = 12;

    for (let i = 0; i < numberOfSectors; i++) {
      const sectorRotation = i * Math.PI / (numberOfSectors / 2);
      const sector = new Sector(i, this.sectorValues[i], sectorRotation);
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
      y: flapBounds.y + flapBounds.height / 2
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
    if (activeSectorIndex === this.previousActiveSector) return;

    this.previousActiveSector = activeSectorIndex;
    this._flap.flap();
    if (this.spinning) Assets.sounds.wheelTick.play();

    this._sectors.children.forEach((sector, index) => {
      sector.filters = activeSectorIndex === index ? [this._brightnessFilter] : [];
    });
  }

  /**
   * Blur the wheel while spinning
   * @private
   * @return {Promise}
   */
  async _blurWheel() {
    const blurFilter = new filters.BlurFilter();

    this._sectors.filters = [blurFilter];

    gsap.to(blurFilter.blurXFilter, { strength: 0, duration: 8 });
    await gsap.to(blurFilter.blurYFilter, { strength: 0, duration: 8 });

    this._sectors.filters = [];
  }

  /**
   * Spins the wheel
   * @return {Promise}
   */
  async spinWheel(result) {
    if (this.spinning) return;
    if (this.idleSpinTween) this.idleSpinTween.kill();

    console.log(result);
    this.emit(config.events.SPIN_START);
    // Assets.sounds.spinning.play();

    this.spinning = true;
    this._blurWheel();
    this._emitParticles();
    gsap.to(this._prompt, { alpha: 0, duration: 0.1 }); // Hide text prompt

    this._sectors.rotation = 0;
    await gsap.to(this._sectors, {
      rotation: 40 + (Math.random() * Math.PI * 2),
      duration: 9,
      onUpdate: this._onRotation.bind(this),
      onComplete: this._onSpinComplete.bind(this),
      ease: 'power2'
    });
  }

  /**
   * Called when the wheel stops spinning
   * @private
   * @return {Promise}
   */
  async _onSpinComplete() {
    this.spinning = false;
    Assets.sounds.spinComplete.play();

    await this._flashActiveSector();
    this.emit(config.events.SPIN_END);
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
   * Emits particles while the wheel is spinning
   * @private
   */
  _emitParticles() {
    const particleInterval = setInterval(async () => {
      if (!this.spinning) clearInterval(particleInterval);

      const particle = new Sprite.from('star');
      particle.name = 'particle';
      particle.anchor.set(0.5);
      
      this._particles.addChild(particle);
      
      gsap.to(particle, { y: window.innerHeight, ease: 'back.in(5)', duration: 2 });
      gsap.to(particle.scale, { x: 0, y: 0, duration: 2 });
      await gsap.to(particle, { 
        x: (window.innerWidth * Math.random() + 500) * (Math.random() > 0.5 ? -1 : 1), 
        rotation: Math.PI * Math.random() * 4,
        duration: 2
      });
      
      this._particles.removeChild(particle);
    }, 50);
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
    this._particles.y = -(this._wheel.height / 2);

    this.addChild(this._particles);
    this.addChild(this._wheel);
    this._addSectors();
    this.addChild(this._flap);
    this.addChild(this._prompt);

    this.idleSpin();
  }
}
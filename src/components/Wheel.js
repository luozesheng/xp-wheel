import gsap from 'gsap/gsap-core';
import { Container, Sprite, filters, Text, Graphics } from 'pixi.js';
import { delay, distanceBetween2PointsSquared } from '../core/utils';

export default class Wheel extends Container {
  constructor() {
    super();

    this._wheel = new Sprite.from('wheel');
    this._flap = new Sprite.from('flap');

    this._sectors = new Container();
    this._brightnessFilter = this.createBrightnessFilter(0.5);

    this.idleSpinTween = null;

    this._prompt = new Container();

    this.spinning = false;

    this._addWheel();
  }

  _addPrompt() {
    const text = new Text('НАТИСНИ "SPACE"', {
      fill: 0xFFD81F,
      fontSize: 40,
      fontWeight: 'bold'
    });
    text.anchor.set(0.5);

    const graphics = new Graphics();
    graphics.lineStyle(5, 0xFFD81F);
    graphics.drawRect(-225, -30, 450, 60);
    
    this._prompt.addChild(text);
    this._prompt.addChild(graphics);
    this.addChild(this._prompt);
  }

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

  createBrightnessFilter(b) {
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

  get activeSector() {
    return this._sectors.children[this._getActiveSectorIndex()];
  }

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

  _onRotation() {
    const activeSectorIndex = this._getActiveSectorIndex();

    this._sectors.children.forEach((sector, index) => {
      sector.filters = activeSectorIndex === index ? [this._brightnessFilter] : [];
    });
  }

  async spinWheel() {
    if (this.spinning) return;
    if (this.idleSpinTween) this.idleSpinTween.kill();

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

  async _onSpinComplete() {
    await this._flashActiveSector();
    await gsap.to(this._prompt, { alpha: 1 });
    this.spinning = false;
    this._sectors.rotation = 0;
    this.idleSpin();
  }

  async _flashActiveSector() {
    for (let i = 0; i < 3; i++) {
      this.activeSector.filters = [];
      await delay(500);
      this.activeSector.filters = [this._brightnessFilter];
      await delay(500);
    }
  }

  _distanceBetween2PointsSquared(p1, p2) {
    return ((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2); 
  }

  idleSpin() {
    this.idleSpinTween = gsap.to(this._sectors, { 
      rotation: Math.PI * 2, 
      repeat: -1, 
      duration: 12, 
      ease: 'linear', 
      onUpdate: this._onRotation.bind(this)
    });
  }

  _addWheel() {
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
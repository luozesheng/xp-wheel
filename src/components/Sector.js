import { Container, Sprite, Text } from 'pixi.js';

/**
 * Class representing a wheel sector
 * @extends PIXI.Container
 */
export default class Sector extends Container {
  /**
   * Create a wheel sector
   * @param {Number} index index of current sector
   * @param {String} text text on the sector
   * @param {Number} rotation sector's rotation
   */
  constructor(index, text, rotation) {
    super();

    this.name = 'sector';
    this.sprite = new Sprite.from(`sector${index % 2 + 1}`);
    this.text = new Text(text, {
      fontSize: 50,
      fontWeight: 'bold',
      fill: (index % 2) ? 0x8342BE : 0xFFD81F,
    });
    
    this.sprite.anchor.set(0.5, 1);
    this.sprite.rotation = rotation;

    this.text.anchor.set(-0.5);
    this.text.pivot.set(-100, 55);
    this.text.rotation = rotation - Math.PI / 2;

    this.addChild(this.sprite);
    this.addChild(this.text);
  }
}
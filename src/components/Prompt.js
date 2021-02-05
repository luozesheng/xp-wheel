import { Container, Graphics, Text } from 'pixi.js';

/**
 * Class representing the text prompt above the wheel
 * @extends PIXI.Container
 */
export default class Prompt extends Container {
  constructor(text) {
    super();

    this.text = new Text(text, {
      fill: 0xFFD81F,
      fontSize: 40,
      fontWeight: 'bold'
    });
    this.text.anchor.set(0.5);

    this.borderGraphics = new Graphics();
    this.borderGraphics.lineStyle(5, 0xFFD81F);
    this.borderGraphics.drawRect(-225, -30, 450, 60);
    
    this.addChild(this.text);
    this.addChild(this.borderGraphics);
  }
}
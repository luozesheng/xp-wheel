/**
 * @desc fits display object, by altering its scale, into passed width and height
 * @param {PIXI.DisplayObject} element
 * @param {Object} size
 * @param {Number} size.width
 * @param {Number} size.height
 * @param {Boolean} [ignoreRatio = true]
 * @param {Boolean} [overscale = false] - if true the scaled elememnt may have scale bigger then 1
 */
export function fit(element, { width, height }, ignoreRatio = false, overscale = false) {
  const wScale = width / element.width;
  const hScale = height / element.height;
  const max = overscale ? Infinity : 1;
  const scale = Math.min(wScale, hScale, max);

  /* eslint-disable no-param-reassign */
  element.scale.x *= (ignoreRatio ? wScale : scale);
  element.scale.y *= (ignoreRatio ? hScale : scale);
  /* eslint-enable no-param-reassign */
}

/**
 * @desc centers a display /vertically, horizontally or both/ object into its parent
 * @param {PIXI.DisplayObject} element
 * @param {Number} width
 * @param {Number} height
 * @param {Boolean} vertically
 * @param {Boolean} horizontally
 */
export function center(element, { width, height },
  { vertically = true, horizontally = true } = {}) {
  /* eslint-disable no-param-reassign */
  element.x = horizontally ? (width / 2) - (element.width / 2) : element.x;
  element.y = vertically ? (height / 2) - (element.height / 2) : element.y;
  /* eslint-enable no-param-reassign */
}

/**
 * @param {Number} min 
 * @param {Number} max 
 */
export function random(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * @param {Object} point1 { x, y } 
 * @param {Object} point2 { x, y }
 */
export function distanceBetween2PointsSquared(p1, p2) {
  return ((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2); 
}

/**
 * @desc setTimeout wrapped in a promise
 * @param {Number} time 
 * @returns {Promise}
 */
export function delay(time) {
  return new Promise((reslove) => {
    setTimeout(() => { reslove(); }, time);
  });
}
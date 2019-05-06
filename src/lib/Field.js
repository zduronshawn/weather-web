import * as cst from '../utils/constant'
import _ from 'lodash'
export default class Field {
  /**
   * 
   * @param {*} columns vector数组
   * @param {*} bounds globe 对象的边界
   * @param {*} mask Mask对象
   */
  constructor(columns, bounds, mask) {
    this.columns = columns
    this.bounds = bounds
    this.overlay = mask.imageData
  }

  getVector(x, y) {
    let column = this.columns[Math.round(x)];
    return column && column[Math.round(y)] || cst.NULL_WIND_VECTOR;
  }
  isDefined(x, y) {
    return this.getVector(x, y)[2] !== null;
  }

  isInsideBoundary(x, y) {
    return this.getVector(x, y) !== cst.NULL_WIND_VECTOR;
  }

  release() {
    this.columns = []
  }

  randomize(o) {
    var x, y;
    var safetyNet = 0;
    do {
      x = Math.round(_.random(this.bounds.x, this.bounds.xMax));
      y = Math.round(_.random(this.bounds.y, this.bounds.yMax));
    } while (!this.isDefined(x, y) && safetyNet++ < 30);
    o.x = x;
    o.y = y;
    return o;
  }
}
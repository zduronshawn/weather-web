import * as d3 from 'd3'
export default class Mask {

  constructor(globe, view) {
    this.globe = globe
    this.width = view.width
    this.height = view.height
    this.imageData = this._initImageData()
  }

  _initImageData() {
    let canvas = this._createCanvas()
    let context = this._createContext(canvas)
    let imageData = context.getImageData(0, 0, this.width, this.height);
    return imageData
  }

  _createCanvas() {
    let canvas = d3.select(document.createElement("canvas"))
      .attr("width", this.width)
      .attr("height", this.height)
      .node()
    return canvas
  }

  _createContext(canvas) {
    let context = this.globe.defineMask(canvas.getContext("2d")) //用于链接 globe 和 mask，返回值与参数相同
    context.fillStyle = "rgba(22, 0, 0, 1)"
    context.fill()
    return context
  }

  isVisible(x, y) {
    let i = (y * this.width + x) * 4;
    return this.imageData.data[i + 3] > 0;
  }

  set(x, y, rgba) {
    let data = this.imageData.data
    let i = (y * this.width + x) * 4;
    data[i] = rgba[0];
    data[i + 1] = rgba[1];
    data[i + 2] = rgba[2];
    data[i + 3] = rgba[3];
    return this;
  }
}

export {
  Mask
}

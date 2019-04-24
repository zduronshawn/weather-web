import { floorMod, isValue, clamp } from './utils'
import _ from 'lodash'
import * as d3Geo from "d3-geo";

console.log("geo", d3Geo)

class Globe {
  constructor(view) {
    this.view = view //需要线赋值view，下面this.center中会用到this.view
    this.projection = this.newProjection().translate(this.center(view))
  }

  projection = null

  view = null

  newProjection(view) {
    throw new Error("method must be overridden");
  }

  //根据时区获取当前位置，在有些投影的初始化位置
  _currentPosition() {
    var λ = floorMod(new Date().getTimezoneOffset() / 4, 360);  // 24 hours * 60 min / 4 === 360 degrees
    return [λ, 0];
  }

  _ensureNumber(num, fallback) {
    return _.isFinite(num) || num === Infinity || num === -Infinity ? num : fallback;
  }
  _fit = (view) => {
    var defaultProjection = this.newProjection(this.view);
    var bounds = d3Geo.geoPath().projection(defaultProjection).bounds({ type: "Sphere" });
    var hScale = (bounds[1][0] - bounds[0][0]) / defaultProjection.scale();
    var vScale = (bounds[1][1] - bounds[0][1]) / defaultProjection.scale();
    return Math.min(this.view.width / hScale, this.view.height / vScale) * 0.9;
  }
  bounds = (view) => {
    return clampedBounds(d3.geoPath().projection(this.projection).bounds({ type: "Sphere" }), view);
  }
  _clampedBounds(bounds, view) {
    var upperLeft = bounds[0];
    var lowerRight = bounds[1];
    var x = Math.max(Math.floor(this._ensureNumber(upperLeft[0], 0)), 0);
    var y = Math.max(Math.floor(this._ensureNumber(upperLeft[1], 0)), 0);
    var xMax = Math.min(Math.ceil(this._ensureNumber(lowerRight[0], view.width)), view.width - 1);
    var yMax = Math.min(Math.ceil(this._ensureNumber(lowerRight[1], view.height)), view.height - 1);
    return { x: x, y: y, xMax: xMax, yMax: yMax, width: xMax - x + 1, height: yMax - y + 1 };
  }
  scaleExtent = () => {
    return [25, 3000];
  }

  /**
   * Returns the current orientation of this globe as a string. If the arguments are specified,
   * mutates this globe to match the specified orientation string, usually in the form "lat,lon,scale".
   *
   * @param [o] the orientation string
   * @param [view] the size of the view as {width:, height:}.
   */
  orientation = (o, view) => {
    var projection = this.projection, rotate = projection.rotate();
    if (isValue(o)) {
      var parts = o.split(","), λ = +parts[0], φ = +parts[1], scale = +parts[2];
      var extent = this.scaleExtent();
      projection.rotate(_.isFinite(λ) && _.isFinite(φ) ?
        [-λ, -φ, rotate[2]] :
        this.newProjection(this.view).rotate());
      let scaleNum = _.isFinite(scale) ? clamp(scale, extent[0], extent[1]) : this._fit(this.view)
      projection.scale(scaleNum);
      projection.translate(this.center(view));
      return this;
    }
    return [(-rotate[0]).toFixed(2), (-rotate[1]).toFixed(2), Math.round(projection.scale())].join(",");
  }
  center = (view) => {
    return [this.view.width / 2, this.view.height / 2];
  }
  // 绘制地图
  defineMap = (mapSvg, foregroundSvg) => {
    var path = d3Geo.geoPath().projection(this.projection);
    var defs = mapSvg.append("defs");
    //定义复用的sphere，在下面通过use复用
    defs.append("path")
      .attr("id", "sphere")
      .datum({ type: "Sphere" })
      .attr("d", path);
    //复用sphere
    mapSvg.append("use")
      .attr("xlink:href", "#sphere")
      .attr("class", "background-sphere");
    // 等份划分的经纬度线
    mapSvg.append("path")
      .attr("class", "graticule")
      .datum(d3Geo.geoGraticule())
      .attr("d", path);
    //赤道
    mapSvg.append("path")
      .attr("class", "hemisphere")
      .datum(d3Geo.geoGraticule().minorStep([0, 90]).majorStep([0, 90]))
      .attr("d", path);
    mapSvg.append("path")
      .attr("class", "coastline");
    mapSvg.append("path")
      .attr("class", "lakes");
    foregroundSvg.append("use")
      .attr("xlink:href", "#sphere")
      .attr("class", "foreground-sphere");
  }

  manipulator = (startMouse, startScale) => {
    var projection = this.projection;
    var sensitivity = 60 / startScale;  // seems to provide a good drag scaling factor
    var rotation = [projection.rotate()[0], -projection.rotate()[1]];
    var original = projection.precision();
    projection.precision(original * 10);
    return {
      move: function (mouse, scale) {
        if (mouse) {
          var xd = (mouse[0] - startMouse[0]) * sensitivity + rotation[0];
          var yd = (mouse[1] - startMouse[1]) * sensitivity + rotation[1];
          projection.rotate([xd, -yd, projection.rotate()[2]]);
        }
        if (scale) {
          projection.scale(scale);
        }
      },
      end: function () {
        projection.precision(original);
      }
    };
  }

  /**
   * @returns {Array} the range at which this globe can be zoomed.
   */
  scaleExtent = () => {
    return [25, 3000];
  }

  locate = (coord) => {
    return null;
  }

  defineMask = (context) => {
    d3Geo.geoPath().projection(this.projection).context(context)({ type: "Sphere" });
    return context;
  }
}

// class Atlantis extends Globe {
//   newProjection() {
//     return d3Geo.mollweide().rotate([30, -45, 90]).precision(0.1);
//   }
// }

class Orthographic extends Globe {
  // constructor(props) {
  //   super(props)
  // }
  newProjection() {
    return d3Geo.geoOrthographic().rotate(this._currentPosition()).precision(0.1).clipAngle(90);
  }
  defineMap = (mapSvg, foregroundSvg) => {
    var path = d3Geo.geoPath().projection(this.projection);
    var defs = mapSvg.append("defs");
    var gradientFill = defs.append("radialGradient")
      .attr("id", "orthographic-fill")
      .attr("gradientUnits", "objectBoundingBox")
      .attr("cx", "50%").attr("cy", "49%").attr("r", "50%");
    gradientFill.append("stop").attr("stop-color", "#303030").attr("offset", "69%");
    gradientFill.append("stop").attr("stop-color", "#202020").attr("offset", "91%");
    gradientFill.append("stop").attr("stop-color", "#000005").attr("offset", "96%");
    defs.append("path")
      .attr("id", "sphere")
      .datum({ type: "Sphere" })
      .attr("d", path);
    mapSvg.append("use")
      .attr("xlink:href", "#sphere")
      .attr("fill", "url(#orthographic-fill)");
    mapSvg.append("path")
      .attr("class", "graticule")
      .datum(d3Geo.geoGraticule())
      .attr("d", path);
    mapSvg.append("path")
      .attr("class", "hemisphere")
      .datum(d3Geo.geoGraticule().stepMinor([0, 90]).stepMajor([0, 90]))
      .attr("d", path);
    mapSvg.append("path")
      .attr("class", "coastline");
    mapSvg.append("path")
      .attr("class", "lakes");
    foregroundSvg.append("use")
      .attr("xlink:href", "#sphere")
      .attr("class", "foreground-sphere");
  }
  locate = (coord) => {
    return [-coord[0], -coord[1], this.projection.rotate()[2]];
  }
}

export {
  // Atlantis,
  Orthographic
}
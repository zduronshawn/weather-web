import React, { Component } from 'react'
import _ from 'lodash'
import { connect } from 'dva'
import { fileToGrid } from './Factory'
import * as d3 from 'd3'
import { isValue, distortion, windIntensityColorScale, clearCanvas, spread } from '../lib/utils'
import * as cst from '../utils/constant'
import Field from '../lib/Field'
import Mask from '../lib/Mask'
import { message } from 'antd'

function distort(projection, λ, φ, x, y, scale, wind) {
  var u = wind[0] * scale;
  var v = wind[1] * scale;
  var d = distortion(projection, λ, φ, x, y);

  // Scale distortion vectors by u and v, then add.
  wind[0] = d[0] * u + d[2] * v;
  wind[1] = d[1] * u + d[3] * v;
  return wind;
}

class FieldCmp extends Component {

  renderField = (globe, props) => {
    const { configuration } = props
    this.props.dispatch({
      type: "download/getWeather",
      payload: {
        type: configuration.params,
        date: configuration.date
      }
    }).then(([vector, overlay]) => {
      if (vector && vector.code === -1) {
        message.error(`${configuration.date}的${configuration.params}文件不存在`)
        return
      }
      if (overlay && overlay.code === -1) {
        message.error(`${configuration.date}的${configuration.overlayType}文件不存在`)
        return
      }
      let primaryGrid = fileToGrid(vector, configuration.params)
      let overlayGrid = overlay ? fileToGrid(overlay, configuration.overlayType) : primaryGrid
      this.grid = {
        primaryGrid,
        overlayGrid
      }
      return this.interpolateField(globe, this.grid)
    }).then((field) => {
      this.field = field
      this.animate(globe, field, this.grid)
      this.drawOverlay(field)
    })
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.mapRenderState === 1 && this.props.mapRenderState === 0) {
      this.renderField(nextProps.globe, nextProps)
    }
    if (nextProps.globe.projectionName !== this.props.globe.projectionName) {
      this.handleRedraw(nextProps)
    }
    if (nextProps.configuration.overlayType !== this.props.configuration.overlayType) {
      this.handleRedraw(nextProps)
    }
    if (nextProps.configuration.date !== this.props.configuration.date) {
      this.handleRedraw(nextProps)
    }
    if (nextProps.configuration.activeLocation !== this.props.configuration.activeLocation) {
      // this.handleRedraw(nextProps)
    }
  }
  handleRedraw = (props) => {
    if (this.field) {
      this.field.release()
    }
    this.renderField(props.globe, props)
  }

  interpolateField(globe, grids) {
    if (!globe || !grids) return null;
    let that = this
    var mask = new Mask(globe, this.props.view);
    var primaryGrid = grids.primaryGrid;
    var overlayGrid = grids.overlayGrid;

    return new Promise(function (resolve, reject) {
      var projection = globe.projection;
      var bounds = globe.bounds(that.props.view);
      // How fast particles move on the screen (arbitrary value chosen for aesthetics).
      var velocityScale = bounds.height * primaryGrid.particles.velocityScale;

      var columns = [];
      var point = [];
      var x = bounds.x;
      var interpolate = primaryGrid.interpolate;
      var overlayInterpolate = overlayGrid.interpolate;
      var hasDistinctOverlay = primaryGrid !== overlayGrid;
      var scale = overlayGrid.scale;

      function interpolateColumn(x) {
        var column = [];
        for (var y = bounds.y; y <= bounds.yMax; y += 2) {
          if (mask.isVisible(x, y)) {
            point[0] = x; point[1] = y;
            var coord = projection.invert(point);  // if the point has no representing position ,it will return null
            var color = cst.TRANSPARENT_BLACK;
            var wind = null;
            if (coord) {
              var λ = coord[0], φ = coord[1];
              if (isFinite(λ)) {
                wind = interpolate(λ, φ);
                var scalar = null;
                if (wind) {
                  wind = distort(projection, λ, φ, x, y, velocityScale, wind);
                  scalar = wind[2];
                }
                if (hasDistinctOverlay) {
                  scalar = overlayInterpolate(λ, φ);
                }
                if (isValue(scalar)) {
                  color = scale.gradient(scalar, cst.OVERLAY_ALPHA);
                }
              }
            }
            column[y + 1] = column[y] = wind || cst.HOLE_VECTOR;
            mask.set(x, y, color).set(x + 1, y, color).set(x, y + 1, color).set(x + 1, y + 1, color);
          }
        }
        columns[x + 1] = columns[x] = column;
      }
      (function batchInterpolate() {
        try {
          if (that.props.mapRenderState === 1) {
            var start = Date.now();
            while (x < bounds.xMax) {
              interpolateColumn(x);
              x += 2;
              if ((Date.now() - start) > cst.MAX_TASK_TIME) {
                // Interpolation is taking too long. Schedule the next batch for later and yield.
                setTimeout(batchInterpolate, cst.MIN_SLEEP_TIME);
                return;
              }
            }
          }
          resolve(new Field(columns, bounds, mask));
        }
        catch (e) {
          reject(e);
        }
      })();
    })


  }

  animate(globe, field, grids) {
    if (!globe || !field || !grids) return;
    var bounds = globe.bounds(this.props.view);
    // maxIntensity is the velocity at which particle color intensity is maximum
    var colorStyles = windIntensityColorScale(cst.INTENSITY_SCALE_STEP, grids.primaryGrid.particles.maxIntensity);
    var buckets = colorStyles.map(function () { return []; });
    var particleCount = Math.round(bounds.width * cst.PARTICLE_MULTIPLIER);
    if (this.props.globe.projectionName === "Stereographic") {
      particleCount = particleCount * cst.PARTICLE_REDUCTION
    }
    var fadeFillStyle = "rgba(0, 0, 0, 0.97)";
    console.log("particle count: " + particleCount);
    var particles = [];
    for (var i = 0; i < particleCount; i++) {
      particles.push(field.randomize({ age: _.random(0, cst.MAX_PARTICLE_AGE) }));
    }
    // console.log(particles)

    function evolve() {
      buckets.forEach(function (bucket) { bucket.length = 0; });
      particles.forEach(function (particle) {
        if (particle.age > cst.MAX_PARTICLE_AGE) {
          field.randomize(particle).age = 0;
        }
        var x = particle.x;
        var y = particle.y;
        var v = field.getVector(x, y);  // vector at current position
        var m = v[2];
        if (m === null) {
          particle.age = cst.MAX_PARTICLE_AGE;  // particle has escaped the grid, never to return...
        }
        else {
          var xt = x + v[0];
          var yt = y + v[1];
          if (field.isDefined(xt, yt)) {
            // Path from (x,y) to (xt,yt) is visible, so add this particle to the appropriate draw bucket.
            particle.xt = xt;
            particle.yt = yt;
            buckets[colorStyles.indexFor(m)].push(particle);
          }
          else {
            // Particle isn't visible, but it still moves through the field.
            particle.x = xt;
            particle.y = yt;
          }
        }
        particle.age += 1;
      });
    }


    var g = d3.select("#animation").node().getContext("2d");
    g.lineWidth = cst.PARTICLE_LINE_WIDTH;
    g.fillStyle = fadeFillStyle;

    function draw() {
      // Fade existing particle trails.
      var prev = g.globalCompositeOperation;
      g.globalCompositeOperation = "destination-in";
      g.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
      g.globalCompositeOperation = prev;

      // Draw new particle trails.
      buckets.forEach(function (bucket, i) {
        if (bucket.length > 0) {
          g.beginPath();
          g.strokeStyle = colorStyles[i];
          bucket.forEach(function (particle) {
            if (Math.abs(particle.x - particle.xt) > 10) return // long line bug
            g.moveTo(particle.x, particle.y);
            g.lineTo(particle.xt, particle.yt);
            particle.x = particle.xt;
            particle.y = particle.yt;
          });
          g.stroke();
        }
      });
    }

    let that = this;
    (function frame() {
      try {
        if (that.props.mapRenderState === 0 || that.field.columns.length === 0) {
          field.release()
          return
        }
        evolve();
        draw();
        setTimeout(frame, cst.FRAME_RATE);
      }
      catch (e) {
        console.log(e)
      }
    })();
  }

  drawOverlay(field, overlayType) {
    if (!field) return;

    var ctx = d3.select("#overlay").node().getContext("2d");

    clearCanvas(d3.select("#overlay").node());
    ctx.putImageData(field.overlay, 0, 0);
  }

  componentWillUnmount = () => {
    if (this.field) {
      this.field.release()
    }
    clearCanvas(d3.select("#animation").node())
    clearCanvas(d3.select("#overlay").node());
  }

  render() {
    return null
  }
}

export default connect(({ configuration, app }) => ({
  globe: app.globe,
  configuration,
  view: {
    height: app.height,
    width: app.width
  }
}))(FieldCmp)

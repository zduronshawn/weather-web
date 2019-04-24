import React, { Component } from 'react'
import { connect } from 'dva';
import * as d3 from 'd3'
import * as Globes from '../lib/Globe'
import * as D3Drag from "d3-drag";
import * as D3Zoom from "d3-zoom";
import * as d3Geo from "d3-geo";
import _ from 'lodash'
import { removeChildren, distance } from '../lib/utils'
import styles from './globe.css'

const MIN_MOVE = 4
const REDRAW_WAIT = 10
let globe = null
let coastline = null
let lakes = null;
export class Globe extends Component {

  componentDidMount = () => {
    globe = new Globes.Orthographic(this.view)
    this.buildGlobe(globe, this.props.mesh)
    d3.select("#display").call(this._drag());
    d3.select("#display").call(this._zoom());
  }
  removeOrignal = () => {
    removeChildren(d3.select("#map").node());
    removeChildren(d3.select("#foreground").node());
  }
  buildGlobe = (globe, mesh) => {
    this.removeOrignal()
    globe.defineMap(d3.select("#map"), d3.select("#foreground"));
    globe.orientation("0,0,300", this.view)
    coastline = d3.select(".coastline");
    lakes = d3.select(".lakes");
    coastline.datum(mesh.coastHi);
    lakes.datum(mesh.lakesHi);
    var path = d3.geoPath().projection(globe.projection).pointRadius(7);
    d3.selectAll("path").attr("d", path);
  }
  handleDragStart = () => {
    const { mesh } = this.props
    let path = d3Geo.geoPath().projection(globe.projection).pointRadius(7)
    coastline.datum(mesh.coastLo);
    lakes.datum(mesh.lakesLo);
    d3.selectAll("path").attr("d", path);

  }
  handleDraging = () => {
    let path = d3Geo.geoPath().projection(globe.projection).pointRadius(7)
    d3.selectAll("path").attr("d", path);
  }
  handleDragEnd = () => {
    const { mesh } = this.props
    let path = d3Geo.geoPath().projection(globe.projection).pointRadius(7)
    coastline.datum(mesh.coastHi);
    lakes.datum(mesh.lakesHi);
    d3.selectAll("path").attr("d", path);
  }
  newOp(startMouse, startScale) {
    return {
      type: "click",  // initially assumed to be a click operation
      startMouse: startMouse,
      startScale: startScale,
      manipulator: globe.manipulator(startMouse, startScale)
    };
  }
  _drag = () => {
    const that = this
    let op = null
    return D3Drag.drag()
      .on("start", function () {
        console.log("drag start")
        op = op || that.newOp(d3.mouse(this), 400)
      })
      .on("drag", function () {
        let currentMouse = d3.mouse(this)
        op = op || that.newOp(currentMouse, 400)
        let distanceMoved = distance(currentMouse, op.startMouse);
        if (distanceMoved > MIN_MOVE) {
          op.type = "drag";
          op.manipulator.move(currentMouse);
          let doDraw_throttled = _.throttle(that.handleDragStart, REDRAW_WAIT, { leading: false });
          doDraw_throttled()
        }
      }).on("end", function () {
        op.manipulator.end();
        that.handleDragEnd()
        // globe.orientation()
        console.log("end")
        op = null
      })
  }

  _zoom = () => {
    const that = this
    let op = null
    let zoom = D3Zoom.zoom()
      .scaleExtent(globe.scaleExtent())
      .scale()
      .on("start", function () {
        console.log("zoom start")
        op = op || that.newOp(null, d3.event.transform.k == 1 ? 400 : d3.event.transform.k)
      })
      .on("zoom", function () {
        console.log(d3.event.transform.k)
        op.manipulator.move(null, d3.event.transform.k)
        let doDraw_throttled = _.throttle(that.handleDragStart, REDRAW_WAIT, { leading: false });
        doDraw_throttled()
      })
      .on("end", function () {
        op.manipulator.end();
        _.debounce(() => {
          console.log("toHigh")
          that.handleDragEnd()
        }, 1000)()
        op = null
      })
    return zoom
  }

  get view() {
    return {
      width: this.props.width,
      height: this.props.height,
    }
  }
  render() {
    return (
      <div id="display" className={styles.display}>
        <svg id="map" className={styles.layer} xmlns="http://www.w3.org/2000/svg" version="1.1" {...this.view}></svg>
        <canvas id="animation" className={styles.layer} {...this.view}></canvas>
        <canvas id="overlay" className={styles.layer} {...this.view}></canvas>
        <svg id="foreground" className={styles.layer} xmlns="http://www.w3.org/2000/svg" version="1.1" {...this.view}></svg>
      </div>
    )
  }
}

export default connect(({ app }) => ({
  width: app.width,
  height: app.height
}))(Globe)

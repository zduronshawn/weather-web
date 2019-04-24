import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva';
import * as d3 from 'd3'
import * as D3Drag from "d3-drag";
import * as D3Zoom from "d3-zoom";
import _ from 'lodash'
import { removeChildren, distance } from '../lib/utils'
import styles from './globe.css'

const MIN_MOVE = 4
const REDRAW_WAIT = 10
let coastline = null
let lakes = null;
export class Globe extends Component {
  static contextTypes = {
    globe: PropTypes.object
  }

  componentDidMount = () => {
    const { globe } = this.context
    this.buildGlobe(globe, this.props.mesh)
    let target = d3.select("#display")
    target.call(this._drag());
    target.call(this._zoom());
  }
  removeOrignal = () => {
    removeChildren(d3.select("#map").node());
    // removeChildren(d3.select("#foreground").node());
  }
  get path() {
    const { globe } = this.context
    return d3.geoPath().projection(globe.projection).pointRadius(7)
  }
  buildGlobe = (globe, mesh) => {
    const { configuration } = this.props
    this.removeOrignal()
    globe.defineMap(d3.select("#map"), d3.select("#foreground"));
    globe.orientation(configuration.orientation, this.view)
    coastline = d3.select(".coastline");
    lakes = d3.select(".lakes");
    coastline.datum(mesh.coastHi);
    lakes.datum(mesh.lakesHi);
    d3.selectAll("path").attr("d", this.path);
  }
  handleDragStart = () => {
    const { mesh } = this.props
    coastline.datum(mesh.coastLo);
    lakes.datum(mesh.lakesLo);
    d3.selectAll("path").attr("d", this.path);

  }
  handleDraging = () => {
    d3.selectAll("path").attr("d", this.path);
  }
  handleDragEnd = () => {
    const { mesh } = this.props
    coastline.datum(mesh.coastHi);
    lakes.datum(mesh.lakesHi);
    d3.selectAll("path").attr("d", this.path);
  }
  newOp(startMouse, startScale) {
    const { globe } = this.context
    return {
      startMouse: startMouse,
      startScale: startScale,
      manipulator: globe.manipulator(startMouse, startScale)
    };
  }
  _drag = () => {
    const { globe } = this.context
    const that = this
    let op = null
    return D3Drag.drag()
      .on("start", function () {
        op = op || that.newOp(d3.mouse(this), globe.projection.scale())
      })
      .on("drag", function () {
        let currentMouse = d3.mouse(this)
        op = op || that.newOp(currentMouse, globe.projection.scale())
        let distanceMoved = distance(currentMouse, op.startMouse);
        if (distanceMoved > MIN_MOVE) {
          op.manipulator.move(currentMouse);
          let doDraw_throttled = _.throttle(that.handleDragStart, REDRAW_WAIT, { leading: false });
          doDraw_throttled()
        }
      }).on("end", function () {
        op.manipulator.end();
        _.debounce(() => {
          if (!op) {
            that.handleDragEnd()
          }
        }, 1000)()
        op = null
      })
  }

  _zoom = () => {
    const { globe } = this.context
    const that = this
    let op = null
    let zoom = D3Zoom.zoom()
      .scaleExtent(globe.scaleExtent())
      .on("start", function () {
        op = op || that.newOp(null, d3.event.transform.k)
      })
      .on("zoom", function () {
        op.manipulator.move(null, d3.event.transform.k)
        let doDraw_throttled = _.throttle(that.handleDragStart, REDRAW_WAIT, { leading: false });
        doDraw_throttled()
      })
      .on("end", function () {
        op.manipulator.end();
        _.debounce(() => {
          if (!op) {
            that.handleDragEnd()
          }
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
      <svg id="map" className={styles.layer} xmlns="http://www.w3.org/2000/svg" version="1.1" {...this.view}>
      </svg>
    )
  }
}

export default connect(({ app, configuration }) => ({
  width: app.width,
  height: app.height,
  configuration
}))(Globe)

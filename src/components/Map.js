import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva';
import * as d3 from 'd3'
import * as D3Drag from "d3-drag";
import * as D3Zoom from "d3-zoom";
import _ from 'lodash'
import { removeChildren, distance } from '../lib/utils'
import * as cst from '../utils/constant'
import styles from './globe.css'

let coastline = null
let lakes = null;

export class Map extends Component {

  componentDidMount = () => {
    const { globe } = this.props
    this.buildGlobe(globe, this.props.mesh, this.view)
    let target = d3.select("#display")
    target.call(this._drag());
    target.call(this._zoom());
  }

  componentWillReceiveProps = (newProps) => {
    if (newProps.height !== this.props.height || newProps.width !== this.props.width) {
      _.debounce(() => {
        this.buildGlobe(newProps.globe, newProps.mesh, {
          width: newProps.width,
          height: newProps.height
        })
      }, 500)()
    }
    if (newProps.globe.projectionName !== this.props.globe.projectionName) {
      this.buildGlobe(newProps.globe, newProps.mesh, {
        width: newProps.width,
        height: newProps.height
      })
    }
  }

  get path() {
    const { globe } = this.props
    return d3.geoPath().projection(globe.projection).pointRadius(7)
  }
  get target() {
    return d3.select("#display")
  }
  buildGlobe = (globe, mesh, view) => {
    const { configuration, onStart, onEnd } = this.props
    onStart()
    removeChildren(d3.select("#map").node());
    globe.defineMap(d3.select("#map"), d3.select("#foreground"));
    globe.orientation(configuration.orientation, view)
    coastline = d3.select(".coastline");
    lakes = d3.select(".lakes");
    coastline.datum(mesh.coastHi);
    lakes.datum(mesh.lakesHi);
    d3.selectAll("path").attr("d", d3.geoPath().projection(globe.projection).pointRadius(7)); //fix update proejction bug
    onEnd()
  }
  // turn to use low resolution
  handleMoving = () => {
    const { mesh } = this.props
    coastline.datum(mesh.coastLo);
    lakes.datum(mesh.lakesLo);
    d3.selectAll("path").attr("d", this.path);
  }
  // back to use low resolution
  handleMoveEnd = () => {
    const { mesh, onEnd } = this.props
    coastline.datum(mesh.coastHi);
    lakes.datum(mesh.lakesHi);
    d3.selectAll("path").attr("d", this.path);
    onEnd()
  }
  newOp(startMouse, startScale) {
    const { globe } = this.props
    return {
      startMouse: startMouse,
      startScale: startScale,
      manipulator: globe.manipulator(startMouse, startScale)
    };
  }
  _drag = () => {
    const { globe } = this.props
    const { onStart, onEnd } = this.props
    let op = null
    return D3Drag.drag()
      .on("start", () => {
        onStart()
        op = op || this.newOp(d3.mouse(this.target.node()), globe.projection.scale())
      })
      .on("drag", () => {
        let currentMouse = d3.mouse(this.target.node())
        op = op || this.newOp(currentMouse, globe.projection.scale())
        let distanceMoved = distance(currentMouse, op.startMouse);
        if (distanceMoved > cst.MIN_MOVE) {
          op.manipulator.move(currentMouse);
          let doDraw_throttled = _.throttle(this.handleMoving, cst.REDRAW_WAIT, { leading: false });
          doDraw_throttled()
        }
      }).on("end", () => {
        op.manipulator.end();
        _.debounce(() => {
          if (!op) {
            // save the orientation after draging
            this.props.dispatch({
              type: "configuration/save",
              payload: {
                orientation: globe.orientation()
              }
            })
            this.handleMoveEnd()
          }
        }, cst.MOVE_END_WAIT)()
        op = null
      })
  }

  _zoom = () => {
    const { globe } = this.props
    const { onStart, onEnd } = this.props
    let op = null
    let zoom = D3Zoom.zoom()
      .scaleExtent(globe.scaleExtent())
      .on("start", () => {
        onStart()
        op = op || this.newOp(null, d3.event.transform.k)
      })
      .on("zoom", () => {
        op.manipulator.move(null, d3.event.transform.k)
        let doDraw_throttled = _.throttle(this.handleMoving, cst.REDRAW_WAIT, { leading: false });
        doDraw_throttled()
      })
      .on("end", () => {
        op.manipulator.end();
        _.debounce(() => {
          if (!op) {
            this.handleMoveEnd()
          }
        }, cst.MOVE_END_WAIT)()
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
  globe: app.globe,
  width: app.width,
  height: app.height,
  configuration
}))(Map)

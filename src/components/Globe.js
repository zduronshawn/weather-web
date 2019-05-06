import React, { Component } from 'react'
import { connect } from 'dva';
import styles from './globe.css'
import Map from './Map'
import Field from './Field'
import { clearCanvas } from '../lib/utils'
import * as d3 from 'd3'

export class Globe extends Component {

  state = {
    mapRenderState: 0
  }

  get view() {
    return {
      width: this.props.width,
      height: this.props.height,
    }
  }

  handleStartMap = () => {
    this.setState({
      mapRenderState: 0
    })
    clearCanvas(d3.select("#animation").node())
    clearCanvas(d3.select("#overlay").node());
  }
  handleEndMap = () => {
    this.setState({
      mapRenderState: 1
    })
  }
  render() {
    const { mesh } = this.props
    const { mapRenderState } = this.state
    return (
      <div id="display" className={styles.display}>
        {
          mesh &&
          <Map
            {...this.view}
            mesh={mesh}
            onStart={this.handleStartMap}
            onEnd={this.handleEndMap}></Map>}
        <Field mapRenderState={mapRenderState}></Field>
        <canvas id="animation" className={styles.layer} {...this.view}></canvas>
        <canvas id="overlay" className={styles.layer} {...this.view}></canvas>
        <svg id="foreground" className={styles.layer} xmlns="http://www.w3.org/2000/svg" version="1.1" {...this.view}></svg>
      </div>
    )
  }
}

export default connect(({ app, download, configuration }) => ({
  globe: app.globe,
  width: app.width,
  height: app.height,
  mesh: download.mesh,
  projection: configuration.projection
}))(Globe)

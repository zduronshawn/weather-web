import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva';
import styles from './globe.css'
import Map from './Map'
import * as GlobeLib from '../lib/Globe'

export class Globe extends Component {
  static childContextTypes = {
    globe: PropTypes.object
  }
  getChildContext() {
    return {
      globe: new GlobeLib[this.props.projection](this.view)
    }
  }
  get view() {
    return {
      width: this.props.width,
      height: this.props.height,
    }
  }
  render() {
    const { mesh } = this.props
    return (
      <div id="display" className={styles.display}>
        {mesh && <Map mesh={mesh} {...this.view}></Map>}
        <canvas id="animation" className={styles.layer} {...this.view}></canvas>
        <canvas id="overlay" className={styles.layer} {...this.view}></canvas>
        <svg id="foreground" className={styles.layer} xmlns="http://www.w3.org/2000/svg" version="1.1" {...this.view}></svg>
      </div>
    )
  }
}

export default connect(({ app, download, configuration }) => ({
  width: app.width,
  height: app.height,
  mesh: download.mesh,
  projection: configuration.projection
}))(Globe)

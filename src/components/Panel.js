import React, { Component } from 'react'
import styles from './globe.css'
import { connect } from 'dva';
import * as Globes from '../lib/Globe'

class Panel extends Component {
  handleChangeConfig = (payload) => {
    this.props.dispatch({
      type: "configuration/save",
      payload
    })
  }
  handleChangeProjection = (projectionName) => {
    this.props.dispatch({
      type: "app/save",
      payload: {
        globe: new Globes[projectionName](this.props.view)
      }
    })
  }
  render() {
    return (
      <div className={styles.layer}>
        <button onClick={() => this.handleChangeProjection("Orthographic")}>O</button>
        <button onClick={() => this.handleChangeProjection("Equirectangular")}>EQ</button>
        <button onClick={() => this.handleChangeConfig({ overlayType: "temp" })}>temp</button>
        <button onClick={() => this.handleChangeConfig({ overlayType: "default" })}>default</button>
      </div>
    )
  }
}

export default connect(({ app }) => ({
  view: app.view
}))(Panel)

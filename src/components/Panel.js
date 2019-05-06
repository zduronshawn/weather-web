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
  render() {
    return (
      <div className={styles.layer}>
        <button>O</button>
        <button onClick={(e) => {
          this.handleChangeConfig(e, {
            projection: "Equirectangular",
          })
          this.props.dispatch({
            type: "app/save",
            payload: new Globes["Equirectangular"](this.props.view)
          })
        }}>EQ</button>
      </div>
    )
  }
}

export default connect(({ app }) => ({
  view: app.view
}))(Panel)

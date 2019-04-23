import React, { Component } from 'react';
import { connect } from 'dva';
import Globle from '../components/Globe'
import styles from './IndexPage.css';

class IndexPage extends Component {
  componentDidMount = () => {
    console.log(this.props)
    this.props.dispatch({
      type: "download/getMesh"
    })
  }
  render() {
    const { mesh } = this.props
    return (
      <div className={styles.normal}>
        {mesh && <Globle mesh={mesh}></Globle>}
      </div>
    )
  }
}

export default connect(({ download }) => ({
  mesh: download.mesh
}))(IndexPage);

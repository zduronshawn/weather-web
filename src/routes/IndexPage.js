import React, { Component } from 'react';
import { connect } from 'dva';
import Globle from '../components/Globe'
import Panel from '../components/Panel'
import styles from './IndexPage.css';
import 'antd/dist/antd.css';

class IndexPage extends Component {
  componentDidMount = () => {
    console.log(this.props)
    this.props.dispatch({
      type: "download/getMesh"
    })
  }
  render() {
    return (
      <div className={styles.normal}>
        <Globle></Globle>
        <Panel></Panel>
      </div>
    )
  }
}

export default connect(null)(IndexPage);

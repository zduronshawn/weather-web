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
    return (
      <div className={styles.normal}>
        <Globle></Globle>
      </div>
    )
  }
}

export default connect(null)(IndexPage);

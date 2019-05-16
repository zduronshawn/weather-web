import React, { Component } from 'react'
import styles from './globe.css'
import { connect } from 'dva';
import * as Globes from '../lib/Globe'
import { Button, Drawer, Form, Tooltip, Radio, DatePicker } from 'antd';
import moment from 'moment'

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
  handleMenu = (visible) => {
    this.props.dispatch({
      type: "app/save",
      payload: {
        showMenu: visible
      }
    })
  }
  render() {
    const { configuration, globe } = this.props
    return (
      <div className={styles.layer}>
        <div style={{ margin: "10px" }}>
          <Button type="primary" size="large" onClick={() => { this.handleMenu(true) }}>MENU</Button>
        </div>
        <Drawer
          title="Menu"
          placement="left"
          closable={true}
          onClose={() => this.handleMenu(false)}
          visible={this.props.showMenu}
          mask={false}>
          <Form>
            <Form.Item label="时间">
              <DatePicker
                allowClear={false}
                defaultValue={moment(configuration.date)}
                onChange={(date, dateString) => this.handleChangeConfig({ date: dateString })}
                format="YYYYMMDD"
                showToday={false}
                disabledDate={(current) => {
                  return current && current > moment().endOf('day');
                }}></DatePicker>
            </Form.Item>
            <Form.Item label="Projection">
              <Radio.Group value={globe.projectionName} onChange={(e) => this.handleChangeProjection(e.target.value)}>
                <Tooltip placement="bottom" title="Orthographic">
                  <Radio.Button value="Orthographic">O</Radio.Button>
                </Tooltip>
                <Tooltip placement="bottom" title="Equirectangular">
                  <Radio.Button value="Equirectangular">EQ</Radio.Button>
                </Tooltip>
                <Tooltip placement="bottom" title="Stereographic">
                  <Radio.Button value="Stereographic">S</Radio.Button>
                </Tooltip>
              </Radio.Group>
            </Form.Item>
            <Form.Item label="Mask">
              <Radio.Group value={configuration.overlayType} onChange={(e) => this.handleChangeConfig({ overlayType: e.target.value })}>
                <Radio.Button value="temp">温度</Radio.Button>
                <Radio.Button value="default">风速</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Form>
        </Drawer>
      </div>
    )
  }
}

export default connect(({ app, configuration }) => ({
  view: app.view,
  globe: app.globe,
  configuration,
  showMenu: app.showMenu
}))(Panel)

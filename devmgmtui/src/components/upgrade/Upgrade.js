import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import {Form , Input, Button} from 'semantic-ui-react'
import * as actions from '../../actions/fileMgmt'
import DisplayUpgradeComponent from './DisplayUpgradeComponent.js'
import SideNav from '../common/Sidebar'

class Upgrade extends Component {
  renderFileMgmt() {
    return (
      <div className="ui container" style={{'padding-top' : '60px'}}>
        <div>
          <h1>Upgrade Device</h1>
        </div>
        <div>
          <DisplayUpgradeComponent />
        </div>
      </div>
    );
  }

  render() {
    return (
      <SideNav>
        <div>
          <div>
            {this.renderFileMgmt()}
          </div>
        </div>
      </SideNav>
    )
  }
}

function mapStateToProps({ fileMgmt }) {
  return { fileMgmt }
}

export default connect(mapStateToProps, actions)(Upgrade);

import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as actions from '../../actions/upgrade'
import UpgradeDisplayComponent from './UpgradeDisplayComponent.js'
import SideNav from '../common/Sidebar'

class Upgrade extends Component {
  renderUpgrade() {
    return (
      <div className="ui container" style={{'padding-top' : '60px'}}>
        <div>
          <h1>Upgrade Device</h1>
        </div>
        <div>
          <UpgradeDisplayComponent />
        </div>
      </div>
    );
  }

  render() {
    return (
      <SideNav>
        <div>
          <div>
            {this.renderUpgrade()}
          </div>
        </div>
      </SideNav>
    )
  }
}

function mapStateToProps({ upgrade }) {
  return { upgrade }
}

export default connect(mapStateToProps, actions)(Upgrade);

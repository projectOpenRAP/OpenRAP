import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as actions from '../../actions/upgrade'
import UpgradeDisplayComponent from './UpgradeDisplayComponent.js'
import SideNav from '../common/Sidebar'

class Upgrade extends Component {

  componentWillMount() {
    document.title = "Upgrade Device";
  }

  renderUpgrade() {
    return (
      <div className="ui container" style={{'padding-top' : '60px'}}>
        <div>
          <h1>Upgrade Firmware</h1>
        </div>
        <div>
          <UpgradeDisplayComponent />
        </div>
      </div>
    );
  }

  render() {
    if (typeof this.props.auth.user !== `undefined` && (this.props.auth.user.permissions.search(/UPGRADE_DEVICE|ALL/) >= 0)) {
      return (
        <SideNav>
          <div>
            <div>
              {this.renderUpgrade()}
            </div>
          </div>
        </SideNav>
    )
  } else {
    return (
      null
    )
  }
  }
}

function mapStateToProps({ upgrade, auth }) {
  return { upgrade, auth }
}

export default connect(mapStateToProps, actions)(Upgrade);

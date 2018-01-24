import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as actions from '../../actions/filemgmt'
import { Card, Image, Icon, Divider } from 'semantic-ui-react'


class FolderUnitComponent extends Component {

  constructor(props) {
    super(props);
  }

  shortenString(string) {
    if (string.length > 30) {
      return (string.slice(0, 8) + '...' + string.slice(-6))
    }
    return string;
  }

  handleFolderClick() {
    this.props.readFolder(this.props.filemgmt.currentDir + this.props.name + '/')
  }

  handleDelete() {
    let consent = window.confirm("This folder will be deleted! [No Undo]");
    if (consent) {
      this.props.deleteFolder(this.props.filemgmt.currentDir, this.props.name, (err, res) => {
        if (err) {
          alert(res);
        } else {
          this.props.readFolder(this.props.filemgmt.currentDir);
        }
      });
    } else {
      return;
    }
  }

  renderFolderUnitComponent() {
    return (
      <div>
        <a href='javascript:void(0);' onClick={this.handleFolderClick.bind(this)} >
          <span>
            <Icon name='folder' color='yellow' size='big'/>
              {this.shortenString(this.props.name)}
          </span>
        </a>
        <a href='javascript:void(0);' onClick={this.handleDelete.bind(this)}>
          <span style={{float:'right'}}>
            <Icon name='trash outline' color='red' size='big' />
          </span>
        </a>
        <Divider></Divider>
      </div>
    )
  }
  render() {
    return(
      <div>
        {this.renderFolderUnitComponent()}
      </div>
    )
  }
}
function mapStateToProps({ filemgmt }) {
  return { filemgmt }
}

export default connect(mapStateToProps, actions)(FolderUnitComponent);

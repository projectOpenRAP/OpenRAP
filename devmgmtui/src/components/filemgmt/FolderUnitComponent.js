import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as actions from '../../actions/filemgmt'
import { Icon, Divider, Checkbox } from 'semantic-ui-react'


let fileDisplayStyles = {
  rightPadded : {
    'paddingRight' : '5px',
  }
}

class FolderUnitComponent extends Component {

  constructor(props) {
    super(props);
    this.state = {
      selected : false
    }
  }
/*
  componentWillMount() {
    let currentlySelectedFiles = this.props.filemgmt.selectedFiles;
    if (currentlySelectedFiles.indexOf(this.props.name) >= 0) {
      this.setState({selected: true});
    }
  }
*/
  componentWillReceiveProps(newProps, newState) {
    this.setState({selected : (newProps.filemgmt.selectedFiles.indexOf(this.props.name) >= 0)})
  }

  toggleSelected() {
    let currentlySelectedFiles = this.props.filemgmt.selectedFiles;
    if (this.state.selected) {
      currentlySelectedFiles.splice(currentlySelectedFiles.indexOf(this.props.name), 1);
    } else {
      currentlySelectedFiles.push(this.props.name);
    }
    this.setState({selected : !this.state.selected});
    this.props.updateSelectedFiles(currentlySelectedFiles);
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
    let consent = window.confirm("Cannot be reverted once it is deleted. Are you sure you want to delete this folder?");
    if (consent) {
      this.props.deleteFolder(this.props.filemgmt.currentDir, this.props.name, this.props.auth.user.username, (err, res) => {
        if (err) {
          alert(res);
        } else {
          alert("Folder deletion success");
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
        { this.props.auth.user.permissions.search(/DELETE_FILES|ALL/) >= 0 ?  <span style={fileDisplayStyles.rightPadded}><Checkbox onClick = {() => this.toggleSelected(this)} checked={this.state.selected}/></span> : null}
        <a href='javascript:void(0);' style={{ color : 'black' }} onClick={this.handleFolderClick.bind(this)} >
          <span>
            <Icon name='folder' color='yellow' size='big'/>
              {this.shortenString(this.props.name)}
          </span>
        </a>
        { this.props.auth.user.permissions.search(/DELETE_FILES|ALL/) >= 0 ? <a href='javascript:void(0);' onClick={this.handleDelete.bind(this)}>
          <span style={{float:'right'}}>
            <Icon name='trash outline' color='red' size='big' />
          </span>
        </a> : null}
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
function mapStateToProps({ filemgmt, auth }) {
  return { filemgmt, auth }
}

export default connect(mapStateToProps, actions)(FolderUnitComponent);

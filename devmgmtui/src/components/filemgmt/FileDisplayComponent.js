import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as actions from '../../actions/filemgmt'
import {List, Icon, Button, Divider, Segment, Input, Dimmer, Loader} from 'semantic-ui-react'
import FolderUnitComponent from './FolderUnitComponent'
import FileUnitComponent from './FileUnitComponent'

const fileDisplayStyles = {
  topBar : {
    'verticalAlign' : 'middle',
  }

}

class FileDisplayComponent extends Component {

  constructor(props) {
    super(props);
    this.pop.bind(this);
    this.state = {
      newFolderName : '',
      usbDownloadableConnected : false,
      usbUploadableConnected : false,
      allSelected : false,
      folderLoaded : false,
    }
  }



  pop(slashedPath) {
    slashedPath = slashedPath.slice(0, -1);
    let lastSlash = slashedPath.lastIndexOf('/');
    return slashedPath.slice(0, lastSlash+1);
  }

  goBack() {
    if (this.props.filemgmt.currentDir !== '/') {
      this.props.readFolder(this.pop(this.props.filemgmt.currentDir))
    } else {
      return;
    }
  }

  createNewFolder() {
    if (this.state.newFolderName.length < 1) {
      alert('A folder needs a name.');
      return;
    }
    this.props.createFolder(this.props.filemgmt.currentDir, this.state.newFolderName, this.props.auth.user.username, (err, res) => {
      if (err) {
        if(res.includes('EEXIST')) {
          alert('Folder already exists.');
        } else {
          alert(res);
        }
      } else {
        alert("Successfully created folder!");
        this.setState({ newFolderName : '' });
        this.props.readFolder(this.props.filemgmt.currentDir);
      }
    });
  }

  componentDidMount() {
    if(typeof this.props.filemgmt.files !== 'undefined') {
      this.setState({folderLoaded : true})
    }
  }

  selectAll() {
    let currentDirFiles = this.props.filemgmt.files;
    if (!this.state.allSelected) {
      this.props.updateSelectedFiles(currentDirFiles.map((item, index) => item.name));
    } else if(!this.props.filemgmt.selectedFiles.length) {
      this.props.updateSelectedFiles(currentDirFiles.map((item, index) => item.name));
    } else {
      this.props.updateSelectedFiles([]);
    }
    this.setState({allSelected : !this.state.allSelected});
  }

  deleteSelected() {
    if (this.props.filemgmt.selectedFiles.length < 1) {
      return;
    }
    let consent = window.confirm("Cannot be reverted once it is deleted. Are you sure you want to delete the selected?");
    if (!consent) {
      return;
    }
    let deleteableFiles = this.props.filemgmt.selectedFiles;
    this.props.deleteBunchOfFiles(this.props.filemgmt.currentDir, deleteableFiles, this.props.auth.user.username, (res) => {
      alert(res);
      this.props.readFolder(this.props.filemgmt.currentDir);
    });
  }

  handleFolderNameChange(e) {
    this.setState({newFolderName : e.target.value})
  }

  renderLoader() {
    return (
      <Segment loading padded>
        Loading...
      </Segment>
    );
  }

  renderFileDisplayComponent() {
    //let that = this;
    let folders = this.props.filemgmt.files.map((item, index) => {
        return (
          item.type === 'dir' ? <List.Item key={index}><FolderUnitComponent name={item.name} size={item.size} /></List.Item>  : null
        )
    });
    let files = this.props.filemgmt.files.map((item, index) => {
        return (
          item.type === 'file' ? <List.Item key={index}><FileUnitComponent name={item.name} size={item.size} ext={item.ext} id={item.id}/></List.Item> : null
        )
    });
    return (
      <div>
        {
          !this.state.folderLoaded
          ? this.renderLoader()
          : (
            <Segment>
              <List>
                {folders}
              </List>
              <List>
                {files}
              </List>
            </Segment>
          )
        }
    </div>
    )
  }

  render() {
    let isDisabled = this.props.filemgmt.currentDir === this.props.config.config.FS_ROOT;
    return (
      <div>
      <span style={fileDisplayStyles.topBar}>
        <span>
          <Button animated color='blue' disabled = {isDisabled} onClick={this.goBack.bind(this)}>
            <Button.Content visible>Back</Button.Content>
            <Button.Content hidden><Icon name='left arrow' /></Button.Content>
          </Button>
        </span>
        <span style={{float:'right'}}>
          {this.props.auth.user.permissions.search(/UPLOAD_FILES|ALL/) >= 0 ? <span>
            <Input action={{ color: 'blue', labelPosition: 'right', icon: 'plus', content: 'Create New Folder', onClick : this.createNewFolder.bind(this)}} placeholder='Type name here...' value={this.state.newFolderName} onChange={this.handleFolderNameChange.bind(this)} />
        </span> : null}
        </span>
      </span>
      <Divider></Divider>
      <div>
        Currently at : {this.props.filemgmt.currentDir}
      </div>
      <Divider></Divider>
      {this.props.auth.user.permissions.search(/DELETE_FILES|ALL/) >= 0 ?
          <span>
              <Button animated color='linkedin' onClick={this.selectAll.bind(this)}>
                <Button.Content visible>{this.state.allSelected && this.props.filemgmt.selectedFiles.length ? 'Uns' : 'S'}elect All</Button.Content>
                <Button.Content hidden><Icon name='check circle' /></Button.Content>
              </Button>
          </span>
          :
          null
      }
      {this.props.auth.user.permissions.search(/DELETE_FILES|ALL/) >= 0 ?
          <span style={{float:'right'}}>
            <Button animated  onClick={this.deleteSelected.bind(this)} negative>
              <Button.Content visible>Delete Selected</Button.Content>
              <Button.Content hidden><Icon name='remove circle' /></Button.Content>
            </Button>
          </span>
          :
          null
      }
      <Divider></Divider>
        <div>
          {this.renderFileDisplayComponent()}
        </div>
      </div>

    )
  }
}

function mapStateToProps({ filemgmt, auth, config }) {
  return { filemgmt, auth, config }
}

export default connect(mapStateToProps, actions)(FileDisplayComponent);

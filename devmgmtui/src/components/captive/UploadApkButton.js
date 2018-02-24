import { Icon } from 'semantic-ui-react';
import React, { Component } from 'react'

export default class UploadApkButton extends Component {
  render() {
    return(
      <span>
        <span onClick={()=>{document.getElementById("apkinput").click()}}>
          <Icon name='android'/>
        </span>
      </span>
    )
  }
}

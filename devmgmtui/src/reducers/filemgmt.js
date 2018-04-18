export default function (state={files : [], uploadableFiles : [], selectedFiles : [], allSelected : false, usbDir : '', usbDownFiles : []}, action){
    switch(action.type){
      case 'OPEN_DIR' :
        return {...state, currentDir : action.payload}
      case 'READ_DIR' :
        return {...state, files : action.payload}
      case 'UPLOAD_FILES' :
        return {...state, uploadableFiles : action.payload}
      case 'SELECT_FILES' :
        return {...state, selectedFiles : action.payload}
      case 'USB_DIR' :
        return {...state, usbDir : action.payload}
      case 'USB_DIR_DOWN' :
        return {...state, usbDownFiles : action.payload}
      default:
        return state
    }
}

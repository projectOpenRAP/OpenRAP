export default function (state={currentDir : '/var/www/', files : [], uploadableFiles : [], selectedFiles : [], allSelected : false, usbDir : ''}, action){
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
      default:
        return state
    }
}

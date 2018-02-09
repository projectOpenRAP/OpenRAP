<<<<<<< HEAD
export default function (state={currentDir : '/var/www/', files : [], uploadableFiles : [], selectedFiles : [], allSelected : false, usbDir : ''}, action){
=======
export default function (state={currentDir : '/home/admin/', files : [], uploadableFiles : []}, action){
>>>>>>> 6b61d90b5ac94d583d72c0420f84ec8490a847be
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

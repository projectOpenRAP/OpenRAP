export default function (state={currentDir : '/', files : [], autoUpload : false}, action){
    switch(action.type){
      case 'OPEN_DIR' :
        return {...state, currentDir : action.payload}
      case 'READ_DIR' :
        return {...state, files : action.payload}
      default:
        return state
    }
}

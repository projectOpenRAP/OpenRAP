export default function (state={authenticated:false}, action){
    switch(action.type){
        case 'UPLOAD_DOCUMENT_SUCCESS':
          return {...state, data : action.payload}
        case 'UPLOAD_DOCUMENT_FAIL':
          return {...state, error : action.payload}
        case 'CHANGE_DISPLAYED_DIR':
          return {...state, data : action.payload}
        default:
            return state
    }
}

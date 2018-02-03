export default function (state={authenticated:false}, action){
    switch(action.type){
        case 'UPGRADE_SUCCESS':
          return {...state, data : action.payload}
        case 'UPGRADE_FAIL':
          return {...state, error : action.payload}
        default:
            return state
    }
}

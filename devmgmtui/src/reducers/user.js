export default function (state={}, action){
    switch(action.type){
        case 'USER_LIST':
            return {...state, list : action.payload}
        case 'USER_PERMISSIONS':
            return {...state, permissions : action.payload}
        default:
            return state
    }
}

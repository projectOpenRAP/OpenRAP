export default function (state=null, action){
    switch(action.type){
        case 'ENABLE_AUTH':
            return {...state, authenticated : true, user : action.payload}
        case 'DISABLE_AUTH':
        return {...state, authenticated : false}
        default:
            return state
    }
}
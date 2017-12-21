export default function (state=null, action){
    switch(action.type){
        case 'ENABLE_AUTH':
            return true;
        case 'DISABLE_AUTH':
            return false
        default:
            return state
    }
}
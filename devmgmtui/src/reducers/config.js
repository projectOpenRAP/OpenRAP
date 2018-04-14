export default function (state={}, action) {
    switch(action.type){
        case 'CONFIG_FETCH':
            return { ...state, config : action.payload }
        default:
            return state
    }
}

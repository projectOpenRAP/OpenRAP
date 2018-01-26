export default function (state={ setSSID: false}, action) {
    switch(action.type) {
        case 'SET_SSID':
            return {...state, ssidSet: action.payload.ssidSetSuccessful};
        default:
            return state;
    }
}

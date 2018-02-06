export default function (state={ ssidSet: false, currentSSID: 'placeholder' }, action) {
    switch(action.type) {
        case 'SET_SSID':
            return {...state, ssidSet: action.payload.resData.ssidSetSuccessful, currentSSID: action.payload.ssid};
        default:
            return state;
    }
}

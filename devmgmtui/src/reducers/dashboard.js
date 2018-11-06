export default function (state={}, action) {
    switch(action.type) {
        case 'LAST_REFRESH_FETCH':
            return {...state, lastRefreshTime: action.payload}
        case 'INTERNET_STATUS_FETCH':
            return {...state, internetStatus : action.payload}
        case 'USERS_CONNECTED_FETCH':
            return {...state, usersConnected: action.payload}
        case 'SSID_FETCH':
            return {...state, currentSSID: action.payload};
        case 'MEMORY_FETCH':
            return {...state, memoryData: action.payload};
        case 'SPACE_FETCH':
            return {...state, spaceData: action.payload};
        case 'CPU_FETCH':
            return {...state, cpuData: action.payload};
        case 'VERSION_FETCH':
            return {...state, version: action.payload};
        case 'DEVICEID_FETCH':
            return {...state, deviceID: action.payload};
        default:
            return state;
    }
}

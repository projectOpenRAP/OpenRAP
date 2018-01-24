export default function (state={}, action) {
    switch(action.type) {
        case 'MEMORY_FETCH':
            return {...state, memoryData: action.payload};
        case 'SPACE_FETCH':
            return {...state, spaceData: action.payload};
        case 'CPU_FETCH':
            return {...state, cpuData: action.payload};
        case 'VERSION_FETCH':
            return {...state, version: action.payload};
        default:
            return state;
    }
}

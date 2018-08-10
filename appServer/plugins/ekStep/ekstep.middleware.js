let { initializeEkstepData } = require('./ekstep.init.js')

let ekStepData = {};

let addEkStepData = (req, res, next) => {
    req.ekStepData = ekStepData;
    next();
}

initalizeMiddleWare = () => {
    initializeEkstepData('/opt/opencdn/appServer/plugins/ekStep/profile.json').then(value => {
        ekStepData = value;
    });
}

initalizeMiddleWare();

module.exports = {
    addEkStepData
}

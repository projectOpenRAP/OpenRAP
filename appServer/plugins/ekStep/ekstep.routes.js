/*
    EkStep routes as defined in apiserver/ekstep/esInit.go
*/
let { getHomePage, performSearch, telemetryData, addEcar, deleteEcar, getEcarById } = require('./ekstep.controller.js');

module.exports = app => {
    app.post('/ekstep/plugins/homepage', getHomePage);
    app.post('/ekstep/plugins/search', performSearch);
    app.post('/ekstep/plugins/telemetry', telemetryData);
    app.put('/ekstep/plugins/ecar', addEcar);
    app.delete('/ekstep/plugins/ecar', deleteEcar);
    app.get('/ekstep/plugins/id', getEcarById);
}

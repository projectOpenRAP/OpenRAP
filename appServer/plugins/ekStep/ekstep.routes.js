
let { addEkStepData } = require('./ekstep.middleware.js')
let { getHomePage, getEcarById,  performSearch, telemetryData, extractFile, performRecommendation, createFolderIfNotExists, syncMadhi } = require('./ekstep.controller.js');
// let { uploadTelemetryToCloud } = require('./ekstep.telemetry_upload.js');

module.exports = app => {
    /*
        EkStep routes as defined in apiserver/ekstep/esInit.go
    */
    app.post('/api/page/v1/assemble/org.ekstep.genie.content.home', getHomePage);
    app.post('/data/v3/pageApi/assemble/org.ekstep.genie.content.home', getHomePage);
    app.post('/api/data/v3/pageApi/assemble/org.ekstep.genie.content.home', getHomePage);

    app.get('/api/learning/v2/content/:contentID', getEcarById);
    app.get('/content/v3/read/:contentID', getEcarById);
    app.get('/api/content/v3/read/:contentID', getEcarById);

    app.post('/api/telemetry/v1/telemetry', addEkStepData, telemetryData);
    app.post('/data/v3/telemetry', addEkStepData, telemetryData);
    app.post('/api/data/v3/telemetry', addEkStepData, telemetryData);

    app.post('/api/search/v2/search', performSearch);
    app.post('/composite/v3/search', performSearch);
    app.post('/api/composite/v3/search', performSearch);
	
    app.get('/api/sync/:profile', syncMadhi);

    app.post('/api/content/v3/recommend', performRecommendation);

}

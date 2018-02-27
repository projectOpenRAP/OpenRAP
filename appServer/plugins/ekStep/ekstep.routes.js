let multiparty = require('connect-multiparty');
let multipartMiddle = multiparty();
let fs = require('fs');

/*
    EkStep routes as defined in apiserver/ekstep/esInit.go
*/
let { getHomePage, getEcarById, telemetryData, addEcar, deleteEcar, performSearch } = require('./ekstep.controller.js');

module.exports = app => {

    app.post('/api/page/v1/assemble/org.ekstep.genie.content.home', getHomePage);
    app.post('/data/v3/pageApi/assemble/org.ekstep.genie.content.home', getHomePage);
    app.post('/api/data/v3/pageApi/assemble/org.ekstep.genie.content.home', getHomePage);

    app.post('/api/learning/v2/content/{contentID}', getEcarById);
    app.post('/content/v3/read/{contentID}', getEcarById);
    app.post('/api/content/v3/read/{contentID}', getEcarById);

    app.post('/api/telemetry/v1/telemetry', multipartMiddle, telemetryData);
    app.post('/data/v3/telemetry', multipartMiddle, telemetryData);
    app.post('/api/data/v3/telemetry', multipartMiddle, telemetryData);

    app.get('/api/search/v2/search', performSearch);
    app.get('/composite/v3/search', performSearch);
    app.get('/api/composite/v3/search', performSearch);

    let init = () => {
        /*
            read all ecars and add to search index
        */
        fs.readFile('/opt/opencdn/CDN/profile.json', (err, data) => {
            try {
                let config = JSON.parse(data);
                let currentProfile = config.active_profile;
                let contentRoot = config.available_profiles.active_profile.content_root;
                console.log(contentRoot);
            } catch (e) {
                console.log(e);
            }
        });

    }

    init();

}

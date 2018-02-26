/*
    Server entry file.
    No changes are required here to load a plugin
*/

'use strict';

const express = require('express');
const app = express();
const glob = require('glob');
const pluginPath = './plugins';
/*
    Loading all the plugins from plugin directory
*/

glob(pluginPath + "/**/*.routes.js", function (er, files) {
    for (let i = 0; i < files.length; i++) {
        require(files[i])(app);
    }
})

/*
    Starting the server on port 9090.
    TODO: make the port configurable later
*/

app.listen(9090, err => {
    if (err)
        console.log(err);
    else
        console.log("listening on 9090");
})
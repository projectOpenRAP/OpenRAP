'use strict';

const express = require('express');
const app = express();
const glob = require('glob');
app.get("/one", (req, res) => {
    res.send("one");
})
// require('./plugins/two/two.routes')(app);

// require('./plugins/three/three.routes')(app);
glob("./plugins/**/*.routes.js", function (er, files) {
    for (let i = 0; i < files.length; i++) {
        require(files[i])(app);
    }
})

app.listen(9090, err => {
    if (err)
        console.log(err);
    else
        console.log("listening on 9090");
})
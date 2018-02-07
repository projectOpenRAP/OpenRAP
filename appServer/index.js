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
    // files is an array of filenames.
    // If the `nonull` option is set, and nothing
    // was found, then files is ["**/*.js"]
    // er is an error object or null.
    console.log(files);
    for(let i =0;i<files.length;i++){
        console.log(files[i]);
        require(files[i])(app);
    }
  })

app.listen(9090, err => {
    if (err)
        console.log(err);
    else
        console.log("listening on 9090");
})
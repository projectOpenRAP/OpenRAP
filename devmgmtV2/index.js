"use strict"

let express = require("express");
let bodyParser = require('body-parser');
let app = express();


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse application/json
app.use(bodyParser.json());

require('./routes/auth.routes.js')(app);

app.listen(8080, err => {
    if (err)
        console.log(err);
    else
        console.log("server running on port 8080");
});

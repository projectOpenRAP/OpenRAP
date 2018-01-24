"use strict"

let express = require("express");
let bodyParser = require('body-parser');
let cors = require('cors');
let app = express();

app.use(cors())
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse application/json
app.use(bodyParser.json());

require('./routes/auth.routes.js')(app);
require('./routes/users.routes.js')(app);
require('./routes/upgrade.routes.js')(app);
require('./routes/dashboard.routes.js')(app);
require('./routes/ssid.routes.js')(app);

app.listen(8080, err => {
    if (err)
        console.log(err);
    else
        console.log("server running on port 8080");
});

/* 
    Sample plugin entry file. 
    File must be named as <pluginName>.routes.js and kept in plugin root directory
    A function is exported which takes in express app instance as argument

*/

/*
    Import the controller logic 
    can be used for writing our logic for routes

*/
let { getAllUsers } = require('./template.controller');


module.exports = app => {

    /*
        Declare your middlewares here on app instance if required 

    */
    /* 
        All your routes go here .
        Routes must be namespaced with plugin names to avoid any conflicting routes
        Each route will have respective controller attached to it
    */

    //app.get(<your/route>, [optional middleware], <your controller>)
    app.get('/template/allUsers', getAllUsers);

    /*
        You can also provide a init function here.
        This will get called while the plugin is initialized 
    */
    function init() {
        console.log("running init function")
    }
    /*
        Calling the init function here. {do not edit}
    */
    init();

    /* 
        You can have multiple init functions here with diffferent name.
        Which can be used to seperate out logic into different groups
    */
}

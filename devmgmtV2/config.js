module.exports = {
    config : {
        FS_ROOT : '/home/admin/',
        username : 'brandonStark',
        password : 'theBuilder',
        serverIP : '35.240.131.174',
        telemetryAPI : {
            init : `http://35.240.131.174:8888/api/auth/v1/init`, // Authenticates user and returns a token
            hello : `http://35.240.131.174:8000/api/auth/v1/hello`, // Checks if the user is authenticated
            upload : `http://35.240.131.174:8000/api/auth/v1/telemetry/couchbase` // Load telemetry
        },
        keyFile : '/etc/telemetry_key'
    }
}

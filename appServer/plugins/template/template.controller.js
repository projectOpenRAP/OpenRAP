/*
    Template controller files
    Your program logic goes here .
    The functions contains the logic and should be exported to be used in routes
*/


let getAllUsers = (req, res) => {
    res.send("All Users");
}

module.exports = {
    getAllUsers
}

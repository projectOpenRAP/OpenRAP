
module.exports = app =>{
    app.get('/two', (req,res) => {
        res.send("two");
    })
    app.get('/two1', (req,res) => {
        res.send("two1");
    })
    function init(){
        console.log("INIT")
    }
    init();
}
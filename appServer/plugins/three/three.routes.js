
module.exports = app =>{
    app.get('/three', (req,res) => {
        res.send('three');
    })
}
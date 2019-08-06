module.exports = function(app){
    
    app.use('/', require('./routes/index'))
    app.use('/', require('./routes/users')(app))
}
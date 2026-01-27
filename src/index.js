import app from './app.js'


app.listen(app.get('port'),()=>{
    console.log('aplicacion  backend abencoado corriendo en el puerto',app.get('port'))
})
import express from 'express';
import cors from 'cors';
import {PORT} from './config.js';
import routerUser from './usuario/routerUsuario.js';
import routerEmpresa from './empresa/routerEmpresa.js';
import routerCuenta from './planCuenta/routerCuenta.js';
import routerCotizaciones from './cotizaciones/routerCotizaciones.js';
const app= express();



app.get('/',(req,res)=>{
    res.send('hello word backend abencoado')
})
app.use(cors()) // arreglar el problema de especificar problema de cors en especifico
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use('/abencoado',routerUser)
app.use('/abencoado',routerEmpresa)
app.use('/abencoado',routerCuenta)
app.use('/abencoado',routerCotizaciones);
app.set('port',PORT)


export default app;
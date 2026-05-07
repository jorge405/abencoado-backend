import express from 'express';
import {addCotizacion,getCotizaciones,getCotizacionOne,getConfiguracion,updateConfiguracion,addConfiguracion,deleteFirma} from '../cotizaciones/controllerCotizaciones.js'
import {verifyToken} from '../utils/auth.js'
const routerCotizaciones= express.Router();



routerCotizaciones.post('/addCotizacion',addCotizacion);
//routerCotizaciones.get('/getCotizaciones/:gestion',getCotizaciones);
routerCotizaciones.get('/getCotizaciones/:gestion',getCotizaciones);
routerCotizaciones.post('/getCotizacionOne',getCotizacionOne);

// rutas configuraciones del sistema
routerCotizaciones.get('/getConfiguracion',getConfiguracion);
routerCotizaciones.patch('/updateConfiguracion',updateConfiguracion);
routerCotizaciones.patch('/addConfiguracion',addConfiguracion);
routerCotizaciones.patch('/deleteFirmas',deleteFirma)

export default routerCotizaciones;
import express from 'express';
import {addCotizacion,getCotizaciones,getCotizacionOne} from '../cotizaciones/controllerCotizaciones.js'
import {verifyToken} from '../utils/auth.js'
const routerCotizaciones= express.Router();



routerCotizaciones.post('/addCotizacion',addCotizacion);
//routerCotizaciones.get('/getCotizaciones/:gestion',getCotizaciones);
routerCotizaciones.get('/getCotizaciones',getCotizaciones);
routerCotizaciones.post('/getCotizacionOne',getCotizacionOne);


export default routerCotizaciones;
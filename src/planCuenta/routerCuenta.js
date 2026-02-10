import express from 'express';
import {addNombrecuenta,getNivelcuenta,getTipocuenta,getNombrecuenta} from '../planCuenta/controllerCuenta.js';
import {verifyToken} from '../utils/auth.js'
const routerCuenta= express.Router();

routerCuenta.get('/getNombrecuenta',getNombrecuenta);
routerCuenta.get('/getNivelcuenta',getNivelcuenta);
routerCuenta.get('/getTipocuenta',getTipocuenta);
routerCuenta.post('/addCuenta',addNombrecuenta);



export default routerCuenta;

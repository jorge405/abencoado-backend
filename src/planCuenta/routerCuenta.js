import express from 'express';
import {addNombrecuenta,getNivelcuenta,getTipocuenta,getNombrecuenta,updateCuenta} from '../planCuenta/controllerCuenta.js';
import {verifyToken} from '../utils/auth.js'
const routerCuenta= express.Router();

routerCuenta.get('/getNombrecuenta/:cod_empresa',getNombrecuenta);
routerCuenta.get('/getNivelcuenta',getNivelcuenta);
routerCuenta.get('/getTipocuenta',getTipocuenta);
routerCuenta.post('/addCuenta',addNombrecuenta);
routerCuenta.patch('/updateCuenta',updateCuenta);



export default routerCuenta;

import express from 'express';
import {getLibroMayorFechas,getLibroMayor,getLibroMayorOne,saldosMensuales,sumasYsaldos,estadoResultados,obtenerBalanceGeneral } from './controllerLibroMayor.js';
import {verifyToken} from '../utils/auth.js'
const routerLibroMayor= express.Router();



routerLibroMayor.post('/getLibroMayorFechas',getLibroMayorFechas);
routerLibroMayor.post('/getLibroMayor',getLibroMayor);
routerLibroMayor.post('/getlibroMayorOne',getLibroMayorOne);
routerLibroMayor.post('/getSaldosMensuales',saldosMensuales);
routerLibroMayor.post('/getSumasySaldos',sumasYsaldos);
routerLibroMayor.post('/estadoResultados',estadoResultados);
routerLibroMayor.post('/obtenerBalanceGeneral',obtenerBalanceGeneral);
//routerLibroDiario.get('/getallLibro/:cod_empresa',getAllLibro)
//routerUser.post('/deleteUser/:id',deleteUser);


export default routerLibroMayor;
import express from 'express';
import { getLibroDiario,addlibroDiario,getlibroFecha,getAllLibro,updateLibroDiario } from '../libroDiario/controllerLibroDiario.js';
import {verifyToken} from '../utils/auth.js'
const routerLibroDiario= express.Router();



routerLibroDiario.post('/getComprobante',getLibroDiario);
routerLibroDiario.post('/addComprobante',addlibroDiario);
routerLibroDiario.post('/getlibroFecha',getlibroFecha);
routerLibroDiario.get('/getallLibro/:cod_empresa',getAllLibro)
routerLibroDiario.post('/updateLibro/',updateLibroDiario)
//routerUser.post('/deleteUser/:id',deleteUser);


export default routerLibroDiario;
import express from 'express';
import { getLibroDiario } from '../libroDiario/controllerLibroDiario.js';
import {verifyToken} from '../utils/auth.js'
const routerLibroDiario= express.Router();



routerLibroDiario.post('/getComprobante',getLibroDiario);
//routerUser.post('/deleteUser/:id',deleteUser);


export default routerLibroDiario;
import express from 'express';
import {evolucionPatrimonio} from '../estadosFinancieros/controllerEstadoFinanciero.js'
import {verifyToken} from '../utils/auth.js'
const routerPatrimonio= express.Router();



routerPatrimonio.post('/evolucionPatrimonio',evolucionPatrimonio);


export default routerPatrimonio;
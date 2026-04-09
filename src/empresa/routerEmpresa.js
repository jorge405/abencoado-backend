import express from 'express';
import {getTipoEmpresa,addEmpresa,infoEmpresa,getEmpresas,getAllEmpresas} from '../empresa/controllerEmpresa.js';
import {verifyToken} from '../utils/auth.js'
const routerEmpresa= express.Router();



routerEmpresa.get('/getTipEmpresa',getTipoEmpresa);
routerEmpresa.post('/addEmpresa',addEmpresa);
routerEmpresa.post('/infoEmpresa',infoEmpresa);
routerEmpresa.get('/getEmpresas',getEmpresas);
routerEmpresa.get('/getAllEmpresas',getAllEmpresas)
//routerUser.post('/deleteUser/:id',deleteUser);


export default routerEmpresa;
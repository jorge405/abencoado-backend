import express from 'express';
import {getTipoEmpresa,addEmpresa,addActividad_secundaria,addActividades,infoEmpresa,infoActividadSecundaria,getEmpresas} from '../empresa/controllerEmpresa.js';
import {verifyToken} from '../utils/auth.js'
const routerEmpresa= express.Router();



routerEmpresa.get('/getTipEmpresa',getTipoEmpresa);
routerEmpresa.post('/addEmpresa',addEmpresa);
routerEmpresa.post('/addActividadSecundaria',addActividad_secundaria);
routerEmpresa.post('/addActividades',addActividades);
routerEmpresa.post('/infoEmpresa',infoEmpresa);
routerEmpresa.get('/infoActividadSecundaria/:cod_empresa',infoActividadSecundaria);
routerEmpresa.get('/getEmpresas',getEmpresas);
//routerUser.post('/deleteUser/:id',deleteUser);


export default routerEmpresa;
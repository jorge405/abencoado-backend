import express from 'express';
import multer from 'multer';
import {getTipoEmpresa,addEmpresa,infoEmpresa,getEmpresas,getAllEmpresas,addPuct} from '../empresa/controllerEmpresa.js';
import {verifyToken} from '../utils/auth.js'
const routerEmpresa= express.Router();

const upload= multer({dest:'uploads/'});

routerEmpresa.get('/getTipEmpresa',getTipoEmpresa);
routerEmpresa.post('/addEmpresa',addEmpresa);
routerEmpresa.post('/infoEmpresa',infoEmpresa);
routerEmpresa.get('/getEmpresas',getEmpresas);
routerEmpresa.get('/getAllEmpresas',getAllEmpresas);
routerEmpresa.post('/subirExcel',upload.single('archivo_plan'),addPuct);
//routerUser.post('/deleteUser/:id',deleteUser);


export default routerEmpresa;
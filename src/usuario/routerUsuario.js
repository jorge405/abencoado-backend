import express from 'express';
import { getUsuarios,addUser,updateUser,deleteUser,authUser} from '../usuario/controllerUsuario.js';
import {verifyToken} from '../utils/auth.js'
const routerUser= express.Router();



routerUser.get('/getUser',verifyToken,getUsuarios);
routerUser.post('/authUser',authUser);
routerUser.post('/addUser',addUser);
routerUser.post('/updateUser/:id',updateUser);
routerUser.post('/deleteUser/:id',deleteUser);


export default routerUser;
import {pool} from '../DB/connection.js'; 
import { generateToken } from '../utils/generateToken.js';


export const authUser= async(req,res)=>{
    const {correo,pass,nit}= req.body;
    try {
           
        const [rows]= await pool.query('select u.cod_usuario,u.correo_electronico,u.pass,tp.tip_user from usuario u Inner join empresa e on u.cod_empresa=e.cod_empresa Inner join tip_user tp on tp.cod_tipUser=u.cod_tipUser  where u.correo_electronico= ? and u.pass=? and e.nit=? ',[correo,pass,nit]);
        if(rows.length===0){
            
            return res.status(401).json({msg:'correo o contraseña incorrectos',estado:'error'})
        }else{
            const {cod_usuario}= rows[0];   
            console.log(cod_usuario)
            const {token,expiresIn} = generateToken(cod_usuario,correo,pass);
                    
                    return res.status(200).json({
                        msg:'contraseña y correo correcto',
                        estado:'ok',
                        token,
                        expiresIn
                    })    
        }
    } catch (error) {
        console.log('problemas al autenticar el usuario: ',error)
        return res.status(500).json({msg:'error en el servidor espere un momento'})
    }
}

export const getUsuarios = async(req,res)=>{
    try {
        
        const [rows]= await pool.query('SELECT * FROM usuario WHERE estado_int=1')    
        
        res.status(200).json(rows);
    } catch (error) {
        console.log('problemas al obtener los usuarios:',error)
        res.status(500).json({msg:'error en el servidor espere un momento'})
    }
}

export const addUser= async(req,res)=>{

    try {
        const {correo_electronico,pass,cod_tipUser,cod_empresa} = req.body
        
        const [rows] = await pool.query('INSERT INTO usuario(correo_electronico,pass,cod_tipUser,cod_empresa) VALUES(?,?,?,?)',[correo_electronico,pass,cod_tipUser,cod_empresa])
        if(rows.affectedRows===1){
            res.status(200).json({msg:'usuario creado',estado:'ok'})    
        }else{
            res.status(401).json({msg:'no se pudo crear el usuario',estado:'error'})
            return;
        }
        
    } catch (error) {
        console.log('problemas al agregar el usuario:', error)
        res.status(500).json({msg:'error en el servidor espere un momento'})        
    }
}


export const updateUser= async(req,res)=>{
     const {id}=req.params;
     const {usuario,pass}=req.body;   
    try {
        const [rows]=await pool.query('UPDATE usuario SET usuario= IFNULL(?,usuario), pass= IFNULL(?,pass),estado_int=1 WHERE cod_usuario=?',[usuario,pass,id])
        if(rows.affectedRows===1){
            res.status(200).json({message:'usuario actualizado correctamente',status:'ok'})
        }
    } catch (error) {
        console.log('problemas al actualizar el usuario:', error)
        res.status(500).json({message:'error en el servidor espere un momento'})
    }
}

export const deleteUser= async(req,res)=>{
    const {id}=req.params;
    const {estado_int}=req.body;
    try {
        const [rows]=await pool.query('UPDATE usuario SET estado_int= IFNULL(?,estado_int) WHERE cod_usuario=?',[estado_int,id])
        if(rows.affectedRows===1){
            res.status(200).json({message:'usuario inhabilitado correctamente',status:'ok'})
        }
        
    } catch (error) {
        console.log('problemas al inhabilitar el usuario:', error)  
        res.status(500).json({message:'error en el servidor espere un momento'})
    }
}
import {pool} from '../DB/connection.js'; 
import { generateToken } from '../utils/generateToken.js';
import jwt from 'jsonwebtoken';

export const getTipoEmpresa= async (req,res)=>{

    try {

        const [rows]= await pool.query('Select cod_tpEmpresa,tipo_empresa from tip_empresa');
        
        if(rows.length===0){
            
            return res.status(401).json({msg:'no se encontro registros',estado:'error'})
        }else{
                    
                    return res.status(200).json({
                        msg:'registros encontrados',
                        estado:'ok',
                        rows
                    }) 
        }
    } catch (error) {
        console.log('problemas al obtener los tipos de empresa:', error)        
    } 

}

export const addEmpresa= async(req,res)=>{
    try {
        const {razon_social,nombre_propietario,nro_testimonio,nro_poder,notaria,nit,
                fecha_inscripcion,direccion,municipio,zona,departamento,tipo_via,
                nombre_via,nro_puerta,referencias,actividad_principal,cod_tpEmpresa}=req.body

        const [rows]= await pool.query('INSERT INTO empresa(razon_social,nombre_propietario,nro_testimonio,nro_poder,notaria,nit,fecha_inscripcion,direccion,municipio,zona,departamento,tipo_via,nombre_via,nro_puerta,referencias,actividad_principal,cod_tpEmpresa) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
            ,[razon_social,nombre_propietario,nro_testimonio,nro_poder,notaria,
                nit,fecha_inscripcion,direccion,municipio,zona,departamento,tipo_via,nombre_via,nro_puerta,
            referencias,actividad_principal,cod_tpEmpresa])
            if(rows.affectedRows===1){
                const cod_empresa=rows.insertId;
            res.status(200).json({msg:'empresa creada',estado:'ok',cod_empresa})    
        }
    } catch (error) {
        console.log('problemas al crear la empresa: ',error)
        res.status(500).json({msg:'error en el servidor espere un momento',estado:'error'})
    }
}

export const addActividad_secundaria=async(req,res)=>{
    try {
        const {actividad_secundaria} = req.body

        const jsonActividad_secundaria= JSON.stringify(actividad_secundaria);
        const [rows] = await pool.query('INSERT INTO actividad_secundaria (actividad_secundaria) values(?)',[jsonActividad_secundaria])
        const cod_actividadSecundaria= rows.insertId;
        if (rows.affectedRows===1) {
           return res.status(200).json({msg:'actividades secundarias creadas',estado:'ok',cod_actividadSecundaria})
        }
    } catch (error) {
        console.log('problemas al agregar las actividades secundarias: ',error)
        res.status(500).json({msg:'error en el servidor espere un momento',estado:'error'})
    }
}

export const addActividades=async(req,res)=>{
    try {
        
        const {cod_empresa,cod_actividadSecundaria}=req.body;

        const [rows]= await pool.query('INSERT INTO actividades (cod_empresa,cod_actividadS) values(?,?)',[cod_empresa,cod_actividadSecundaria]);
        if (rows.affectedRows===1) {
            return res.status(200).json({msg:'actividades asignadas',estado:'ok'})
        }
    } catch (error) {
        console.log('problemas al asignar las actividades: ',error);
        return res.status(500).json({msg:'error en el servidor espere un momento',estado:'error'})
    }
}

export const infoEmpresa= async(req,res)=>{
    const {token} = req.body;
        const secretkey= process.env.SECRET_KEY;
        if (!token) return res.status(400).json({msg:'token no proporcionado',estado:'error'})
        
    try {
        const decoded= jwt.verify(token,secretkey);
        const {uid,correo} = decoded;
        console.log(uid)
        console.log(correo)
        const [rows]= await pool.query('select e.cod_empresa,e.razon_social,e.nombre_propietario,e.nro_testimonio,e.nro_poder,e.notaria,e.nit,e.fecha_inscripcion,e.direccion,e.municipio,e.zona,e.departamento,e.tipo_via,e.nombre_via,nro_puerta,e.referencias,e.actividad_principal,tp.tipo_empresa  from empresa e inner join usuario u on e.cod_empresa=u.cod_empresa inner join tip_empresa tp on tp.cod_tpEmpresa=e.cod_tpEmpresa where u.cod_usuario=? and u.correo_electronico=?',[uid,correo])
        console.log(rows)
        if (rows.length===0) {
            return res.status(404).json({msg:'no se encontro ninguna empresa',estado:'error'})
        }
        return res.status(200).json({msg:'info empresa',estado:'ok',data:rows})
    } catch (error) {
        console.log('error en el servidor: ',error)
        return res.status(500).json({msg:'error en el servidor',estado:'error'});
    }
} 
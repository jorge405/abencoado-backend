import {pool} from '../DB/connection.js'; 
import { generateToken } from '../utils/generateToken.js';
import jwt from 'jsonwebtoken';

import XLSX from 'xlsx';
import {unlink} from 'fs/promises'

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

export const addEmpresa = async (req, res) => {
    const {
        razon_social, nombre_propietario, nro_testimonio, nro_poder, notaria, nit,
        fecha_inscripcion, direccion, municipio, zona, departamento, tipo_via,
        nombre_via, nro_puerta, referencias, actividad_principal, cod_tpEmpresa,
        actividad_secundaria, usuario
    } = req.body;

    // Obtenemos una conexión del pool
    const connection = await pool.getConnection();

    try {
        // 1. Iniciar la transacción
        await connection.beginTransaction();

        // 2. Preparar el campo JSON (actividad_secundaria)
        // Convertimos el array ['venta', 'comercio'] a un string JSON '["venta","comercio"]'
        const actividadSecData = Array.isArray(actividad_secundaria) 
            ? JSON.stringify(actividad_secundaria) 
            : JSON.stringify([]);

        // 3. Insertar la empresa
        const queryEmpresa = `
            INSERT INTO empresa (
                razon_social, nombre_propietario, nro_testimonio, nro_poder, notaria, nit,
                fecha_inscripcion, direccion, municipio, zona, departamento, tipo_via,
                nombre_via, nro_puerta, referencias, actividad_principal, cod_tpEmpresa, actividad_secundaria
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const [rows] = await connection.query(queryEmpresa, [
            razon_social, nombre_propietario, nro_testimonio, nro_poder, notaria, nit,
            fecha_inscripcion, direccion, municipio, zona, departamento, tipo_via,
            nombre_via, nro_puerta, referencias, actividad_principal, cod_tpEmpresa,
            actividadSecData
        ]);

        const cod_empresa = rows.insertId;

        // 4. Validar y procesar el usuario
        if (typeof usuario === 'object' && usuario !== null && !Array.isArray(usuario)) {
            const { correo_electronico, pass } = usuario;

            // Insertar el usuario vinculado a la empresa
            const queryUser = 'INSERT INTO usuario (correo_electronico, pass, cod_tipUser, cod_empresa) VALUES (?, ?, ?, ?)';
            await connection.query(queryUser, [correo_electronico, pass, 2, cod_empresa]);

            // 5. Clonar el Plan de Cuentas Global a la nueva empresa
            /*const consultaPlan = `
                INSERT INTO nombre_cuenta (nombre_cuenta, puct, cod_nivelCuenta, cod_tpcuenta, cod_empresa) 
                SELECT nombre_cuenta, puct, cod_nivelCuenta, cod_tpcuenta, ? 
                FROM plancuenta_global`; */
            
            //await connection.query(consultaPlan, [cod_empresa]);

            // 6. Si todo salió bien, confirmamos los cambios
            await connection.commit();

            res.status(200).json({
                status: 'ok',
                msg: 'Datos registrados correctamente'
            });

        } else {
            // Si el objeto usuario no es válido, hacemos rollback para no dejar la empresa huérfana
            await connection.rollback();
            return res.status(400).json({
                status: 'error formato',
                msg: 'El campo usuario debe ser un objeto válido (no texto ni array)'
            });
        }

    } catch (error) {
        // 7. En caso de cualquier error, revertimos todo
        if (connection) await connection.rollback();
        
        console.error('Error detallado al crear la empresa:', error);
        
        res.status(500).json({
            status: 'error',
            msg: 'Error en el servidor al procesar el registro',
            error: error.message
        });
    } finally {
        // 8. SIEMPRE liberamos la conexión al pool, pase lo que pase
        if (connection) connection.release();
    }
};

export const addPuct = async(req,res)=>{
    const filePath= req.file?.path;
    const connection= await pool.getConnection();

    try {
        const {cod_empresa} = req.body;
        console.log(cod_empresa)
        if (!req.file) {
                return res.status(400).json({msg:'no se subio el archivo', status:'vacio'})
        }
        const workbook = XLSX.readFile(filePath);
        const workSheet=workbook.Sheets[workbook.SheetNames[0]];
        const rawData= XLSX.utils.sheet_to_json(workSheet);
        const datosFinales = rawData.map(fila => [
            fila.nombre_cuenta,
            fila.puct,
            fila.cod_nivelCuenta,
            fila.cod_tpcuenta,
            cod_empresa
        ]);

        // iniciar transaccion
        await connection.beginTransaction();

        const query=`INSERT INTO nombre_cuenta (nombre_cuenta,puct,cod_nivelCuenta,cod_tpcuenta,cod_empresa) VALUES ?`;
        const [result] = await connection.query(query,[datosFinales]);
        // si todo es correcto confirmamos los cambios permanentemente
        await connection.commit();
        // borramos el archivo temporal de la carpeta uploads
        await unlink(filePath)
        res.status(200).json({
            msg:'importacion realizada con exito puct subido correctamente',
            status:'ok'
        }) 
    } catch (error) {
        // SI OCURRE UN ERROR: Deshacemos cualquier cambio en la DB
        await connection.rollback()
        console.log('error en el proceso de importacion: ',error)
        if (filePath) await unlink(filePath).catch(() => {});
        res.status(500).json({ msg: 'Error en el servidor',status:'error' });
    }finally{
        // LIBERAR CONEXIÓN: Siempre debe volver al pool para que otros la usen
        connection.release();
    }
}
export const infoEmpresa= async(req,res)=>{
    const {token} = req.body;
        const secretkey= process.env.SECRET_KEY;
        if (!token) return res.status(400).json({msg:'token no proporcionado',estado:'error'})
        
    try {
        const decoded= jwt.verify(token,secretkey);
        const {uid,correo} = decoded;
        
        const [rows]= await pool.query('select e.cod_empresa,e.razon_social,e.nombre_propietario,e.nro_testimonio,e.nro_poder,e.notaria,e.nit,e.fecha_inscripcion,e.direccion,e.municipio,e.zona,e.departamento,e.tipo_via,e.nombre_via,nro_puerta,e.referencias,e.actividad_principal,e.actividad_secundaria,tp.tipo_empresa  from empresa e inner join usuario u on e.cod_empresa=u.cod_empresa inner join tip_empresa tp on tp.cod_tpEmpresa=e.cod_tpEmpresa where u.cod_usuario=? and u.correo_electronico=?',[uid,correo])
        console.log(rows)
        if (rows.length===0) {
            return res.status(404).json({msg:'no se encontro ninguna empresa',estado:'error'})
        }
        const formattedRows = rows.map(row => ({
            ...row,
            fecha_inscripcion: row.fecha_inscripcion ? new Date(row.fecha_inscripcion).toISOString().slice(0,10).replace(/-/g,'/') : row.fecha_inscripcion
        }));
        return res.status(200).json({msg:'info empresa',estado:'ok',rows:formattedRows})
    } catch (error) {
        console.log('error en el servidor: ',error)
        return res.status(500).json({msg:'error en el servidor',estado:'error'});
    }
} 



export const getEmpresas= async(req,res)=>{
    try {
        const [rows] = await pool.query('select e.cod_empresa,e.razon_social,e.nombre_propietario,e.nro_testimonio,e.nro_poder,e.notaria,e.nit,e.fecha_inscripcion,e.direccion,e.municipio,e.zona,e.departamento,e.tipo_via,e.nombre_via,nro_puerta,e.referencias,e.actividad_principal,tp.tipo_empresa  from empresa e inner join tip_empresa tp on tp.cod_tpEmpresa=e.cod_tpEmpresa');
        if (rows.length===0) {
            return res.status(202).json({msg:'no se encontraron registros',estado:'vacio'});
        }
        return res.status(200).json({msg:'registros encontrados',estado:'ok',rows})
    } catch (error) {
        console.log('error en el servidor: ',error)
        return res.status(500).json({msg:'error en el servidor',estado:'error'})
    }
}
export const getAllEmpresas=async(req,res)=>{
    try {
        const [rows] = await pool.query('Select * from empresa ')
        if (rows.length===0) {
            res.status(202).json({
                status:'vacio',
                msg:'datos no encontrados'
            })
        }
        const formattedRows = rows.map(row => ({
            ...row,
            fecha_inscripcion: row.fecha_inscripcion ? new Date(row.fecha_inscripcion).toISOString().slice(0,10).replace(/-/g,'/') : row.fecha_inscripcion
        }));
        res.status(200).json({
            status:'ok',
            msg:'datos encontrados',
            rows:formattedRows
        })
    } catch (error) {
        console.log('ha ocurrido un error: ',error)
        res.status(500).json({
            status:'error',
            msg:'error en el servidor'
        })
    }
}
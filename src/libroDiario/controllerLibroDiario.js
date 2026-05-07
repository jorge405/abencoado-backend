import {pool} from '../DB/connection.js'; 
import { generateToken } from '../utils/generateToken.js';
import jwt from 'jsonwebtoken';

export const getLibroDiario= async(req,res)=>{
    const {fecha_comprobante,tipo_comprobante}= req.body;
    try {
        
        const [rows] = await pool.query('select *, COUNT(*) OVER() as total_comprobante from comprobante where MONTH(fecha_comprobante)= MONTH(?) AND YEAR(fecha_comprobante)=YEAR(?) AND tipo_comprobante=?',[fecha_comprobante,fecha_comprobante,tipo_comprobante]);

        if(rows.length===0){
            res.status(202).json({
                msg:'no se encontraron registros',
                estado:'vacio'
            })
        }
        
        const total_comprobantes= rows[0].total_comprobante;
        const comprobantes= rows.map(({total_comprobante,...resto})=> resto);
        res.status(200).json({
            msg:'registros encontrados',
            estado:'ok',
            total_comprobantes,
            comprobantes
        })
    } catch (error) {
        console.log('problemas con el servidor: ',error);
        res.status(500).json({
            msg:'prroblemas con el servidor',
            estado:'error'
        })
    }
}

export const addlibroDiario= async(req,res)=>{
const {cod_comprobante,nro_comprobante,tipo_comprobante,fecha_comprobante,cod_empresa,glosa,metodo_pago,total_debe,total_haber,dolar,ufv,anio,estado,razon_social,asiento} = req.body;
        // obtener una conexion  del pool para la transaccion
        const connection= await pool.getConnection();
    try {
        // iniciar la transaccion
         await connection.beginTransaction();

         // insertar comprobante 
         const query='INSERT INTO comprobante (nro_comprobante,fecha_comprobante,tipo_comprobante,glosa,metodo_pago,total_debe,total_haber,cod_empresa,estado,dolar,ufv,anio,razon_social) values (?,?,?,?,?,?,?,?,?,?,?,?,?)'
         const [rows]= await connection.query(query,[nro_comprobante,fecha_comprobante,tipo_comprobante,glosa,metodo_pago,total_debe,total_haber,cod_empresa,estado,dolar,ufv,anio,razon_social])
        
         // obtener el ID recien creado
         const nuevoComprobante= rows.insertId;
         

         // validar que vienen líneas de asiento
         if (!Array.isArray(asiento) || asiento.length === 0) {
           throw new Error('El campo "asiento" debe ser un arreglo de objetos con al menos una fila');
         }

         // preparamos la insercion del asiento 
         // mapeamos el array para incluir el ID del comprobante en cada fila
         const valorAsiento = asiento.map(item => [
            nuevoComprobante,
            item.cod_nombreCuenta,
            item.debe,
            item.haber,  
            item.referencia
         ]); 

         // insertar todo el asiento en una sola consulta usando inserción masiva
         // `valorAsiento` es un arreglo de arreglos con los valores para cada fila, por lo
         // que debemos utilizar el marcador `VALUES ?` y pasar el arreglo envuelto en otro
         // arreglo tal y como lo espera mysql2.
         const sqlAsiento =
           'INSERT INTO asiento_contable (cod_comprobante,cod_nombreCuenta,debe,haber,referencia) VALUES ?';
         await connection.query(sqlAsiento, [valorAsiento]);
         await connection.commit();
         res.status(200).json({
            status:'ok',
            msg:' datos registrados correctamente'
         })

    } catch (error) {
        await connection.rollback();
        console.log('error en el servidor: ',error);
        res.status(500).json({
            status:'error',
            msg:'error en el serividor'
        })
    }finally{
        connection.release();
    }
} 

export const updateLibroDiario= async(req,res)=>{
    const {cod_comprobante,nro_comprobante,razon_social,fecha_comprobante,total_debe,total_haber,dolar,ufv,anio,glosa,metodo_pago,tipo_comprobante,cod_empresa,asiento} =req.body

    const connection= await pool .getConnection();

    try {
        await connection.beginTransaction();
        const sqlUpdateComprobante= `UPDATE comprobante set nro_comprobante=? ,tipo_comprobante=?,fecha_comprobante=?,razon_social=?
            ,glosa=?,metodo_pago=?,total_debe=?,total_haber=?,anio=?,dolar=?,ufv=?,cod_empresa=? where cod_comprobante=?`;

        await connection.query(sqlUpdateComprobante,[nro_comprobante,tipo_comprobante,fecha_comprobante,razon_social,glosa,metodo_pago,total_debe,total_haber,anio,dolar,ufv,cod_empresa,cod_comprobante]);

        // eliminar asientos antiguos relacionado a este comprobante 
        // esto limpia el detalle para evitar duplicados o IDS  huerfanos

        await connection.query('DELETE FROM asiento_contable where cod_comprobante =?',[cod_comprobante]);

        const valoresAsientos= asiento.map(a=>[
            cod_comprobante,
            a.cod_nombreCuenta,
            a.referencia,
            a.debe,
            a.haber
        ])

        const sqlInsertAsiento=`INSERT INTO asiento_contable  (cod_comprobante,cod_nombreCuenta,referencia,debe,haber) VALUES ?`
        await connection.query(sqlInsertAsiento,[valoresAsientos]);
        
        //  SI TODO SALIO BIEN , CONFIRMAR CAMBIOS 
        await connection.commit();
        res.status(200).json({msg:'comprobantes y asientos actualizados correctamente', status:'ok'});

    } catch (error) {
        // SI ALGO  FALLA , DESHACER TODO (NO SE GUARDA NI LA CABECERA NI LOS ASIENTOS )
        await  connection.rollback();
        console.log("error en el servidor: ",error);
        res.status(500).json({
            error:'error en el intento al actualizar',
            status:'error'
        })
    } finally{
        connection.release();
    }

}
export const getAllLibro= async(req,res)=>{
    const {cod_empresa}= req.params
    try {
        const [rows]= await pool.query('select * from vistalibrofecha where cod_empresa=?',[cod_empresa]);
        if (rows.length===0) {
            res.status(202).json({
                status:'vacio',
                msg:'no se encontraron registros'
            })
        }
        // Formatear fecha_comprobante a YYYY/MM/DD
        const formattedRows = rows.map(row => ({
            ...row,
            fecha_comprobante: row.fecha_comprobante ? new Date(row.fecha_comprobante).toISOString().slice(0,10).replace(/-/g,'/') : row.fecha_comprobante
        }));
        res.status(200).json({
            status:'ok',
            msg:'datos encontrados',
            rows: formattedRows
        })
    } catch (error) {
        console.log('ha ocurrido un error :',error)
        res.status(500).json({
            status:'error',
            msg:'ha ocurrido un error en el servidor'
        })
    }
}
export const getlibroFecha= async(req,res)=>{
    const {fecha1,fecha2,tipo_comprobante,cod_empresa}= req.body
    try {
        const [rows] = await pool.query('select * from vistalibrofecha where (fecha_comprobante between ? and ?) AND (tipo_comprobante=?) AND cod_empresa=?',[fecha1,fecha2,tipo_comprobante,cod_empresa]);

        if (rows.length===0) {
            res.status(202).json({
                status:'vacio',
                msg:'no se encontraron registros'
            })
        }
        const formattedRows = rows.map(row => ({
            ...row,
            fecha_comprobante: row.fecha_comprobante ? new Date(row.fecha_comprobante).toISOString().slice(0,10).replace(/-/g,'/') : row.fecha_comprobante
        }));
        res.status(200).json({
            status:'ok',
            msg:'datos encontrados',
            rows:formattedRows
        })
    } catch (error) {
        console.log('ha ocurrido un error :',error)
        res.status(500).json({
            status:'error',
            msg:'ha ocurrido un error en el servidor'
        })
    }
}
import {pool} from '../DB/connection.js'; 
import { generateToken } from '../utils/generateToken.js';
import jwt from 'jsonwebtoken';



export const addCotizacion= async(req,res)=>{
    const datos = req.body;

    if (!Array.isArray(datos) || datos.length === 0) {
        return res.status(400).json({ 
            estado:'vacio', 
            msg: 'No hay datos para guardar' 
        });
    }

    try {
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        for (const row of datos) {
            const fecha = new Date(row.fecha);
            const fechaFormato = fecha.toISOString().split('T')[0]; // Formato: YYYY-MM-DD
            
            const query = 'INSERT INTO cotizaciones (fecha, dolar, ufv) VALUES (?, ?, ?)';
            await connection.query(query, [fechaFormato, row.dolar, row.ufv]);
        }

        await connection.commit();
        connection.release();

        res.status(200).json({ 
            estado: 'ok', 
            message: `${datos.length} registros guardados correctamente` 
        });

    } catch (error) {
        console.log('error en el servidor: ',error)
        res.status(500).json({ 
            estado: 'error', 
            msg: 'error en el servidor, espere un momento' 
        });
    }
}

export const getCotizaciones= async(req,res)=>{
    
    //const {gestion} = req.params
    
    try {
        //const [rows]= await pool.query('Select cod_cotizacion,fecha,dolar,ufv from cotizaciones where gestion=?',[gestion]);
        const [rows] = await pool.query('Select cod_cotizacion,fecha,dolar,ufv from cotizaciones')
        if (rows.length===0) {
            res.status(404).json({
                estado:'vacio',
                msg:'no se encontraron registros'
            })
        }
        res.status(200).json({
            estado:'ok',
            msg:'registros encontrados',
            rows
        })
    } catch (error) {
        res.status(500).json({
            estado:'error',
            msg:'error en el servidor'
        })
    }
}

export const getCotizacionOne = async(req,res)=>{
    const {fecha_comprobante} = req.body;
    
    try {
        const [rows] = await pool.query('select cod_cotizacion,fecha,dolar,ufv from cotizaciones where fecha=?',[fecha_comprobante]);
        if (rows.length===0) {
            res.status(404).json({
                estado:'vacio',
                msg:'no se encontraron registros'
            })
        }
        res.status(200).json({
            estado:'ok',
            msg:'cotizacion encontrada',
            rows
        })
    } catch (error) {
        console.log(error)
    }
} 
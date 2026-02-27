import {pool} from '../DB/connection.js'; 
import { generateToken } from '../utils/generateToken.js';
import jwt from 'jsonwebtoken';

export const getLibroDiario= async(req,res)=>{
    const {fecha_comprobante}= req.body;
    try {
        
        const [rows] = await pool.query('select *, COUNT(*) OVER() as total_comprobante from comprobante where MONTH(fecha_comprobante)= MONTH(?) AND YEAR(fecha_comprobante)=YEAR(?)',[fecha_comprobante,fecha_comprobante]);

        if(rows.length===0){
            res.status(202).json({
                msg:'no se encontraron registros',
                estado:'vacio'
            })
        }
        const total= rows[0].total_comprobante;
        const comprobantes= rows.map(({total_comprobante,...resto})=> resto);
        res.status(200).json({
            msg:'registros encontrados',
            estado:'ok',
            total_comprobante:total,
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
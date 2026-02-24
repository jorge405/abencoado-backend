import {pool} from '../DB/connection.js'; 
import { generateToken } from '../utils/generateToken.js';
import jwt from 'jsonwebtoken';

export const getLibroDiario= async(req,res)=>{
    const {fecha_comprobante}= req.body;
    try {
        
        const [rows] = await pool.query('select cod_comprobante,nro_comprobante,fecha_comprobante,glosa,metodo_pago,total_debe,total,haber,diferencia,cod_empresa from comprobante where fecha_comprobante= ?',[fecha_comprobante]);

        if(rows.length===0){
            res.status(202).json({
                msg:'no se encontraron registros',
                estado:'vacio'
            })
        }
        res.status(200).json({
            msg:'registros encontrados',
            estado:'ok',
            rows
        })
    } catch (error) {
        console.log('problemas con el servidor: ',error);
        res.status(500).json({
            msg:'prroblemas con el servidor',
            estado:'error'
        })
    }
}
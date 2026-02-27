import {pool} from '../DB/connection.js'; 
import { generateToken } from '../utils/generateToken.js';
import jwt from 'jsonwebtoken';


export const addNombrecuenta= async(req,res)=>{
    const {nombre_cuenta,puct,cod_nivelCuenta,cod_tpcuenta,cod_empresa } =req.body

    try {
        const [rows]= await pool.query('insert into nombre_cuenta(nombre_cuenta,puct,cod_nivelCuenta,cod_tpcuenta) values(?,?,?,?,?)',[nombre_cuenta,puct,cod_nivelCuenta,cod_tpcuenta,cod_empresa])
        if (rows.affectedRows===0) {
            res.status(400).json({
                msg:'hubo error al registrar nombre cuenta',
                estado:'error'
            })
        } 
        const cod_nombreCuenta=rows.insertId;
        res.status(200).json({
            msg:'nombre de cuenta registrado correctamente',
            estado:'ok',
            cod_nombreCuenta
        })
    } catch (error) {
        console.log('hubo problemas con el servidor :',error);
        res.status(500).json({
            msg:'hubo problemas con el servidor',
            estado:'error'
        })        
    }
}

export const getNombrecuenta = async (req,res)=>{

    try {
        const [rows] = await pool.query('select cod_nombreCuenta,nombre_cuenta,puct,cod_nivelCuenta,cod_tpcuenta from nombre_cuenta');
        if (rows.length===0) {
            res.status(204).json({
                msg:'datos no encontrados',
                estado:'vacio'
            })
        }
        res.status(200).json({
            msg:'datos encontrados',
            estado:'ok',
            rows
        })
    } catch (error) {
        console.log('error en el servidor: ',error)
        res.status(500).json({
            msg:'problemas con el servidor',
            estado:'ok'
        })
    }
}

export const getNivelcuenta= async (req,res)=>{
    try {
        const [rows] = await pool.query('select cod_nivelCuenta,nivel_cuenta  from nivel_cuenta');
        if (rows.length===0) {
            res.status(204).json({
                msg:'no se encontraron registros',
                estado:'ok'
            })
        }
        res.status(200).json({
            msg:'datos encontrados',
            estado:'ok',
            rows
        })
    } catch (error) {
        console.log('hubo problemas con el servidor: ',error)
        res.status(500).json({
            msg:'problemas con el servidor',
            estado:'error'
        })        
    }
}

export const getTipocuenta= async (req,res)=>{
    try {
        const [rows] = await pool.query('select cod_tpcuenta,tipo_cuenta  from tipo_cuenta');
        if (rows.length===0) {
            res.status(204).json({
                msg:'no se encontraron registros',
                estado:'ok'
            })
        }
        res.status(200).json({
            msg:'datos encontrados',
            estado:'ok',
            rows
        })
    } catch (error) {
        console.log('hubo problemas con el servidor: ',error)
        res.status(500).json({
            msg:'problemas con el servidor',
            estado:'error'
        })        
    }
}
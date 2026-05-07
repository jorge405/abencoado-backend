import {pool} from '../DB/connection.js'; 
import { generateToken } from '../utils/generateToken.js';
import jwt from 'jsonwebtoken';


export const addNombrecuenta= async(req,res)=>{
    const {nombre_cuenta,puct,cod_nivelCuenta,cod_tpcuenta,cod_empresa } =req.body

    try {
        const [rows]= await pool.query('insert into nombre_cuenta(nombre_cuenta,puct,cod_nivelCuenta,cod_tpcuenta,cod_empresa) values(?,?,?,?,?)',[nombre_cuenta,puct,cod_nivelCuenta,cod_tpcuenta,cod_empresa])
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

export const getNombrecuenta = async (req, res) => {
    const { cod_empresa } = req.params;

    // Validación inicial
    // Nota: req.params siempre trae strings, conviene convertir o comparar con ==
    if (!cod_empresa || cod_empresa == 0) { 
        return res.status(204).json({
            msg: 'no se encontro la empresa',
            status: 'null'
        });
    }

    try {
        const [rows] = await pool.query(
            'select cod_nombreCuenta, nombre_cuenta, puct, cod_nivelCuenta, cod_tpcuenta from nombre_cuenta where cod_empresa = ?',
            [cod_empresa]
        );

        if (rows.length === 0) {
            // AGREGAR RETURN AQUÍ PARA DETENER LA FUNCIÓN
            return res.status(204).json({
                msg: 'datos no encontrados',
                estado: 'vacio'
            });
        }

        // Si llega aquí, es porque hay datos y no entró al if anterior
        res.status(200).json({
            msg: 'datos encontrados',
            estado: 'ok',
            rows
        });

    } catch (error) {
        console.error('error en el servidor: ', error);
        res.status(500).json({
            msg: 'problemas con el servidor',
            estado: 'error' // Cambiado de 'ok' a 'error' por lógica
        });
    }
};

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

export const updateCuenta=async(req,res)=>{
    const {nombre_cuenta,cod_nombreCuenta,cod_empresa} = req.body
    
    
    try {
            const [result] = await pool.query('update nombre_cuenta set nombre_cuenta=? where cod_nombreCuenta =? and cod_nivelCuenta=5 and cod_empresa=?',[nombre_cuenta,cod_nombreCuenta,cod_empresa]);

            if (result.affectedRows===0) {
                res.status(202).json({
                    status:'vacio',
                    msg:'datos no encontrados no actualizados'
                })

            
            } 
                res.status(200).json({
                status:'ok',
                msg:'datos actualizados correctamente'
            })    
            

        
    } catch (error) {
        console.log('error en el servidor: ',error)
        res.status(500).json({
            status:'error',
            msg:'error en el servidor'
        })    
    }
}
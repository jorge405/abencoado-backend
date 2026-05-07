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
    
    const {gestion} = req.params
    
    const startDate = `${gestion}-01-01`;
    const endDate = `${gestion}-12-31`;
    try {
        
        const [rows] = await pool.query('Select cod_cotizacion,fecha,dolar,ufv from cotizaciones WHERE fecha BETWEEN ? AND ?',[startDate,endDate])
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

export const addConfiguracion = async (req, res) => {
    const { firmas } = req.body; // Se espera que 'firmas' sea un array: ["a", "b"]

    try {
        // Usamos JSON_MERGE_PRESERVE para combinar el array actual con el nuevo
        // CAST(? AS JSON) asegura que MySQL entienda que mandas un array y no un string
        const query = `
            UPDATE configuraciones 
            SET firmas = JSON_MERGE_PRESERVE(firmas, CAST(? AS JSON)) 
            WHERE cod_configuracion = 1
        `;

        // Importante: Convertir el array a string JSON para que el driver lo pase correctamente
        const [result] = await pool.query(query, [JSON.stringify(firmas)]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: 'vacio',
                msg: 'No se encontró la configuración'
            });
        }

        res.status(200).json({
            status: 'ok',
            msg: 'Elementos agregados exitosamente al array'
        });

    } catch (error) {
        console.log("Error en MySQL:", error);
        res.status(500).json({
            status: 'error',
            msg: 'Error al intentar agregar las firmas'
        });
    }
};

export const getConfiguracion= async(req,res)=>{

    try {
        
        const [rows]= await pool.query('select cod_configuracion,mostrarHora,mostrarFecha,firmas from configuraciones');
        if (rows.length===0) {
            res.status(202).json({
                status:'vacio',
                msg:'no se encontraron configuraciones',
            })
        }else if(rows.length>=1){
            res.status(200).json({ 
                status:'ok',
                msg:'configuraciones encontradas',
                rows
            })
        }
    } catch (error) {
        console.log('ha ocurrido un error en el servidor:',error)
        res.status(500).json({
            status:'error',
            msg:'error en el servidor,espere un momento'
        })
        
    }
}

export const updateConfiguracion = async (req, res) => {
    // Si un campo no llega en el body, lo tratamos como null para COALESCE
    const { mostrarHora = null, mostrarFecha = null } = req.body;

    try {
        // 1. Convertimos el array de firmas a una cadena JSON si existe
        //const firmasJson = firmas ? JSON.stringify(firmas) : null;

        // 2. Usamos COALESCE en la consulta SQL. 
        // Si el primer parámetro es NULL, tomará el valor actual de la columna.
        const query = `
            UPDATE configuraciones 
            SET mostrarHora = COALESCE(?, mostrarHora), 
                mostrarFecha = COALESCE(?, mostrarFecha) 
            WHERE cod_configuracion = 1
        `;

        const [result] = await pool.query(query, [mostrarHora, mostrarFecha]);

        if (result.affectedRows === 0) {
            return res.status(202).json({
                status: 'vacio',
                msg: 'No se encontró el registro o no hubo cambios necesarios'
            });
        }

        res.status(200).json({
            status: 'ok',
            msg: 'Datos actualizados correctamente'
        });

    } catch (error) {
        console.error("Error al actualizar:", error);
        res.status(500).json({
            status: 'error',
            msg: 'Error en el servidor'
        });
    }
};

export const deleteFirma = async (req, res) => {
    // Recibimos el índice del elemento a eliminar (ej: 0, 1, 2...)
    const { index } = req.body; 

    try {
        // Validamos que el índice sea un número
        if (typeof index !== 'number') {
            return res.status(400).json({ msg: 'Se requiere el índice numérico' });
        }

        // Construimos la ruta dinámicamente: $[0], $[1], etc.
        const path = `$[${index}]`;

        const query = `
            UPDATE configuraciones 
            SET firmas = JSON_REMOVE(firmas, ?) 
            WHERE cod_configuracion = 1
        `;

        const [result] = await pool.query(query, [path]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ msg: 'Configuración no encontrada',status:'vacio' });
        }

        res.status(200).json({
            status: 'ok',
            msg: `Elemento en el índice ${index} eliminado`
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'error', msg: 'Error al eliminar la firma' });
    }
};
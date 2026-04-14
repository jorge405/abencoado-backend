import {pool} from '../DB/connection.js'; 
import { generateToken } from '../utils/generateToken.js';
import jwt from 'jsonwebtoken';


export const getLibroMayorFechas= async (req,res)=>{
    const {fecha1,fecha2,cod_nivelCuenta,cod_empresa}= req.body
    try {
        const [rows] = await pool.query('select * from vistalibroMayor where (fecha_comprobante between ? and ?) and cod_nivelCuenta=? and cod_empresa=? ',[fecha1,fecha2,cod_nivelCuenta,cod_empresa]);

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

export const getLibroMayor= async(req,res)=>{
    const {fecha1,fecha2,cod_empresa,cod_nombreCuenta} = req.body;

    try {
        const [rows] = await pool.query("select * from vistalibromayorfecha where cod_nivelCuenta=5 and cod_nombreCuenta=? and (fecha_comprobante between ? and ?) and cod_empresa=?",[cod_nombreCuenta,fecha1,fecha2,cod_empresa])
        if (rows.length===0) {
            res.status(202).json({
                status:'vacio',
                msg:'datos no encontrados'
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
        console.log('ha ocurrido un error: ',error);
        res.status(500).json({
            status:'error',
            msg:'error en el servidor'
        })        
    }
}

export const getLibroMayorOne= async(req,res)=>{

const {cod_empresa,cod_comprobante}= req.body
    try {
        const [rows] = await pool.query('select * from libromayorOne where cod_empresa=? and cod_comprobante=?',[cod_empresa,cod_comprobante]);

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
            msg:'ha ocurrido un error en el servidor',
            
        })
    }    

}

export const saldosMensuales = async(req, res) => {
    const { cod_empresa, cod_nombreCuenta, cod_nivelCuenta } = req.body;
    
    try {
        const query = `
            SELECT * FROM v_reporte_mensual_completo 
            WHERE cod_empresa = ? 
              AND cod_nombreCuenta = ? 
              AND cod_nivelCuenta = ?
            ORDER BY periodo_mes ASC`;

        const [rows] = await pool.query(query, [
            Number(cod_empresa), 
            Number(cod_nombreCuenta), 
            Number(cod_nivelCuenta)
        ]);

        

        if (rows.length > 0) {
            res.json({ status: 'ok',msg:'reporte generado exitosamente', rows: rows });
        } else {
            res.json({ status: 'vacio',msg:'datos no encontrados', rows: [] });
        }
    } catch (error) {
        console.error("Error en reporte mensual:", error);
        res.status(500).json({ status: 'error', message: "Error al obtener saldos mensuales" });
    }
}

export const sumasYsaldos=async(req,res)=>{
    const {cod_empresa}= req.body

    try {
        const [rows]= await pool.query('SELECT * FROM vista_sumas_saldos_nivel5_empresa WHERE cod_empresa = ?',[cod_empresa]);
        if (rows.length===0) {
            res.status(202).json({
                status:'vacio',
                msg:'datos no encontrados'

            })
        }else if(rows.length>0){
            res.status(200).json({
                status:'ok',
                msg:'reporte generado exitosamente',
                rows:rows
            })
        }
    } catch (error) {
        console.log('ha ocurrido un error: ',error);
        res.status(500).json({
            status:'error',
            msg:'error en el servidor'
        })
    }
}


export const estadoResultados=async(req,res)=>{
    const {cod_empresa,fecha_inicio,fecha_final}= req.body;

    try {
        const [rows]= await pool.query(`SELECT puct, SUM(monto_neto) as monto_neto FROM vista_movimientos_estado_resultados WHERE cod_empresa = ? AND fecha_comprobante BETWEEN ? AND ?
             GROUP BY puct`,[cod_empresa,fecha_inicio,fecha_final]);
        if (rows.length===0) {
            res.status(202).json({
                status:'vacio',
                msg:'datos no encontrados'
            })
        }else if(rows.length>0){
            const [catalogo]= await pool.query("select puct ,nombre_cuenta,cod_nivelCuenta from nombre_cuenta where cod_empresa= ? and (puct LIKE '4%' OR puct LIKE '5%')",[cod_empresa]);
            // mapa para acumular montos :{"111001001:0"}
            const acumulador={};
            // Inicializar el mapa con todas las cuentas del catálogo en 0
                catalogo.forEach(cta => {
                acumulador[cta.puct] = 0;
                });
            // 3. ALGORITMO DE PROPAGACIÓN HACIA ARRIBA
            rows.forEach(mov => {
                const codigo = mov.puct;
                const monto = parseFloat(mov.monto_neto);

                // Definimos los cortes de tu jerarquía: 1, 2, 3, 6, 9 dígitos
                const niveles = [1, 2, 3, 6, 9];

                niveles.forEach(longitud => {
                    const padreId = codigo.substring(0, longitud);
                    // Si el padre existe en nuestro catálogo, le sumamos el monto
                    if (acumulador.hasOwnProperty(padreId)) {
                        acumulador[padreId] += monto;
                    }
                });
            });
            // 4. ESTRUCTURAR RESPUESTA FINAL
                const reporteFinal = catalogo.map(cta => ({
                    puct: cta.puct,
                    nombre: cta.nombre_cuenta,
                    nivel: cta.cod_nivelCuenta,
                    monto: acumulador[cta.puct].toFixed(2)
                })).sort((a, b) => a.puct.localeCompare(b.puct));

                // 5. CALCULAR UTILIDAD (Suma de Clase 4 y Clase 5)
                const ingresosTotales = acumulador['4'] || 0;
                const gastosTotales = acumulador['5'] || 0;
                const utilidadNeta = ingresosTotales + gastosTotales;

                res.status(200).json({
                    status:'ok',
                    msg:'reporte generado exitosamente',
                    detalles: reporteFinal,
                    totales: {
                        ingresos: ingresosTotales.toFixed(2),
                        gastos: gastosTotales.toFixed(2),
                        utilidad: utilidadNeta.toFixed(2)
                    }
                });    
        }
    } catch (error) {
        console.log('ha ocurrido un error: ',error);
        res.status(500).json({
            status:'error',
            msg:'error en el servidor'
        })
    }
}

export const obtenerBalanceGeneral= async(req,res)=>{
    const {cod_empresa,fecha_final}= req.body;
    try {
        // 1. Obtener saldos reales de nivel 5 desde la vista
        const [movimientos] = await pool.query(
            `SELECT puct, SUM(monto_neto) as monto_neto FROM vista_movimientos_balance_general WHERE cod_empresa = ? AND fecha_comprobante <= ? GROUP BY puct`, 
            [cod_empresa,fecha_final]
        );

        // 2. Obtener el catálogo completo para la estructura (Niveles 1 al 4)
        const [catalogo] = await pool.query(
            "SELECT puct, nombre_cuenta, cod_nivelCuenta FROM nombre_cuenta WHERE cod_empresa = ? AND (puct LIKE '1%' OR puct LIKE '2%' OR puct LIKE '3%')",
            [cod_empresa]
        );

        // 3. Calcular la Utilidad del Periodo (Ingresos - Gastos)
        // La utilidad es el "puente" para que el Activo sea igual al Pasivo + Patrimonio
        const [[resUtilidad]] = await pool.query(
            "SELECT SUM(monto_neto) as utilidad FROM vista_movimientos_estado_resultados WHERE cod_empresa = ? AND fecha_comprobante <= ?",
            [cod_empresa,fecha_final]
        );
        const utilidadGestion = parseFloat(resUtilidad.utilidad || 0);

        // Mapa de acumulación
        const acumulador = {};
        catalogo.forEach(cta => acumulador[cta.puct] = 0);

        // 4. ALGORITMO DE PROPAGACIÓN (Suma de abajo hacia arriba)
        movimientos.forEach(mov => {
            const codigo = mov.puct;
            const monto = parseFloat(mov.monto_neto);
            const niveles = [1, 2, 3, 6, 9];

            niveles.forEach(longitud => {
                const padreId = codigo.substring(0, longitud);
                if (acumulador.hasOwnProperty(padreId)) {
                    acumulador[padreId] += monto;
                }
            });
        });

        // 5. ESTRUCTURAR LA RESPUESTA
        const reporteFinal = catalogo.map(cta => ({
            puct: cta.puct,
            nombre: cta.nombre_cuenta,
            nivel: cta.cod_nivelCuenta,
            monto: acumulador[cta.puct].toFixed(2)
        })).sort((a, b) => a.puct.localeCompare(b.puct));

        // Totales finales para los cuadros de resumen
        const totalActivo = acumulador['1'] || 0;
        const totalPasivo = acumulador['2'] || 0;
        const totalPatrimonioBase = acumulador['3'] || 0;
        const totalPasivoMasPatrimonio = totalPasivo + totalPatrimonioBase + utilidadGestion;

        res.json({
            status: reporteFinal.length > 0 ? 'ok' : 'vacio',
            detalles: reporteFinal,
            totales: {
                activo: totalActivo.toFixed(2),
                pasivo: totalPasivo.toFixed(2),
                patrimonio: totalPatrimonioBase.toFixed(2),
                utilidad_ejercicio: utilidadGestion.toFixed(2), // Se muestra aparte para informar el cuadre
                total_p_p: totalPasivoMasPatrimonio.toFixed(2),
                diferencia: (totalActivo - totalPasivoMasPatrimonio).toFixed(2) // Debe ser 0.00
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al generar el Balance General' });
    }
}
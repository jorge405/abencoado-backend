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

export const sumasYsaldos = async (req, res) => {
    const { cod_empresa, fecha_inicio, fecha_final } = req.body;

    try {
        // Usamos un query dinámico para filtrar por el rango de fechas
        const query = `
            SELECT cod_empresa, codigo_cuenta, nombre_cuenta, 
                SUM(total_debe) as total_debe, 
                SUM(total_haber) as total_haber, 
                (SUM(total_debe) - SUM(total_haber)) as saldo FROM vista_sumas_saldos_nivel5_empresa 
            WHERE cod_empresa = ? AND fecha BETWEEN ? AND ? GROUP BY codigo_cuenta, nombre_cuenta `;

        const [rows] = await pool.query(query, [cod_empresa, fecha_inicio, fecha_final]);

        if (rows.length === 0) {
            return res.status(202).json({
                status: 'vacio',
                msg: 'No se encontraron datos en el rango de fechas seleccionado'
            });
        }

        res.status(200).json({
            status: 'ok',
            msg: 'Reporte generado exitosamente',
            rows: rows
        });

    } catch (error) {
        console.log('Error en Sumas y Saldos:', error);
        res.status(500).json({
            status: 'error',
            msg: 'Error interno del servidor'
        });
    }
};

export const estadoResultados = async (req, res) => {
    // Recibimos nivel_maximo (ej: 3) desde el body
    const { cod_empresa, fecha_inicio, fecha_final, nivel_maximo } = req.body;

    try {
        // 1. Obtenemos los movimientos (siempre a nivel de detalle)
        const [rows] = await pool.query(`
            SELECT puct, SUM(monto_neto) as monto_neto 
            FROM vista_movimientos_estado_resultados 
            WHERE cod_empresa = ? AND fecha_comprobante BETWEEN ? AND ?
            GROUP BY puct`, [cod_empresa, fecha_inicio, fecha_final]);

        if (rows.length === 0) {
            return res.status(202).json({ status: 'vacio', msg: 'datos no encontrados' });
        }

        // 2. Obtenemos TODO el catálogo de ingresos y gastos
        const [catalogo] = await pool.query(`
            SELECT puct, nombre_cuenta, cod_nivelCuenta 
            FROM nombre_cuenta 
            WHERE cod_empresa = ? AND (puct LIKE '4%' OR puct LIKE '5%')
        `, [cod_empresa]);

        const acumulador = {};
        catalogo.forEach(cta => { acumulador[cta.puct] = 0; });

        // 3. ALGORITMO DE PROPAGACIÓN (Se mantiene igual para no perder precisión)
        rows.forEach(mov => {
            const codigo = mov.puct;
            const monto = parseFloat(mov.monto_neto);
            const niveles = [1, 2, 3, 6, 9]; // Longitudes de caracteres

            niveles.forEach(longitud => {
                const padreId = codigo.substring(0, longitud);
                if (acumulador.hasOwnProperty(padreId)) {
                    acumulador[padreId] += monto;
                }
            });
        });

        // 4. ESTRUCTURAR Y FILTRAR POR NIVEL
        // Aquí está el cambio: filtramos el catálogo antes de mapear
        const reporteFinal = catalogo
            .filter(cta => {
                // Si el usuario no envía nivel_maximo, mostramos todos.
                // Si lo envía, solo mostramos los que son menores o iguales al nivel pedido.
                return !nivel_maximo || cta.cod_nivelCuenta <= nivel_maximo;
            })
            .map(cta => ({
                puct: cta.puct,
                nombre: cta.nombre_cuenta,
                nivel: cta.cod_nivelCuenta,
                monto: acumulador[cta.puct].toFixed(2)
            }))
            .sort((a, b) => a.puct.localeCompare(b.puct));

        // 5. TOTALES (Siempre se calculan sobre el total real, no el filtrado)
        const ingresosTotales = acumulador['4'] || 0;
        const gastosTotales = acumulador['5'] || 0;
        const utilidadNeta = ingresosTotales + gastosTotales;

        res.status(200).json({
            status: 'ok',
            msg: `Reporte generado hasta nivel ${nivel_maximo || 'máximo'}`,
            detalles: reporteFinal,
            totales: {
                ingresos: ingresosTotales.toFixed(2),
                gastos: gastosTotales.toFixed(2),
                utilidad: utilidadNeta.toFixed(2)
            }
        });
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ status: 'error', msg: 'error en el servidor' });
    }
};

export const obtenerBalanceGeneral = async (req, res) => {
    // Recibimos nivel_maximo desde el body
    const { cod_empresa, fecha_final, nivel_maximo } = req.body;

    try {
        // 1. Obtener saldos reales de nivel 5 (Detalle)
        const [movimientos] = await pool.query(
            `SELECT puct, SUM(monto_neto) as monto_neto 
             FROM vista_movimientos_balance_general 
             WHERE cod_empresa = ? AND fecha_comprobante <= ? 
             GROUP BY puct`, 
            [cod_empresa, fecha_final]
        );

        // 2. Obtener catálogo (Activo, Pasivo, Patrimonio)
        const [catalogo] = await pool.query(
            `SELECT puct, nombre_cuenta, cod_nivelCuenta 
             FROM nombre_cuenta 
             WHERE cod_empresa = ? AND (puct LIKE '1%' OR puct LIKE '2%' OR puct LIKE '3%')`,
            [cod_empresa]
        );

        // 3. Calcular Utilidad del Periodo (Necesaria para el cuadre)
        const [[resUtilidad]] = await pool.query(
            "SELECT SUM(monto_neto) as utilidad FROM vista_movimientos_estado_resultados WHERE cod_empresa = ? AND fecha_comprobante <= ?",
            [cod_empresa, fecha_final]
        );
        const utilidadGestion = parseFloat(resUtilidad.utilidad || 0);

        // Mapa de acumulación
        const acumulador = {};
        catalogo.forEach(cta => acumulador[cta.puct] = 0);

        // 4. ALGORITMO DE PROPAGACIÓN
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

        // 5. FILTRADO POR NIVEL Y ESTRUCTURACIÓN
        let reporteFinal = catalogo
            .filter(cta => !nivel_maximo || cta.cod_nivelCuenta <= nivel_maximo)
            .map(cta => ({
                puct: cta.puct,
                nombre: cta.nombre_cuenta,
                nivel: cta.cod_nivelCuenta,
                monto: acumulador[cta.puct].toFixed(2)
            }));

        // Opcional: Inyectar la fila de Utilidad dentro del detalle si se pide nivel de patrimonio
        if (nivel_maximo >= 2 || !nivel_maximo) {
            reporteFinal.push({
                puct: '3.9.9', // Un código ficticio para que aparezca al final del patrimonio
                nombre: 'UTILIDAD DE LA GESTIÓN',
                nivel: 3,
                monto: utilidadGestion.toFixed(2)
            });
        }

        reporteFinal.sort((a, b) => a.puct.localeCompare(b.puct));

        // Totales de control (Siempre nivel raíz 1, 2, 3)
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
                patrimonio: (totalPatrimonioBase + utilidadGestion).toFixed(2),
                utilidad_ejercicio: utilidadGestion.toFixed(2),
                total_p_p: totalPasivoMasPatrimonio.toFixed(2),
                diferencia: (totalActivo - totalPasivoMasPatrimonio).toFixed(2)
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al generar el Balance General' });
    }
};
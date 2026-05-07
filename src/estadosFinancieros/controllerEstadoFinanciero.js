import {pool} from '../DB/connection.js'; 
import { generateToken } from '../utils/generateToken.js';
import jwt from 'jsonwebtoken';



export const evolucionPatrimonio = async (req, res) => {
    const { cod_empresa, fecha_inicio, fecha_final } = req.body;

    try {
        const [rows] = await pool.query(`
            SELECT 
                puct, 
                nombre_cuenta, 
                SUM(CASE WHEN fecha_comprobante < ? THEN monto_neto ELSE 0 END) as monto_inicio,
                SUM(CASE WHEN fecha_comprobante BETWEEN ? AND ? THEN monto_neto ELSE 0 END) as monto_periodo 
            FROM vista_movimientos_patrimonio 
            WHERE cod_empresa = ? AND cod_nivelCuenta = 5
            GROUP BY puct, nombre_cuenta
            HAVING monto_inicio != 0 OR monto_periodo != 0
        `, [fecha_inicio, fecha_inicio, fecha_final, cod_empresa]);

        if (rows.length === 0) {
            return res.status(202).json({ status: 'vacio', msg: 'Sin datos de patrimonio' });
        }

        let totalInicioGlobal = 0;
        let totalGestionGlobal = 0;

        const detalles = rows.map(item => {
            const inicio = parseFloat(item.monto_inicio);
            const periodo = parseFloat(item.monto_periodo);
            
            totalInicioGlobal += inicio;
            totalGestionGlobal += periodo;

            return {
                puct: item.puct,
                nombre: item.nombre_cuenta,
                monto_inicio: inicio.toFixed(2), // Fila 1 de tu tabla
                monto: periodo.toFixed(2)        // Fila de Gestión de tu tabla
            };
        });

        res.status(200).json({
            status: 'ok',
            detalles: detalles.sort((a, b) => a.puct.localeCompare(b.puct)),
            totales_horizontales: {
                total_inicio: totalInicioGlobal.toFixed(2),
                total_gestion: totalGestionGlobal.toFixed(2),
                total_final: (totalInicioGlobal + totalGestionGlobal).toFixed(2)
            }
        });

    } catch (error) {
        res.status(500).json({ status: 'error', msg: 'Error en servidor' });
    }
};

import {createPool} from 'mysql2/promise.js';


export const pool = createPool({
    host:process.env.host || 'localhost',
    user:process.env.user || 'root',
    password:process.env.password ||'jorge1234',
    database: process.env.database || 'db_abencoado', 
})

pool.on('connection',(connection)=>{
    console.log('conexion a la base de datos establecida')
    connection.on('error',(err)=>{
        console.log('error en la conexion a la base de datos', err)
    })
})
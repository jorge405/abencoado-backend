import fs from 'fs';
// Prueba manual inmediata
fs.appendFileSync('test.txt', `Intento de inicio: ${new Date().toISOString()}\n`);

import path from 'path';
import { fileURLToPath } from 'url';
import app from './src/app.js';

// Configuración para obtener la ruta en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear el archivo de logs en la raíz de tu proyecto en cPanel
const logPath = path.join(__dirname, 'node_error.log');
const accessLogStream = fs.createWriteStream(logPath, { flags: 'a' });

// Redirigir errores de la consola al archivo
process.stderr.write = accessLogStream.write.bind(accessLogStream);

// Capturar errores críticos que normalmente tumbarían la app
process.on('uncaughtException', (err) => {
    const message = `[${new Date().toLocaleString()}] CRITICAL ERROR: ${err.stack}\n`;
    accessLogStream.write(message);
    console.error(message); // También lo verás en el log de cPanel si existe
});

process.on('unhandledRejection', (reason, promise) => {
    const message = `[${new Date().toLocaleString()}] UNHANDLED REJECTION: ${reason}\n`;
    accessLogStream.write(message);
});



const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor abencoado corriendo ${PORT}`);
});

console.log('Servidor abencoado cargando...');
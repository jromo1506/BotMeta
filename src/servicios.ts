import { addKeyword } from '@builderbot/bot'
import axios from 'axios';

const PORT = process.env.PORT ?? 3008
const MONGO_DB_URI = 'mongodb+srv://jrrdl1506mx:1234@cluster0.5mhti9d.mongodb.net/Calendar';
const MONGO_DB_NAME = 'Calendar';
const TOKEN_ACCESS = 'EAAXvbvB8HmkBOxkqCLu3ZAHpreJAwu45k9g0kLi8o9qKrSkOzKxD7CZC7R5KDsDJo8JNcUH4xmr6bKfHyJBcJYIakb5Eb0MDDTZBmklVXXFBUI4B8FQId1H2Kt27T4PIexXLXV5AnUJBEQ2xuZA84ZAZA1IQhZBZBlrSZC7LDruJMLKo0OM8xqAdYBvnRo7UofhVgU3Jci7zDXTzajZAhV5eOA2L22VqUZD';

// Mapa para almacenar sesiones de usuarios
const sesiones = new Map();



export const flowServicios = addKeyword('Servicios')
    .addAnswer('🦷 *¡Bienvenido a nuestros servicios!*\n' +
        'En *Dental Clinic Boutique By Dr. Arce*, ofrecemos los mejores tratamientos dentales. 😊')
    .addAnswer([
        '🦷 *1. Odontología general*: Cuida tu salud dental con los mejores profesionales. ',
        '💎 *2. Rehabilitación y estética dental*: Recupérate y mejora tu sonrisa. 😁✨',
        '🔍 *3. Especialidades*: Ortodoncia, Endodoncia, Periodoncia, y más. 🔬',
        '\n🔙 *Escribe "inicio"* para regresar al menú principal.',
    ]);
import { addKeyword } from '@builderbot/bot'
import axios from 'axios';

const PORT = process.env.PORT ?? 3008
const MONGO_DB_URI = 'mongodb+srv://jrrdl1506mx:1234@cluster0.5mhti9d.mongodb.net/Calendar';
const MONGO_DB_NAME = 'Calendar';
const TOKEN_ACCESS = 'EAAXvbvB8HmkBOxkqCLu3ZAHpreJAwu45k9g0kLi8o9qKrSkOzKxD7CZC7R5KDsDJo8JNcUH4xmr6bKfHyJBcJYIakb5Eb0MDDTZBmklVXXFBUI4B8FQId1H2Kt27T4PIexXLXV5AnUJBEQ2xuZA84ZAZA1IQhZBZBlrSZC7LDruJMLKo0OM8xqAdYBvnRo7UofhVgU3Jci7zDXTzajZAhV5eOA2L22VqUZD';

// Mapa para almacenar sesiones de usuarios
const sesiones = new Map();


export const flowContacto = addKeyword('Ubicación')
    .addAnswer('📍 Estamos ubicados en Torre Médica San Telmo, Piso 6, Consultorio 617 y 618, Aguascalientes, México.')
    .addAnswer([
        'Prol. Gral. Ignacio Zaragoza #1004 Col. Calicantos II, Cp. 20116.',
        'Google Maps: https://maps.app.goo.gl/PRsf7HVZvcjy9J2r9',
    ]).addAnswer(
        'Para volver al menu principal selecciona el boton',
        { buttons: [{ body: 'Volver al inicio 🏠' }] }, // Botón para regresar al inicio
        // async (ctx, { gotoFlow }) => {
        //     if (ctx.body === 'Volver al inicio 🏠') {
        //         return gotoFlow(welcomeFlow); // Redirige al flujo de bienvenida
        //     }
        // }
    );
import { addKeyword } from '@builderbot/bot'
import axios from 'axios';

const PORT = process.env.PORT ?? 3008
const MONGO_DB_URI = 'mongodb+srv://jrrdl1506mx:1234@cluster0.5mhti9d.mongodb.net/Calendar';
const MONGO_DB_NAME = 'Calendar';
const TOKEN_ACCESS = 'EAAXvbvB8HmkBOxkqCLu3ZAHpreJAwu45k9g0kLi8o9qKrSkOzKxD7CZC7R5KDsDJo8JNcUH4xmr6bKfHyJBcJYIakb5Eb0MDDTZBmklVXXFBUI4B8FQId1H2Kt27T4PIexXLXV5AnUJBEQ2xuZA84ZAZA1IQhZBZBlrSZC7LDruJMLKo0OM8xqAdYBvnRo7UofhVgU3Jci7zDXTzajZAhV5eOA2L22VqUZD';

// Mapa para almacenar sesiones de usuarios
const sesiones = new Map();


export const flowMensaje = addKeyword('Mensaje')
    .addAnswer('Espera un momento. . .', null, async (ctx, { flowDynamic }) => {
        const idUsuario = ctx.from;
        const telefonoUsuario = ctx.from; // Este campo contiene el número de WhatsApp del usuario.

        // Verifica si el usuario está registrado
        try {
            const response = await axios.get(`http://localhost:5000/DentalArce/buscarPacientePorTelefono/${telefonoUsuario}`);
            const paciente = response.data;

            if (paciente && paciente.nombre) {
                console.log(`Información recuperada del usuario (${idUsuario}):`, paciente);

                // Almacena la información del usuario en la sesión
                if (!sesiones.has(idUsuario)) {
                    sesiones.set(idUsuario, {});
                }
                const datosUsuario = sesiones.get(idUsuario);
                datosUsuario.idPaciente = paciente._id; // Asegúrate de que `_id` es el identificador del paciente
                datosUsuario.nombre = paciente.nombre;

                await flowDynamic(`Estamos a tu servicio, ${paciente.nombre}.`);
            } else {
                // Mensaje si el usuario no está registrado
                await flowDynamic([
                    'No encontré tu información en nuestro sistema.',
                    '¿Te gustaría registrarte para agendar una cita? 😊'
                ]);
            }
        } catch (error) {
            console.error('Error al verificar el número de teléfono:', error);
            await flowDynamic('Estoy aquí para ayudarte. Por favor, escribe la palabra clave según lo que necesites: \n 1️⃣ Escribe "ser" para ver nuestros Servicios disponibles 🦷. \n 2️⃣ Escribe "doc" para Agendar una consulta. 📅 \n 3️⃣ Escribe "con" para conocer nuestra Ubicación y contacto. 📍');
        }
    })
    .addAnswer('Por favor, escribe tu mensaje:', { capture: true }, async (ctx, { flowDynamic }) => {
        const idUsuario = ctx.from;

        // Recupera los datos del usuario desde la sesión
        const datosUsuario = sesiones.get(idUsuario);

        if (!datosUsuario || !datosUsuario.idPaciente) {
            console.error('No se encontró información del usuario en la sesión.');
            return await flowDynamic('Parece que no tenemos tus datos registrados. Por favor, vuelve a intentarlo o contáctanos directamente.');
        }

        const mensajeUsuario = ctx.body.trim(); // Captura el mensaje del usuario
        console.log(`Mensaje del usuario (${idUsuario}): ${mensajeUsuario}`); // Imprime el mensaje en la consola

        try {
            const response = await axios.post('http://localhost:5000/DentalArce/addMensaje', {
                idPaciente: datosUsuario.idPaciente,
                nombrePaciente: datosUsuario.nombre,
                telefono: idUsuario,
                mensaje: mensajeUsuario,
                estado: 'noleido',
                fecha: new Date().toISOString(), // Fecha actual
            });
            console.log('Respuesta del servidor para el mensaje:', response.data);
            await flowDynamic('✅ Tu mensaje ha sido enviado exitosamente. Nos pondremos en contacto contigo pronto.');
        } catch (error) {
            console.error('Error al enviar el mensaje:', error);
            await flowDynamic('❌ Hubo un error al enviar tu mensaje. Por favor, inténtalo más tarde.');
        }
    });


export const flowMensajeUrgente = addKeyword('Urgente')
    .addAnswer('Espera un momento. . .', null, async (ctx, { flowDynamic }) => {
        const idUsuario = ctx.from;
        const telefonoUsuario = ctx.from; // Este campo contiene el número de WhatsApp del usuario.

        // Verifica si el usuario está registrado
        try {
            const response = await axios.get(`http://localhost:5000/DentalArce/buscarPacientePorTelefono/${telefonoUsuario}`);
            const paciente = response.data;

            if (paciente && paciente.nombre) {
                console.log(`Información recuperada del usuario (${idUsuario}):`, paciente);

                // Almacena la información del usuario en la sesión
                if (!sesiones.has(idUsuario)) {
                    sesiones.set(idUsuario, {});
                }
                const datosUsuario = sesiones.get(idUsuario);
                datosUsuario.idPaciente = paciente._id; // Asegúrate de que `_id` es el identificador del paciente
                datosUsuario.nombre = paciente.nombre;

                await flowDynamic(`Estamos a tu servicio, ${paciente.nombre}.`);
            } else {
                // Mensaje si el usuario no está registrado
                await flowDynamic([
                    'No encontré tu información en nuestro sistema.',
                    '¿Te gustaría registrarte para agendar una cita? 😊'
                ]);
            }
        } catch (error) {
            console.error('Error al verificar el número de teléfono:', error);
            await flowDynamic('Estoy aquí para ayudarte. Por favor, escribe la palabra clave según lo que necesites: \n 1️⃣ Escribe "ser" para ver nuestros Servicios disponibles 🦷. \n 2️⃣ Escribe "doc" para Agendar una consulta. 📅 \n 3️⃣ Escribe "con" para conocer nuestra Ubicación y contacto. 📍');
        }
    })
    .addAnswer('Por favor, escribe tu mensaje urgente:', { capture: true }, async (ctx, { flowDynamic }) => {
        const idUsuario = ctx.from;

        // Recupera los datos del usuario desde la sesión
        const datosUsuario = sesiones.get(idUsuario);

        if (!datosUsuario || !datosUsuario.idPaciente) {
            console.error('No se encontró información del usuario en la sesión.');
            return await flowDynamic('Parece que no tenemos tus datos registrados. Por favor, vuelve a intentarlo o contáctanos directamente.');
        }

        const mensajeUsuario = ctx.body.trim(); // Captura el mensaje del usuario
        console.log(`Mensaje del usuario (${idUsuario}): ${mensajeUsuario}`); // Imprime el mensaje en la consola

        try {
            const response = await axios.post('http://localhost:5000/DentalArce/addMensaje', {
                idPaciente: datosUsuario.idPaciente,
                nombrePaciente: datosUsuario.nombre,
                telefono: idUsuario,
                mensaje: mensajeUsuario,
                estado: 'urgente',
                fecha: new Date().toISOString(), // Fecha actual
            });
            console.log('Respuesta del servidor para el mensaje:', response.data);
            await flowDynamic('✅ Tu mensaje ha sido enviado exitosamente. Nos pondremos en contacto contigo pronto.');
        } catch (error) {
            console.error('Error al enviar el mensaje:', error);
            await flowDynamic('❌ Hubo un error al enviar tu mensaje. Por favor, inténtalo más tarde.');
        }
    });


export const flowNoAgendar = addKeyword(['No agendar cita'])
    .addAnswer('😞 Entendemos que no deseas agendar una cita en este momento.')
    .addAnswer('Si cambias de opinión, no dudes en contactarnos nuevamente. ¡Estaremos aquí para ayudarte! 😊')
    .addAnswer(['Ingrese "inicio" para regresar al menú principal.']);


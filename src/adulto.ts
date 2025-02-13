
import { addKeyword } from '@builderbot/bot'
import axios from 'axios';

const PORT = process.env.PORT ?? 3008
const MONGO_DB_URI = 'mongodb+srv://jrrdl1506mx:1234@cluster0.5mhti9d.mongodb.net/Calendar';
const MONGO_DB_NAME = 'Calendar';
const TOKEN_ACCESS = 'EAAXvbvB8HmkBOxkqCLu3ZAHpreJAwu45k9g0kLi8o9qKrSkOzKxD7CZC7R5KDsDJo8JNcUH4xmr6bKfHyJBcJYIakb5Eb0MDDTZBmklVXXFBUI4B8FQId1H2Kt27T4PIexXLXV5AnUJBEQ2xuZA84ZAZA1IQhZBZBlrSZC7LDruJMLKo0OM8xqAdYBvnRo7UofhVgU3Jci7zDXTzajZAhV5eOA2L22VqUZD';

// Mapa para almacenar sesiones de usuarios
const sesiones = new Map();

export const flowAgendarCitaMayor = addKeyword('Paciente mayor')
    .addAnswer('¡Bienvenido! Nos puede compartir la siguiente información para poder abrir su expediente clínico y reservar un espacio en nuestra agenda. 😊\n\n👤 ¿Cuál es el apellido paterno del paciente?',
        { capture: true }, async (ctx, { fallBack, gotoFlow }) => {
            const idUsuario = ctx.from;

            if (!sesiones.has(idUsuario)) {
                sesiones.set(idUsuario, {});
            }

            const datosUsuario = sesiones.get(idUsuario);
            console.log(datosUsuario);

            datosUsuario.apellidoPaterno = ctx.body.trim();
            console.log(`Apellido registrado (${idUsuario}): ${datosUsuario.apellidoPaterno}`);

            if (!datosUsuario.apellidoPaterno) {
                return fallBack('❌ Por favor, ingresa un apellido paterno válido.');
            } else {
                return gotoFlow(flowApellidoMaterno); // Avanza al siguiente paso
            }
        });

export const flowApellidoMaterno = addKeyword('APELLIDO_MATERNO')
    .addAnswer('¿Apellido materno del paciente? 👤',
        { capture: true }, async (ctx, { fallBack, gotoFlow }) => {
            const idUsuario = ctx.from;

            const datosUsuario = sesiones.get(idUsuario);
            datosUsuario.apellidoMaterno = ctx.body.trim();
            console.log(`Apellido Materno (${idUsuario}): ${datosUsuario.apellidoMaterno}`);

            if (!datosUsuario.apellidoMaterno) {
                return fallBack('❌ Por favor, ingresa un apellido materno válido.');
            } else {
                return gotoFlow(flowNombrePaciente); // Avanza al siguiente paso
            }
        });

export const flowNombrePaciente = addKeyword('NOMBRE_PACIENTE')
    .addAnswer('¿Nombre del paciente? 👤',
        { capture: true }, async (ctx, { fallBack, gotoFlow }) => {
            const idUsuario = ctx.from;
            const datosUsuario = sesiones.get(idUsuario);
            datosUsuario.nombre = ctx.body.trim();
            console.log(`Nombre (${idUsuario}): ${datosUsuario.nombre}`);

            if (!datosUsuario.nombre) {
                return fallBack('❌ Por favor, ingresa un nombre válido.');
            } else {
                return gotoFlow(flowGeneroPaciente); // Avanza al siguiente paso
            }
        });

export const flowGeneroPaciente = addKeyword('GENERO_PACIENTE')
    .addAnswer('¿Cuál es el género del paciente?🚻', null, async (ctx, { flowDynamic }) => {
        await flowDynamic([
            {
                body: 'Selecciona una opción:🔘',
                buttons: [
                    { body: 'Masculino 👨' },
                    { body: 'Femenino 👩' }
                ]
            }
        ]);
    })
    .addAnswer(
        '',
        { capture: true },
        async (ctx, { fallBack, gotoFlow }) => {
            const idUsuario = ctx.from;
            const datosUsuario = sesiones.get(idUsuario);
            const generoSeleccionado = ctx.body.trim().toLowerCase();

            if (generoSeleccionado !== 'masculino' && generoSeleccionado !== 'femenino') {
                return fallBack('❌ Opción inválida. Por favor, selecciona "Masculino 👨" o "Femenino 👩".');
            }

            datosUsuario.genero = generoSeleccionado;
            console.log(`✔ Género (${idUsuario}): ${datosUsuario.genero}`);

            return gotoFlow(flowReferido); // Avanza al siguiente flujo
        }
    );

export const flowReferido = addKeyword(['Masculino', 'Femenino'])
    .addAnswer(
        '👥 ¿Fue referido por alguno de nuestros pacientes? Si es así, por favor indica su nombre. Si no, simplemente escribe "no".',
        { capture: true },
        async (ctx, { fallBack, gotoFlow }) => {
            const idUsuario = ctx.from;

            // ✅ Asegurar que la sesión del usuario existe
            if (!sesiones.has(idUsuario)) {
                sesiones.set(idUsuario, {}); // Se inicializa un objeto vacío si no existe
            }

            const datosUsuario = sesiones.get(idUsuario);
            datosUsuario.nombreReferido = ctx.body.trim();
            console.log(`✔ Nombre referido (${idUsuario}): ${datosUsuario.nombreReferido}`);

            if (!datosUsuario.nombreReferido) {
                return fallBack('❌ Por favor, ingresa un nombre válido o escribe "no".');
            } else {
                return gotoFlow(flowFechaNacimiento); // Avanza al siguiente flujo
            }
        }
    );


export const flowFechaNacimiento = addKeyword('FECHA_NACIMIENTO_PACIENTE')
    .addAnswer('¿Cuál es su fecha de nacimiento? (Formato: YYYY-MM-DD) 🗓️',
        { capture: true }, async (ctx, { fallBack, gotoFlow }) => {
            const idUsuario = ctx.from;
            const datosUsuario = sesiones.get(idUsuario);
            datosUsuario.fechaNac = ctx.body.trim();
            console.log(`Fecha de Nacimiento (${idUsuario}): ${datosUsuario.fechaNac}`);

            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(datosUsuario.fechaNac)) {
                return fallBack('❌ Por favor, ingresa una fecha válida en el formato YYYY-MM-DD.');
            } else {
                return gotoFlow(flowCorreoElectronico); // Avanza al siguiente paso
            }
        });

export const flowCorreoElectronico = addKeyword('CORREO_PACIENTE')
    .addAnswer('Por favor, indícanos tu correo electrónico: 📧 ',
        { capture: true }, async (ctx, { fallBack, gotoFlow }) => {
            const idUsuario = ctx.from;
            const datosUsuario = sesiones.get(idUsuario);
            datosUsuario.correoElectronico = ctx.body.trim();
            console.log(`Correo Electrónico (${idUsuario}): ${datosUsuario.correoElectronico}`);

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(datosUsuario.correoElectronico)) {
                return fallBack('❌ Por favor, ingresa un correo electrónico válido.');
            } else {
                return gotoFlow(flowApodo); // Avanza al siguiente paso
            }
        });

export const flowApodo = addKeyword('APODO_PACIENTE')
    .addAnswer('¿Cómo le gustaría que le digan? 🗣️',
        { capture: true }, async (ctx, { fallBack, gotoFlow }) => {
            const idUsuario = ctx.from;
            const datosUsuario = sesiones.get(idUsuario);
            datosUsuario.apodo = ctx.body.trim();
            console.log(`Apodo (${idUsuario}): ${datosUsuario.apodo}`);

            if (!datosUsuario.apodo) {
                return fallBack('❌ Por favor, ingresa un apodo válido.');
            } else {
                return gotoFlow(flowCondicionMedica); // Avanza al siguiente paso
            }
        });

export const flowCondicionMedica = addKeyword('CONDICION_PACIENTE')
    .addAnswer('¿Tienes alguna condición médica, alergia, enfermedad o estás tomando algún medicamento que el doctor deba conocer? Si no, por favor escribe "Ninguna". 💉 ',
        { capture: true }, async (ctx, { fallBack, gotoFlow }) => {
            const idUsuario = ctx.from;
            const datosUsuario = sesiones.get(idUsuario);
            datosUsuario.condicion = ctx.body.trim();
            console.log(`Condición (${idUsuario}): ${datosUsuario.condicion}`);

            if (!datosUsuario.condicion) {
                return fallBack('❌ Por favor, ingresa una condición válida.');
            } else {
                return gotoFlow(flowTelefono); // Avanza al siguiente paso
            }
        });

export const flowTelefono = addKeyword('TELEFONO_PACIENTE')
    .addAnswer('¿Cuál es tu número telefónico? 📞',
        { capture: true }, async (ctx, { fallBack, gotoFlow }) => {
            const idUsuario = ctx.from;
            const datosUsuario = sesiones.get(idUsuario);
            datosUsuario.telefono = ctx.body.trim();
            console.log(`Número telefónico (${idUsuario}): ${datosUsuario.telefono}`);

            const phoneRegex = /^\d{10}$/;
            if (!phoneRegex.test(datosUsuario.telefono)) {
                return fallBack('❌ Por favor, ingresa un número de teléfono válido.');
            } else {
                return gotoFlow(flowMotivoVisita); // Avanza al siguiente paso
            }
        });

export const flowMotivoVisita = addKeyword('MOTIVO_VISITA_PACIENTE')
    .addAnswer('¿Cuál es el motivo de tu visita? 🏥',
        { capture: true }, async (ctx, { fallBack, gotoFlow }) => {
            const idUsuario = ctx.from;
            const datosUsuario = sesiones.get(idUsuario);
            datosUsuario.motivoVisita = ctx.body.trim();
            console.log(`Motivo de Consulta (${idUsuario}): ${datosUsuario.motivoVisita}`);

            if (!datosUsuario.motivoVisita) {
                return fallBack('❌ Por favor, ingresa un motivo válido.');
            } else {
                return gotoFlow(flowObtenerCitas); // Avanza al siguiente paso
            }
        });

export const flowObtenerCitas = addKeyword('OBTENER_CITAS_PACIENTE')
    .addAction(async (ctx, { flowDynamic, gotoFlow }) => {
        const idUsuario = ctx.from;
        const datosUsuario = sesiones.get(idUsuario);

        try {
            const response = await axios.post('http://localhost:5000/DentalArce/paciente', {
                nombre: datosUsuario.nombre,
                telefonoPaciente: datosUsuario.telefono,
                nombreReferido: datosUsuario.nombreReferido,
                apeM: datosUsuario.apellidoMaterno,
                apeP: datosUsuario.apellidoPaterno,
                fechaNac: datosUsuario.fechaNac,
                correoElectronico: datosUsuario.correoElectronico,
                apodo: datosUsuario.apodo,
                condicion: datosUsuario.condicion,
                motivoVisita: datosUsuario.motivoVisita,
                genero: datosUsuario.genero,
                nombreTutor: datosUsuario.nombreTutor || null,
                altura: datosUsuario.altura || null,
                peso: datosUsuario.peso || null,
                direccion: datosUsuario.direccion || null,
                alergias: datosUsuario.alergias || null,
                medicamentos: datosUsuario.medicamentos || null,
                idDoctor: datosUsuario.idDoctor || null,
                telefonoWhatsapp: idUsuario,
            });

            console.log('Respuesta del servidor:', response.data);
            await flowDynamic('¡Gracias por proporcionarnos tus datos! 😊');
            return gotoFlow(flowCitasDisponibles);
        } catch (error) {
            console.error('Error al registrar los datos del paciente:', error);
            await flowDynamic('¡Oops! Algo salió mal al procesar la información. Por favor, intenta de nuevo más tarde. 🙏');
        }
    });

export const flowCitasDisponibles = addKeyword('CITAS_DISPONIBLES')
    .addAction(async (ctx, { flowDynamic, gotoFlow }) => {
        try {
            console.log('Solicitando las citas disponibles...');
            const response = await axios.get('http://localhost:5000/DentalArce/getAvailableSlots/ce85ebbb918c7c7dfd7bad2eec6c142012d24c2b17e803e21b9d6cc98bb8472b');
            const slots = response.data;
            console.log('Citas encontradas:', slots);

            if (slots.length === 0) {
                await flowDynamic('❌ ¡Lo sentimos! Actualmente no hay citas disponibles. \n\nPor favor, intenta más tarde. 😔');
                return;
            }

            const citasFormato = slots.map((slot, index) => ({
                body: `🗓️ *${slot.day}* - ${slot.date} \n⏰ *De ${slot.start} a ${slot.end}*`,
                buttons: [{ body: `${index + 1}` }]
            }));

            await flowDynamic(citasFormato);

            const idUsuario = ctx.from;
            if (!sesiones.has(idUsuario)) {
                sesiones.set(idUsuario, {});
            }
            const datosUsuario = sesiones.get(idUsuario);
            datosUsuario.slots = slots;
            return gotoFlow(flowSeleccionarCita);
        } catch (error) {
            console.error('Error al obtener las citas disponibles:', error);
            await flowDynamic('⚠️ Hubo un error al obtener las citas. \n\nPor favor, intenta nuevamente más tarde. 🙏');
        }
    });



export const flowSeleccionarCita = addKeyword('SELECCIONAR_CITA')
    .addAnswer('¡Genial! Por favor, elige el número de la cita que prefieras de la lista de opciones:', { capture: true }, async (ctx, { fallBack, flowDynamic, gotoFlow }) => {
        const idUsuario = ctx.from;
        const datosUsuario = sesiones.get(idUsuario);
        const slots = datosUsuario?.slots;

        if (!slots || slots.length === 0) {
            await flowDynamic('Parece que no hay citas disponibles en este momento o se perdió la información. Intenta de nuevo. 😕');
            return;
        }

        const userInput = ctx.body.trim();
        const userChoice = parseInt(userInput, 10);

        if (isNaN(userChoice) || userChoice < 1 || userChoice > slots.length) {
            return fallBack('❌ Opción inválida. Por favor, elige un número válido de la lista de citas disponibles.');
        }

        const selectedSlot = slots[userChoice - 1];
        datosUsuario.horario = `${selectedSlot.day} ${selectedSlot.date} de ${selectedSlot.start} a ${selectedSlot.end}`;
        console.log(`Usuario (${idUsuario}) seleccionó la cita:`, datosUsuario.horario);

        return gotoFlow(flowReservarCita);
    });

export const flowReservarCita = addKeyword('RESERVAR_CITA')
    .addAction(async (ctx, { flowDynamic }) => {
        const idUsuario = ctx.from;
        const datosUsuario = sesiones.get(idUsuario);
        const selectedSlot = datosUsuario.horario;

        if (!selectedSlot) {
            await flowDynamic('Parece que hubo un problema al seleccionar la cita. Por favor, inténtalo nuevamente. 😓');
            return;
        }

        const date = selectedSlot.split(' ')[1];
        const startTime = selectedSlot.split(' ')[3];
        const endTime = selectedSlot.split(' ')[5];

        const startDateTime = `${date}T${startTime}:00`;
        const endDateTime = `${date}T${endTime}:00`;

        try {
            const response = await axios.post('http://localhost:5000/DentalArce/crearCitaCV/ce85ebbb918c7c7dfd7bad2eec6c142012d24c2b17e803e21b9d6cc98bb8472b/ee75200b88065c8f339787783c521b9f5bcc11242f09ac9dd1512d23a98fb485', {
                "summary": datosUsuario.nombre || 'Paciente desconocido',
                "description": datosUsuario.motivoVisita || 'Motivo no especificado',
                "startDateTime": startDateTime,
                "endDateTime": endDateTime,
            });

            console.log('Confirmación de reserva:', response.data);
            await flowDynamic(`¡Tu cita ha sido reservada exitosamente para el ${datosUsuario.horario}! 🎉 Te esperamos.`);
        } catch (error) {
            console.error('Error al reservar la cita:', error);
            await flowDynamic('¡Ups! Algo salió mal al reservar la cita. Por favor, intenta más tarde. 🙏');
        }

        sesiones.delete(idUsuario);
    });

// ---------------------------------------------------------------------------------------------------------------


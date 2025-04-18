import { join } from "path";
import {
  createBot,
  createProvider,
  createFlow,
  addKeyword,
  utils,
  EVENTS
} from "@builderbot/bot";
import { MongoAdapter as Database } from "@builderbot/database-mongo";
import { MetaProvider as Provider } from "@builderbot/provider-meta";

import axios from "axios";

// import {
//     flowAgendarCitaMenor, flowCorreoElectronicoMenor, flowApellidoMenor, flowApodoMenor, flowCitasDisponiblesMenor, flowCondicionMedicaMenor, flowFechaNacimientoMenor,
//     flowGeneroPacienteMenor, flowMotivoVisitaMenor, flowNombrePacienteMenor, flowObtenerCitasMenor, flowReferidoMenor, flowReservarCitaMenor,
//     flowSeleccionarCitaMenor, flowTelefonoMenor, flowmenorejemplo
// } from './menor';

// import {
//     flowAgendarCitaMayor, flowApellidoMaterno, flowApodo, flowCitasDisponibles, flowCondicionMedica, flowCorreoElectronico, flowFechaNacimiento, flowGeneroPaciente, flowMotivoVisita,
//     flowNombrePaciente, flowObtenerCitas, flowReferido, flowReservarCita, flowSeleccionarCita, flowTelefono
// } from './adulto';

import { flowServicios } from "./servicios";

import { flowMensaje, flowMensajeUrgente, flowNoAgendar } from "./flujoMensaje";

import { flowContacto } from "./contacto";

const PORT = process.env.PORT ?? 3009;
const MONGO_DB_URI = "mongodb+srv://jrrdl1506mx:1234@cluster0.5mhti9d.mongodb.net/Calendar";
const MONGO_DB_NAME = "Calendar";
const TOKEN_ACCESS = "EAAIfZAcqC9igBO94uMac2JIPQlBEGrBmpYAzkyl4OyinGJmpYgZBgwF1xCtgryeXhMw1ZBYmN6XvjrIfwPSvULpd8iNbrrT1T7DUJUIm2IrR0iw7vnyk4sKjwiVMlld6VbOmRgREZA5rOcQLPQr5bZA8whHL5wAWeNeZCorvDj4F3oZCesjdgbWYfwBv0ZCx2dcg7wZDZD";

// Mapa para almacenar sesiones de usuarios
const sesiones = new Map();

//-----------------------------------FLOW PACIENTE MENOR--------------------------------\\

export const flowAgendarCitaMenor = addKeyword("Paciente menor").addAnswer(
  "¡Bienvenido! Nos puede compartir la siguiente información para poder abrir su expediente clínico y reservar un espacio en nuestra agenda. 😊\n\n👤 ¿Cuál es el apellido paterno del paciente?",
  { capture: true },
  async (ctx, { fallBack, gotoFlow }) => {
    const idUsuario = ctx.from;

    if (!sesiones.has(idUsuario)) {
      sesiones.set(idUsuario, {});
    }

    const datosUsuario = sesiones.get(idUsuario);
    console.log(datosUsuario);

    datosUsuario.apellidoPaterno = ctx.body.trim();
    console.log(
      `Apellido registrado (${idUsuario}): ${datosUsuario.apellidoPaterno}`
    );

    if (!datosUsuario.apellidoPaterno) {
      return fallBack("❌ Por favor, ingresa un apellido paterno válido.");
    } else {
      return gotoFlow(flowApellidoMenor); // Avanza al siguiente paso
    }
  }
);

export const flowApellidoMenor = addKeyword("APELLIDO_MATERNO_M").addAnswer(
  "¿Apellido materno del paciente? 👤",
  { capture: true },
  async (ctx, { fallBack, gotoFlow }) => {
    const idUsuario = ctx.from;

    const datosUsuario = sesiones.get(idUsuario);
    datosUsuario.apellidoMaterno = ctx.body.trim();
    console.log(
      `Apellido Materno (${idUsuario}): ${datosUsuario.apellidoMaterno}`
    );

    if (!datosUsuario.apellidoMaterno) {
      return fallBack("❌ Por favor, ingresa un apellido materno válido.");
    } else {
      return gotoFlow(flowNombrePacienteMenor); // Avanza al siguiente paso
    }
  }
);

export const flowNombrePacienteMenor = addKeyword(
  "NOMBRE_PACIENTE_M"
).addAnswer(
  "¿Nombre del paciente? 👤",
  { capture: true },
  async (ctx, { fallBack, gotoFlow }) => {
    const idUsuario = ctx.from;
    const datosUsuario = sesiones.get(idUsuario);
    datosUsuario.nombre = ctx.body.trim();
    console.log(`Nombre (${idUsuario}): ${datosUsuario.nombre}`);

    if (!datosUsuario.nombre) {
      return fallBack("❌ Por favor, ingresa un nombre válido.");
    } else {
      return gotoFlow(flowmenorejemplo); // Avanza al siguiente paso
    }
  }
);

export const flowmenorejemplo = addKeyword("NOMBRE_TUTOR").addAnswer(
  "¿Nombre de padre, madre o tutor? 👤",
  { capture: true },
  async (ctx, { fallBack, gotoFlow }) => {
    const idUsuario = ctx.from;

    const datosUsuario = sesiones.get(idUsuario);
    datosUsuario.nombreTutor = ctx.body.trim();
    console.log(`Apellido Materno (${idUsuario}): ${datosUsuario.nombreTutor}`);

    if (!datosUsuario.nombreTutor) {
      return fallBack("❌ Por favor, ingresa un apellido materno válido.");
    } else {
      return gotoFlow(flowGeneroPaciente); // Avanza al siguiente paso
    }
  }
);

//-----------------------------------FLOW PACIENTE MAYOR--------------------------------\\

export const flowAgendarCitaMayor = addKeyword("Paciente mayor").addAnswer(
  "¡Bienvenido! Nos puede compartir la siguiente información para poder abrir su expediente clínico y reservar un espacio en nuestra agenda. 😊\n\n👤 ¿Cuál es el apellido paterno del paciente?",
  { capture: true },
  async (ctx, { fallBack, gotoFlow }) => {
    const idUsuario = ctx.from;

    if (!sesiones.has(idUsuario)) {
      sesiones.set(idUsuario, {});
    }

    const datosUsuario = sesiones.get(idUsuario);
    console.log(datosUsuario);

    datosUsuario.apellidoPaterno = ctx.body.trim();
    console.log(
      `Apellido registrado (${idUsuario}): ${datosUsuario.apellidoPaterno}`
    );

    if (!datosUsuario.apellidoPaterno) {
      return fallBack("❌ Por favor, ingresa un apellido paterno válido.");
    } else {
      return gotoFlow(flowApellidoMaterno); // Avanza al siguiente paso
    }
  }
);

export const flowApellidoMaterno = addKeyword("APELLIDO_MATERNO").addAnswer(
  "¿Apellido materno del paciente? 👤",
  { capture: true },
  async (ctx, { fallBack, gotoFlow }) => {
    const idUsuario = ctx.from;

    const datosUsuario = sesiones.get(idUsuario);
    datosUsuario.apellidoMaterno = ctx.body.trim();
    console.log(
      `Apellido Materno (${idUsuario}): ${datosUsuario.apellidoMaterno}`
    );

    if (!datosUsuario.apellidoMaterno) {
      return fallBack("❌ Por favor, ingresa un apellido materno válido.");
    } else {
      return gotoFlow(flowNombrePaciente); // Avanza al siguiente paso
    }
  }
);

export const flowNombrePaciente = addKeyword("NOMBRE_PACIENTE").addAnswer(
  "¿Nombre del paciente? 👤",
  { capture: true },
  async (ctx, { fallBack, gotoFlow }) => {
    const idUsuario = ctx.from;
    const datosUsuario = sesiones.get(idUsuario);
    datosUsuario.nombre = ctx.body.trim();
    console.log(`Nombre (${idUsuario}): ${datosUsuario.nombre}`);

    if (!datosUsuario.nombre) {
      return fallBack("❌ Por favor, ingresa un nombre válido.");
    } else {
      return gotoFlow(flowGeneroPaciente); // Avanza al siguiente paso
    }
  }
);

//-----------------------------------FLOW CONJUNTO--------------------------------\\

export const flowGeneroPaciente = addKeyword("GENERO_PACIENTE")
  .addAnswer(
    "¿Cuál es el género del paciente?🚻",
    null,
    async (ctx, { flowDynamic }) => {
      await flowDynamic([
        {
          body: "Selecciona una opción:🔘",
          buttons: [{ body: "Masculino 👨" }, { body: "Femenino 👩" }],
        },
      ]);
    }
  )
  .addAnswer("", { capture: true }, async (ctx, { fallBack, gotoFlow }) => {
    const idUsuario = ctx.from;
    const datosUsuario = sesiones.get(idUsuario);
    const generoSeleccionado = ctx.body.trim().toLowerCase();

    if (
      generoSeleccionado !== "masculino" &&
      generoSeleccionado !== "femenino"
    ) {
      return fallBack(
        '❌ Opción inválida. Por favor, selecciona "Masculino 👨" o "Femenino 👩".'
      );
    }

    datosUsuario.genero = generoSeleccionado;
    console.log(`✔ Género (${idUsuario}): ${datosUsuario.genero}`);

    // Avanza al siguiente flujo
  });

export const flowReferidoMasculino = addKeyword("Masculino").addAnswer(
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
    datosUsuario.genero = "Masculino";
    console.log(`✔ Género (${idUsuario}): ${datosUsuario.genero}`);
    console.log(
      `✔ Nombre referido (${idUsuario}): ${datosUsuario.nombreReferido}`
    );

    if (!datosUsuario.nombreReferido) {
      return fallBack('❌ Por favor, ingresa un nombre válido o escribe "no".');
    } else {
      return gotoFlow(flowFechaNacimiento); // Avanza al siguiente flujo
    }
  }
);

export const flowReferidoFemenino = addKeyword("Femenino").addAnswer(
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
    datosUsuario.genero = "Femenino";
    console.log(`✔ Género (${idUsuario}): ${datosUsuario.genero}`);
    console.log(
      `✔ Nombre referido (${idUsuario}): ${datosUsuario.nombreReferido}`
    );

    if (!datosUsuario.nombreReferido) {
      return fallBack('❌ Por favor, ingresa un nombre válido o escribe "no".');
    } else {
      return gotoFlow(flowFechaNacimiento); // Avanza al siguiente flujo
    }
  }
);

export const flowFechaNacimiento = addKeyword(
  "FECHA_NACIMIENTO_PACIENTE"
).addAnswer(
  "¿Cuál es su fecha de nacimiento? (Formato: YYYY-MM-DD) 🗓️",
  { capture: true },
  async (ctx, { fallBack, gotoFlow }) => {
    const idUsuario = ctx.from;
    const datosUsuario = sesiones.get(idUsuario);
    datosUsuario.fechaNac = ctx.body.trim();
    console.log(`Fecha de Nacimiento (${idUsuario}): ${datosUsuario.fechaNac}`);

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(datosUsuario.fechaNac)) {
      return fallBack(
        "❌ Por favor, ingresa una fecha válida en el formato YYYY-MM-DD."
      );
    } else {
      return gotoFlow(flowTenerCorreo); // Avanza al siguiente paso
    }
  }
);

export const flowTenerCorreo = addKeyword("TENER_CORREO").addAnswer(
  "¿Tienes correo electronico?",
  null,
  async (ctx, { flowDynamic }) => {
    await flowDynamic([
      {
        body: "Elige una de las opciones",
        buttons: [{ body: "SI. ✅" }, { body: "NO. ❌" }],
      },
    ]);
  }
);

export const flowCorreoElectronico = addKeyword("SI. ✅").addAnswer(
  "Por favor, indícanos el correo electrónico: 📧 ",
  { capture: true },
  async (ctx, { fallBack, gotoFlow }) => {
    const idUsuario = ctx.from;
    const datosUsuario = sesiones.get(idUsuario);
    datosUsuario.correoElectronico = ctx.body.trim();
    console.log(
      `Correo Electrónico (${idUsuario}): ${datosUsuario.correoElectronico}`
    );

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(datosUsuario.correoElectronico)) {
      return fallBack("❌ Por favor, ingresa un correo electrónico válido.");
    } else {
      return gotoFlow(flowApodo); // Avanza al siguiente paso
    }
  }
);

export const flowApodo = addKeyword("NO. ❌").addAnswer(
  "¿Cómo le gustaría que le digan? 🗣️",
  { capture: true },
  async (ctx, { fallBack, gotoFlow }) => {
    const idUsuario = ctx.from;
    const datosUsuario = sesiones.get(idUsuario);
    datosUsuario.apodo = ctx.body.trim();
    console.log(`Apodo (${idUsuario}): ${datosUsuario.apodo}`);

    if (!datosUsuario.apodo) {
      return fallBack("❌ Por favor, ingresa un apodo válido.");
    } else {
      return gotoFlow(flowCondicionMedica); // Avanza al siguiente paso
    }
  }
);

export const flowCondicionMedica = addKeyword("CONDICION_PACIENTE").addAnswer(
  '¿Tienes alguna condición médica, alergia, enfermedad o estás tomando algún medicamento que el doctor deba conocer? Si no, por favor escribe "Ninguna". 💉 ',
  { capture: true },
  async (ctx, { fallBack, gotoFlow }) => {
    const idUsuario = ctx.from;
    const datosUsuario = sesiones.get(idUsuario);
    datosUsuario.condicion = ctx.body.trim();
    console.log(`Condición (${idUsuario}): ${datosUsuario.condicion}`);

    if (!datosUsuario.condicion) {
      return fallBack("❌ Por favor, ingresa una condición válida.");
    } else {
      return gotoFlow(flowTelefono); // Avanza al siguiente paso
    }
  }
);

export const flowTelefono = addKeyword("TELEFONO_PACIENTE").addAnswer(
  "¿Cuál es tu número telefónico? 📞",
  { capture: true },
  async (ctx, { fallBack, gotoFlow }) => {
    const idUsuario = ctx.from;
    const datosUsuario = sesiones.get(idUsuario);
    datosUsuario.telefono = ctx.body.trim();
    console.log(`Número telefónico (${idUsuario}): ${datosUsuario.telefono}`);

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(datosUsuario.telefono)) {
      return fallBack("❌ Por favor, ingresa un número de teléfono válido.");
    } else {
      return gotoFlow(flowMotivoVisita); // Avanza al siguiente paso
    }
  }
);

export const flowMotivoVisita = addKeyword("MOTIVO_VISITA_PACIENTE").addAnswer(
  "¿Cuál es el motivo de tu visita? 🏥",
  { capture: true },
  async (ctx, { fallBack, gotoFlow }) => {
    const idUsuario = ctx.from;
    const datosUsuario = sesiones.get(idUsuario);
    datosUsuario.motivoVisita = ctx.body.trim();
    console.log(
      `Motivo de Consulta (${idUsuario}): ${datosUsuario.motivoVisita}`
    );

    if (!datosUsuario.motivoVisita) {
      return fallBack("❌ Por favor, ingresa un motivo válido.");
    } else {
      return gotoFlow(flowObtenerCitas); // Avanza al siguiente paso
    }
  }
);

export const flowObtenerCitas = addKeyword(['OBTENER_CITAS_PACIENTE']).addAction(
  async (ctx, { flowDynamic }) => {
    const idUsuario = ctx.from;
    const datosUsuario = sesiones.get(idUsuario);

    let telefonoWhatsappform = idUsuario;
    if (telefonoWhatsappform.length >= 13) {
      const primerosDos = telefonoWhatsappform.substring(0, 2);
      const restoNumero = telefonoWhatsappform.substring(3);
      telefonoWhatsappform = primerosDos + restoNumero;
    }

    try {
      // Registrar datos del paciente
      const response = await axios.post(
        'http://localhost:5000/DentalArce/paciente',
        {
          nombre: datosUsuario.nombre,
          telefonoPaciente: telefonoWhatsappform,
          nombreReferido: datosUsuario.nombreReferido,
          apeM: datosUsuario.apellidoMaterno,
          apeP: datosUsuario.apellidoPaterno,
          fechaNac: datosUsuario.fechaNac,
          correoElectronico: datosUsuario.correoElectronico || null,
          apodo: datosUsuario.apodo,
          condicion: datosUsuario.condicion,
          motivoVisita: datosUsuario.motivoVisita,
          genero: datosUsuario.genero || null,
          nombreTutor: datosUsuario.nombreTutor || null,
          altura: datosUsuario.altura || null,
          peso: datosUsuario.peso || null,
          direccion: datosUsuario.direccion || null,
          alergias: datosUsuario.alergias || null,
          medicamentos: datosUsuario.medicamentos || null,
          idDoctor: datosUsuario.idDoctor || null,
          telefonoWhatsapp: idUsuario,
        }
      );

      datosUsuario._id = response.data._id;

      const esMasculino = datosUsuario.genero?.toLowerCase() === 'masculino';
      const edad = datosUsuario.fechaNac
        ? new Date().getFullYear() - new Date(datosUsuario.fechaNac).getFullYear()
        : 0;
      const esMenor = edad < 18;

      await flowDynamic('¡Gracias por proporcionarnos tus datos! 😊');

      if (esMasculino || esMenor) {
        // Generar pago
        try {
          const pagoResponse = await axios.post('http://localhost:5000/DentalArce/pagos/registro', {
            pacienteId: datosUsuario._id,
            pacienteTel: idUsuario,
          });

          const recordatorioPago = new Date(pagoResponse.data.recordatorioPago);
          const limitePago = new Date(pagoResponse.data.limitePago);

          datosUsuario.urlPago = pagoResponse.data.urlPago;
          datosUsuario.limitePago = limitePago;
          datosUsuario.recordatorioPago = recordatorioPago;
          datosUsuario.objectId = pagoResponse.data._id;

          console.log('Datos del pago:', datosUsuario.urlPago, datosUsuario.limitePago, datosUsuario.objectId);

          // Enviar link de pago y botones
          await flowDynamic([
            {
              body: `💳 Aquí está tu enlace de pago: ${datosUsuario.urlPago}\n\n⏰ Tu pago vence el: ${limitePago.toLocaleString()}`,
              buttons: [
                { body: '✅ Ya pagué' },
                { body: '❌ Cancelar' },
              ],
            },
          ]);

        } catch (error) {
          console.error('Error al crear registro de pago:', error.response?.data || error.message);
          await flowDynamic('Ocurrió un error al preparar tu pago. Por favor intenta nuevamente.');
        }
      } else {
         await flowDynamic('¡Perfecto! Como no se requiere pago, vamos a mostrarte las citas disponibles. 🦷')
         return ( flowCitasDisponibles);
      }
    } catch (error) {
      console.error('Error al registrar los datos del paciente:', error.response?.data || error.message);
      await flowDynamic('¡Oops! Algo salió mal al procesar la información. Por favor, intenta de nuevo más tarde. 🙏');
    }
  }
);

export const flowVerificarPago = addKeyword(['ya pagué', '✅ ya pagué', '🔁 Ya pagué'])
  .addAction(async (ctx, { flowDynamic, gotoFlow }) => {
    const idUsuario = ctx.from;
    const datosUsuario = sesiones.get(idUsuario);

    if (!datosUsuario?.objectId) {
      await flowDynamic('No tengo registrado un pago pendiente para ti. Intenta obtener tus citas primero.');
      return gotoFlow(flowObtenerCitas);
    }

    try {
      const verificar = await axios.post(`http://localhost:5000/DentalArce/verificar-pago/${datosUsuario.objectId}`);
      const estadoPago = verificar.data?.estado;

      if (estadoPago === 'completado') {
        await flowDynamic([
          {
            body: '✅ ¡Pago confirmado! Ahora puedes ver tus citas disponibles.',
          }
        ]);
        return gotoFlow(flowCitasDisponibles);
      } else if (estadoPago === 'expirado') {
        await flowDynamic([
          {
            body: '⛔ Tu sesión de pago ha expirado. Debes hacer el pago nuevamente.',
            buttons: [
              { body: '💳 Nuevo Cobro' }
            ]
          }
        ]);
        return gotoFlow(flowObtenerCitas);
      } else {
        await flowDynamic([
          {
            body: '⏳ El pago aún no se ha confirmado. Espera un momento y vuelve a responder con "Ya pagué".',
            buttons: [
              { body: '🔁 Ya pagué' }
            ]
          }
        ]);
      }      
    } catch (err) {
      console.error('❌ Error al verificar el pago:', err.message);
      await flowDynamic('❌ Ocurrió un error al verificar tu pago. Intenta nuevamente más tarde.');
    }
  });


  export const flowCancelarCita = addKeyword(['cancelar', '❌ cancelar', '💳 Nuevo Cobro'])
  .addAction(async (ctx, { flowDynamic, gotoFlow }) => {
    const idUsuario = ctx.from;
    const datosUsuario = sesiones.get(idUsuario);

    try {
      if (!datosUsuario || !datosUsuario._id) {
        await flowDynamic('⚠️ No se encontró tu información registrada. No hay nada que cancelar.');
        return gotoFlow(welcomeFlow);
      }

      // Llamada al backend para eliminar por ID
      const res = await axios.delete(`http://localhost:5000/DentalArce/paciente/${datosUsuario._id}`);
      console.log('🗑️ Paciente eliminado:', res.data.eliminado);

      await flowDynamic('✅ Has cancelado el proceso de agendar citas y se eliminó tu información. Si deseas retomarlo, solo escribe "Cita". 🦷');

      // Redirigir al flujo principal
      return gotoFlow(welcomeFlow);
    } catch (error) {
      console.error('❌ Error al cancelar y eliminar:', error.message);
      await flowDynamic('Ocurrió un error al cancelar tu cita. Intenta de nuevo más tarde.');
    }
  });



export const flowCitasDisponibles = addKeyword(['CITAS_DISPONIBLES', '📅 Ver citas']).addAction(
  async (ctx, { flowDynamic, gotoFlow }) => {
    try {
      console.log("Solicitando las citas disponibles...");
      const response = await axios.get(
        "http://localhost:5000/DentalArce/getAvailableSlots/ce85ebbb918c7c7dfd7bad2eec6c142012d24c2b17e803e21b9d6cc98bb8472b"
      );
      const slots = response.data;
      console.log("Citas encontradas:", slots);

      if (slots.length === 0) {
        await flowDynamic(
          "❌ ¡Lo sentimos! Actualmente no hay citas disponibles. \n\nPor favor, intenta más tarde. 😔"
        );
        return;
      }

      const citasFormato = slots.map((slot, index) => ({
        body: `🗓️ *${slot.day}* - ${slot.date} \n⏰ *De ${slot.start} a ${slot.end}*`,
        buttons: [{ body: `${index + 1}` }],
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
      console.error("Error al obtener las citas disponibles:", error);
      await flowDynamic(
        "⚠️ Hubo un error al obtener las citas. \n\nPor favor, intenta nuevamente más tarde. 🙏"
      );
    }
  }
);

export const flowSeleccionarCita = addKeyword("SELECCIONAR_CITA").addAnswer(
  "¡Genial! Por favor, elige el número de la cita que prefieras de la lista de opciones:",
  { capture: true },
  async (ctx, { fallBack, flowDynamic, gotoFlow }) => {
    const idUsuario = ctx.from;
    const datosUsuario = sesiones.get(idUsuario);
    const slots = datosUsuario?.slots;

    if (!slots || slots.length === 0) {
      await flowDynamic(
        "Parece que no hay citas disponibles en este momento o se perdió la información. Intenta de nuevo. 😕"
      );
      return;
    }

    const userInput = ctx.body.trim();
    const userChoice = parseInt(userInput, 10);

    if (isNaN(userChoice) || userChoice < 1 || userChoice > slots.length) {
      return fallBack(
        "❌ Opción inválida. Por favor, elige un número válido de la lista de citas disponibles."
      );
    }

    const selectedSlot = slots[userChoice - 1];
    datosUsuario.horario = `${selectedSlot.day} ${selectedSlot.date} de ${selectedSlot.start} a ${selectedSlot.end}`;
    console.log(
      `Usuario (${idUsuario}) seleccionó la cita:`,
      datosUsuario.horario
    );

    return gotoFlow(flowReservarCita);
  }
);

export const flowReservarCita = addKeyword("RESERVAR_CITA").addAction(
  async (ctx, { flowDynamic }) => {
    const idUsuario = ctx.from;
    const datosUsuario = sesiones.get(idUsuario);
    const selectedSlot = datosUsuario.horario;

    if (!selectedSlot) {
      await flowDynamic(
        "Parece que hubo un problema al seleccionar la cita. Por favor, inténtalo nuevamente. 😓"
      );
      return;
    }

    const date = selectedSlot.split(" ")[1];
    const startTime = selectedSlot.split(" ")[3];
    const endTime = selectedSlot.split(" ")[5];

    const startDateTime = `${date}T${startTime}:00`;
    const endDateTime = `${date}T${endTime}:00`;

    // Función para calcular la fecha de recordatorio (un día antes)
    const calcularRecordatorio = (dateTimeStr) => {
      const dateObj = new Date(dateTimeStr);

      // Restar un día
      dateObj.setDate(dateObj.getDate() - 1);

      // Formatear la fecha de vuelta al formato ISO sin cambiar la zona horaria
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      const hours = String(dateObj.getHours()).padStart(2, '0');
      const minutes = String(dateObj.getMinutes()).padStart(2, '0');
      const seconds = String(dateObj.getSeconds()).padStart(2, '0');

      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    };

    const recordatorioDateTime = calcularRecordatorio(startDateTime);

    try {
      const response = await axios.post(
        "http://localhost:5000/DentalArce/crearCitaCV/ce85ebbb918c7c7dfd7bad2eec6c142012d24c2b17e803e21b9d6cc98bb8472b/ee75200b88065c8f339787783c521b9f5bcc11242f09ac9dd1512d23a98fb485",
        {
          summary: datosUsuario.nombre,
          description: datosUsuario.motivoVisita,
          startDateTime: startDateTime,
          endDateTime: endDateTime,
        }
      );

      console.log("Confirmación de reserva:", response.data);

      // Guardar los IDs de los eventos en la sesión del usuario
      if (response.data.event1 && response.data.event2) {
        datosUsuario.event1Id = response.data.event1.id;
        datosUsuario.event2Id = response.data.event2.id;

        console.log(`ID Usuario (${idUsuario}): ${datosUsuario._id}`);
        console.log(`ID de Evento 1 (${idUsuario}): ${datosUsuario.event1Id}`);
        console.log(`ID de Evento 2 (${idUsuario}): ${datosUsuario.event2Id}`);
      }
      const env = false;

      const respons = await axios.post(
        "http://localhost:5000/DentalArce/vincularPacienteCita",
        {
          pacienteId: datosUsuario._id,
          idsCitas: [datosUsuario.event1Id, datosUsuario.event2Id],
          recordatorioCita: recordatorioDateTime,
          enviado: env,
        }
      );

      console.log("Confirmación de paciente cita", respons.data);

      await flowDynamic(
        `¡Tu cita ha sido reservada exitosamente para el ${datosUsuario.horario}! 🎉 Te esperamos.`
      );
    } catch (error) {
      console.error("Error al reservar la cita:", error);
      await flowDynamic(
        "¡Ups! Algo salió mal al reservar la cita. Por favor, intenta más tarde. 🙏"
      );
    }

    sesiones.delete(idUsuario);
  }
);

// ---------------------------------------------------------------------------------------------------------------

const flowDocs = addKeyword("Agendar")
  .addAnswer(
    [
      "¡Le invitamos a que acuda a una consulta valoración con Dr. Arce, para",
      "realizar una revisión oportuna de su situación actual y ayudar a dar solución ",
      "a su padecimiento ✨! \n\n",
      "En Dental Clinic Boutique, la primera consulta es una valoración que incluye: \n\n",
      "* Apertura de Expediente Clínico Digital",
      "* Fotografías de Estudio",
      "* Escaneo Dental",
      "* Radiografías digitales",
      "* Plan de Tratamiento personalizado",
      "* Alternativas de Tratamientos",
      "* Costo del tratamiento elegido",
      "* Plan de pagos\n",
      "📆 Duración: 1 hora 30 minutos",
      "💰 Costo: $700.00 MXN\n\n",
      "➡️ Nuestra atención a pacientes es a partir de los 15 años de edad. \n",
    ],
    null,
    async (ctx, { flowDynamic }) => {
      await flowDynamic([
        {
          body: "🤔 Le gustaría reservar una consulta para: ",
          buttons: [
            {
              body: "Paciente menor ",
            },
            {
              body: "Paciente mayor",
            },
            {
              body: "No agendar cita ",
            },
          ],
        },
      ]);
    }
  )
  .addAnswer(["Por favor, selecciona una opción."], null, null, [
    flowAgendarCitaMayor,
    flowAgendarCitaMenor,
    flowNoAgendar,
    flowMensajeUrgente,
  ]);

const welcomeFlow = addKeyword(["hola", "ole", "alo", "inicio", "Cita", "cita"])
  .addAnswer(
    "🙌 ¡Hola, bienvenido a Dental Clinic Boutique! 😊",
    null,
    async (ctx, { flowDynamic }) => {
      const idUsuario = ctx.from;
      const telefonoUsuario = ctx.from; // Este campo contiene el número de WhatsApp del usuario.

      // Verifica si el usuario está registrado
      try {
        const response = await axios.get(
          `http://localhost:5000/DentalArce/buscarPacientePorTelefono/${telefonoUsuario}`
        );
        const paciente = response.data;

        if (paciente && paciente.nombre) {
          await flowDynamic([
            {
              body:
                `¡Hola, ${paciente.nombre}! 👋\n\n` +
                `Nos alegra verte de nuevo. Parece que ya estás registrado en nuestro sistema. 😊\n\n`,
            },
            {
              body: ` Selecciona *Urgente* si necesitas atención inmediata para algo que no puede esperar.`,
              buttons: [{ body: "Urgente 🦷" }],
            },
            {
              body: ` Selecciona *Mensaje* si necesitas información o quieres agendar una cita.`,
              buttons: [{ body: "Mensaje 📝" }],
            },
            {
              body: `Selecciona *Ubicación* para conocer nuestra dirección y formas de contacto.`,
              buttons: [{ body: "Ubicación 📍" }],
            },
          ]);
        } else {
          // Mensaje si el usuario no está registrado
          await flowDynamic([
            "No encontré tu información en nuestro sistema.",
            "¿Te gustaría registrarte para agendar una cita? 😊",
          ]);
        }
      } catch (error) {
        console.error("Error al verificar el número de teléfono:", error);
        await flowDynamic([
          {
            body: "Estoy aquí para ayudarte. Por favor, selecciona una opción:",
            buttons: [
              {
                body: "Servicios 🦷",
              },
              {
                body: "Agendar 📅",
              },
              {
                body: "Ubicación 📍",
              },
            ],
          },
        ]);
      }
    }
  )
  .addAnswer([], null, null, [
    flowServicios,
    flowDocs,
    flowContacto,
    flowMensaje,
    flowMensajeUrgente,
  ]);

const main = async () => {
  const adapterFlow = createFlow([
    welcomeFlow,
    flowApellidoMaterno,
    flowApodo,
    flowCitasDisponibles,
    flowCondicionMedica,
    flowCorreoElectronico,
    flowFechaNacimiento,
    flowGeneroPaciente,
    flowMotivoVisita,
    flowNombrePaciente,
    flowObtenerCitas,
    flowReferidoMasculino,
    flowReferidoFemenino,
    flowReservarCita,
    flowSeleccionarCita,
    flowTelefono,
    flowApellidoMenor,
    flowNombrePacienteMenor,
    flowmenorejemplo,
    flowTenerCorreo,
    flowVerificarPago,
    flowCancelarCita,
  ]);

  const adapterProvider = createProvider(Provider, {
    jwtToken: TOKEN_ACCESS,
    numberId: "164144560120336",
    verifyToken: "perro",
    version: "v21.0",
  });
  const adapterDB = new Database({
    dbUri: MONGO_DB_URI,
    dbName: MONGO_DB_NAME,
  });

  const { handleCtx, httpServer } = await createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  });

  adapterProvider.server.post(
    "/v1/messages",
    handleCtx(async (bot, req, res) => {
      const { number, message, urlMedia } = req.body;
      await bot.sendMessage(number, message, { media: urlMedia ?? null });
      return res.end("sended");
    })
  );

  adapterProvider.server.post(
    "/v1/register",
    handleCtx(async (bot, req, res) => {
      const { number, name } = req.body;
      await bot.dispatch("REGISTER_FLOW", { from: number, name });
      return res.end("trigger");
    })
  );

  adapterProvider.server.post(
    "/v1/samples",
    handleCtx(async (bot, req, res) => {
      const { number, name } = req.body;
      await bot.dispatch("SAMPLES", { from: number, name });
      return res.end("trigger");
    })
  );

  adapterProvider.server.post(
    "/v1/blacklist",
    handleCtx(async (bot, req, res) => {
      const { number, intent } = req.body;
      if (intent === "remove") bot.blacklist.remove(number);
      if (intent === "add") bot.blacklist.add(number);

      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ status: "ok", number, intent }));
    })
  );

  httpServer(+PORT);
};

main();

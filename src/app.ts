import { join } from "path";
import {
  createBot,
  createProvider,
  createFlow,
  addKeyword,
  utils,
  EVENTS,
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
const MONGO_DB_URI =
  "mongodb+srv://jrrdl1506mx:1234@cluster0.5mhti9d.mongodb.net/Calendar";
const MONGO_DB_NAME = "Calendar";
const TOKEN_ACCESS =
  "EAAIfZAcqC9igBO94uMac2JIPQlBEGrBmpYAzkyl4OyinGJmpYgZBgwF1xCtgryeXhMw1ZBYmN6XvjrIfwPSvULpd8iNbrrT1T7DUJUIm2IrR0iw7vnyk4sKjwiVMlld6VbOmRgREZA5rOcQLPQr5bZA8whHL5wAWeNeZCorvDj4F3oZCesjdgbWYfwBv0ZCx2dcg7wZDZD";

// Mapa para almacenar sesiones de usuarios
const sesiones = new Map();

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
  "¿Cuál es su fecha de nacimiento? (Formato: DD/MM/YYYY) 🗓️",
  { capture: true },
  async (ctx, { fallBack, gotoFlow }) => {
    const idUsuario = ctx.from;
    const datosUsuario = sesiones.get(idUsuario);
    const fechaIngresada = ctx.body.trim();
    
    // Validar formato DD/MM/YYYY
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(fechaIngresada)) {
      return fallBack(
        "❌ Por favor, ingresa una fecha válida en el formato DD/MM/YYYY."
      );
    }
    
    // Convertir a YYYY-MM-DD
    const [dia, mes, anio] = fechaIngresada.split('/');
    const fechaFormatoCorrecto = `${anio}-${mes}-${dia}`;
    
    // Validar que sea una fecha real
    const fechaNac = new Date(fechaFormatoCorrecto);
    if (isNaN(fechaNac.getTime())) {
      return fallBack(
        "❌ La fecha ingresada no es válida. Por favor ingresa una fecha real en formato DD/MM/YYYY."
      );
    }
    
    // Calcular edad
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mesActual = hoy.getMonth();
    const mesNacimiento = fechaNac.getMonth();
    
    // Ajustar edad si aún no ha pasado el mes de cumpleaños
    if (mesActual < mesNacimiento || 
        (mesActual === mesNacimiento && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }
    
    // Validar rango de edad
    if (edad < 18) {
      return fallBack(
        "❌ Lo siento, debes ser mayor de 18 años para continuar."
      );
    }
    
    if (edad > 100) {
      return fallBack(
        "❌ La edad ingresada no parece válida. Por favor verifica tu fecha de nacimiento."
      );
    }
    
    // Guardar fecha en formato YYYY-MM-DD
    datosUsuario.fechaNac = fechaFormatoCorrecto;
    console.log(`Fecha de Nacimiento (${idUsuario}): ${datosUsuario.fechaNac}`);
    
    return gotoFlow(flowTenerCorreo); // Avanza al siguiente paso
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
      return gotoFlow(flowAlergias); // Avanza al siguiente paso
    }
  }
);

export const flowAlergias = addKeyword("ALERGIAS_PACIENTE").addAnswer(
  '¿Tienes alguna condición médica, alergia, enfermedad?, Si no por favor escribe "Ninguna" // ¿Estás tomando algún medicamento que el doctor deba conocer? Si no, por favor escribe "Ninguna". 💉 ',
  { capture: true },
  async (ctx, { fallBack, gotoFlow }) => {
    const idUsuario = ctx.from;
    const datosUsuario = sesiones.get(idUsuario);
    datosUsuario.alergias = ctx.body.trim();
    console.log(`Condición (${idUsuario}): ${datosUsuario.alergias}`);

    if (!datosUsuario.alergias) {
      return fallBack("❌ Por favor, ingresa una alergia válida.");
    } else {
      return gotoFlow(flowMedicamento); // Avanza al siguiente paso
    }
  }
);

export const flowMedicamento = addKeyword("MEDICAMENTOS_PACIENTE").addAnswer(
  '¿Estás tomando algún medicamento que el doctor deba conocer? Si no, por favor escribe "Ninguna". 💉 ',
  { capture: true },
  async (ctx, { fallBack, gotoFlow }) => {
    const idUsuario = ctx.from;
    const datosUsuario = sesiones.get(idUsuario);
    datosUsuario.medicamentos = ctx.body.trim();
    console.log(`Condición (${idUsuario}): ${datosUsuario.medicamentos}`);

    if (!datosUsuario.medicamentos) {
      return fallBack("❌ Por favor, ingresa un medicamentos válido.");
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

export const flowObtenerCitas = addKeyword([
  "OBTENER_CITAS_PACIENTE",
]).addAction(async (ctx, { flowDynamic, gotoFlow }) => {
  const idUsuario = ctx.from;
  const datosUsuario = sesiones.get(idUsuario);

  let telefonoWhatsappform = idUsuario;
  if (telefonoWhatsappform.length >= 13) {
    const primerosDos = telefonoWhatsappform.substring(0, 2);
    const restoNumero = telefonoWhatsappform.substring(3);
    telefonoWhatsappform = primerosDos + restoNumero;
  }

  try {
    // Registrar datos del paciente (resto del código original)
    const response = await axios.post(
      "http://localhost:5000/DentalArce/paciente",
      {
        nombre: datosUsuario.nombre,
        telefonoPaciente: telefonoWhatsappform || null,
        nombreReferido: datosUsuario.nombreReferido,
        apeM: datosUsuario.apellidoMaterno,
        apeP: datosUsuario.apellidoPaterno,
        fechaNac: datosUsuario.fechaNac,
        correoElectronico: datosUsuario.correoElectronico || '' ,
        apodo: datosUsuario.apodo,
        genero: datosUsuario.genero || '' ,
        altura: datosUsuario.altura || '' ,
        peso: datosUsuario.peso || '' ,
        direccion: datosUsuario.direccion || '' ,
        alergias: datosUsuario.alergias,
        medicamentos: datosUsuario.medicamentos,
        idDoctor: datosUsuario.idDoctor || null,
        telefonoWhatsapp: idUsuario,
      }
    );

    datosUsuario._id = response.data._id;

    const esMasculino = datosUsuario.genero?.toLowerCase() === "masculino";

    await flowDynamic("¡Gracias por proporcionarnos tus datos! 😊");

    if (esMasculino) {
      // Generar pago
      // Primero mostramos las citas disponibles actuales
      await flowDynamic(
        "🔍 Recuperando las citas disponibles en este momento..."
      );

      try {
        const responseCitas = await axios.get(
          "http://localhost:5000/DentalArce/getAvailableSlots/ce85ebbb918c7c7dfd7bad2eec6c142012d24c2b17e803e21b9d6cc98bb8472b"
        );
        const slots = responseCitas.data;

        if (slots.length > 0) {
          const mensajeCitas = slots
            .map(
              (slot) =>
                `🗓️ *${slot.day}* - ${slot.date} \n⏰ a las ${slot.start}`
            )
            .join("\n\n");

          await flowDynamic([
            {
              body: `Estas son las citas disponibles en este momento:\n\n${mensajeCitas}\n\n⚠️ Importante: Si tardas en realizar el pago, estas citas podrían no estar disponibles al finalizar. En ese caso, se te mostrarán las nuevas opciones disponibles.`,
            },
          ]);

          // Guardamos las citas en la sesión por si acaso
          datosUsuario.slotsPreview = slots;
        } else {
          await flowDynamic(
            "Actualmente no hay citas disponibles. Por favor, intenta más tarde."
          );
        }
      } catch (error) {
        console.error("Error al obtener citas previas:", error);
        await flowDynamic(
          "No pude recuperar las citas disponibles en este momento. Continuaremos con el proceso de pago."
        );
      }

      try {
        const pagoResponse = await axios.post(
          "http://localhost:5000/DentalArce/pagos/registro",
          {
            pacienteId: datosUsuario._id,
            pacienteTel: idUsuario,
          }
        );

        const recordatorioPago = new Date(pagoResponse.data.recordatorioPago);
        const limitePago = new Date(pagoResponse.data.limitePago);

        datosUsuario.urlPago = pagoResponse.data.urlPago;
        datosUsuario.limitePago = limitePago;
        datosUsuario.recordatorioPago = recordatorioPago;
        datosUsuario.objectId = pagoResponse.data._id;

        console.log(
          "Datos del pago:",
          datosUsuario.urlPago,
          datosUsuario.limitePago,
          datosUsuario.objectId
        );

        // Enviar link de pago y botones
        await flowDynamic([
          {
            body: `💳 Aquí está tu enlace de pago: ${
              datosUsuario.urlPago
            }\n\n⏰ Tu pago vence el: ${limitePago.toLocaleString()}\n\n⚠️ ADVERTENCIA: Una vez realizado el pago, NO se aceptarán reembolsos ni devoluciones.`,
            buttons: [{ body: "✅ Ya pagué" }, { body: "❌ Cancelar" }],
          },
        ]);
      } catch (error) {
        console.error(
          "Error al crear registro de pago:",
          error.response?.data || error.message
        );
        await flowDynamic(
          "Ocurrió un error al preparar tu pago. Por favor intenta nuevamente."
        );
      }
    } else {
      await flowDynamic(
        "¡Perfecto! Como no se requiere pago, vamos a mostrarte las citas disponibles. 🦷"
      );
      return gotoFlow(flowCitasDisponibles);
    }
  } catch (error) {
    console.error(
      "Error al registrar los datos del paciente:",
      error.response?.data || error.message
    );
    await flowDynamic(
      "¡Oops! Algo salió mal al procesar la información. Por favor, intenta de nuevo más tarde. 🙏"
    );
  }
});

export const flowVerificarPago = addKeyword([
  "ya pagué",
  "✅ ya pagué",
  "🔁 Ya pagué",
]).addAction(async (ctx, { flowDynamic, gotoFlow }) => {
  const idUsuario = ctx.from;
  const datosUsuario = sesiones.get(idUsuario);

  if (!datosUsuario?.objectId) {
    await flowDynamic(
      "No tengo registrado un pago pendiente para ti. Intenta obtener tus citas primero."
    );
    return gotoFlow(flowObtenerCitas);
  }

  try {
    const verificar = await axios.post(
      `http://localhost:5000/DentalArce/verificar-pago/${datosUsuario.objectId}`
    );
    const estadoPago = verificar.data?.estado;

    if (estadoPago === "completado") {
      await flowDynamic([
        {
          body: "✅ ¡Pago confirmado! Ahora puedes ver tus citas disponibles.",
        },
      ]);
      return gotoFlow(flowCitasDisponibles);
    } else if (estadoPago === "expirado") {
      await flowDynamic([
        {
          body: "⛔ Tu sesión de pago ha expirado. Debes hacer el pago nuevamente.",
          buttons: [{ body: "💳 Nuevo Cobro" }],
        },
      ]);
      return gotoFlow(flowCancelarCita);
    } else {
      await flowDynamic([
        {
          body: '⏳ El pago aún no se ha confirmado. Espera un momento y vuelve a responder con "Ya pagué".',
          buttons: [{ body: "🔁 Ya pagué" }],
        },
      ]);
    }
  } catch (err) {
    console.error("❌ Error al verificar el pago:", err.message);
    await flowDynamic(
      "❌ Ocurrió un error al verificar tu pago. Intenta nuevamente más tarde."
    );
  }
});

export const flowCancelarCita = addKeyword([
  "cancelar",
  "❌ cancelar",
  "💳 Nuevo Cobro",
]).addAction(async (ctx, { flowDynamic, gotoFlow }) => {
  const idUsuario = ctx.from;
  const datosUsuario = sesiones.get(idUsuario);

  try {
    if (!datosUsuario || !datosUsuario._id) {
      await flowDynamic(
        "⚠️ No se encontró tu información registrada. No hay nada que cancelar."
      );
      return gotoFlow(welcomeFlow);
    }

    // Llamada al backend para eliminar por ID
    const res = await axios.delete(
      `http://localhost:5000/DentalArce/paciente/${datosUsuario._id}`
    );
    console.log("🗑️ Paciente eliminado:", res.data.eliminado);

    await flowDynamic(
      '✅ Has cancelado el proceso de agendar citas y se eliminó tu información. Si deseas retomarlo, solo escribe "Cita". 🦷'
    );

    // Redirigir al flujo principal
    return gotoFlow(welcomeFlow);
  } catch (error) {
    console.error("❌ Error al cancelar y eliminar:", error.message);
    await flowDynamic(
      "Ocurrió un error al cancelar tu cita. Intenta de nuevo más tarde."
    );
  }
});

export const flowCitasDisponibles = addKeyword([
  "CITAS_DISPONIBLES",
  "📅 Ver citas",
]).addAction(async (ctx, { flowDynamic, gotoFlow }) => {
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
      body: `🗓️ *${slot.day}* - ${slot.date} \n⏰ *a las ${slot.start}*`,
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
});

export const flowSeleccionarCita = addKeyword("SELECCIONAR_CITA").addAnswer(
  "Por favor, elige el número de la cita que prefieras de la lista de opciones:",
  { capture: true },
  async (ctx, { fallBack, flowDynamic, gotoFlow }) => {
    const idUsuario = ctx.from;
    const datosUsuario = sesiones.get(idUsuario);
    const slots = datosUsuario?.slots;

    if (!slots || slots.length === 0) {
      await flowDynamic(
        "Parece que no hay citas disponibles en este momento o se perdió la información. Intenta de nuevo. 😕"
      );
      return gotoFlow(flowCitasDisponibles);
    }

    const userInput = ctx.body.trim();
    const userChoice = parseInt(userInput, 10);

    if (isNaN(userChoice) || userChoice < 1 || userChoice > slots.length) {
      return fallBack(
        "❌ Opción inválida. Por favor, elige un número válido de la lista de citas disponibles."
      );
    }

    const selectedSlot = slots[userChoice - 1];
    
    // Primero validamos si la cita sigue disponible
    try {
      const response = await axios.get(
        "http://localhost:5000/DentalArce/getAvailableSlots/ce85ebbb918c7c7dfd7bad2eec6c142012d24c2b17e803e21b9d6cc98bb8472b"
      );
      const currentSlots = response.data;
      
      // Buscar si la cita seleccionada sigue disponible
      const isStillAvailable = currentSlots.some(slot => 
        slot.day === selectedSlot.day && 
        slot.date === selectedSlot.date && 
        slot.start === selectedSlot.start
      );
      
      if (!isStillAvailable) {
        // Actualizar las citas disponibles en la sesión
        datosUsuario.slots = currentSlots;
        
        if (currentSlots.length === 0) {
          await flowDynamic([
            {
              body: "⚠️ La cita que seleccionaste ya no está disponible. Actualmente no hay más citas disponibles.",
            },
            {
              body: "Por favor, intenta más tarde o contáctanos directamente.",
            }
          ]);
          return gotoFlow(welcomeFlow);
        }
        
        // Crear mensaje con botones para las nuevas citas
        const citasConBotones = currentSlots.map((slot, index) => ({
          body: `🗓️ *${slot.day}* - ${slot.date} \n⏰ a las ${slot.start}`,
          buttons: [{ body: `${index + 1}` }]
        }));

        await flowDynamic([
          {
            body: "⚠️ La cita que seleccionaste ya no está disponible.",
          },
          
        ]);
        
        return gotoFlow (flowCitasDisponibles); // Permanece en el mismo flujo para capturar la nueva selección
      }
      
      // Si la cita está disponible, proceder
      datosUsuario.horario = `${selectedSlot.day} ${selectedSlot.date} de ${selectedSlot.start} a ${selectedSlot.end}`;
      console.log(
        `Usuario (${idUsuario}) seleccionó la cita:`,
        datosUsuario.horario
      );

      return gotoFlow(flowReservarCita);
      
    } catch (error) {
      console.error("Error al validar disponibilidad de cita:", error);
      await flowDynamic(
        "Ocurrió un error al verificar la disponibilidad de la cita. Por favor, intenta nuevamente."
      );
      return gotoFlow(flowCitasDisponibles);
    }
  }
);



export const flowReservarCita = addKeyword("RESERVAR_CITA").addAction(
  async (ctx, { flowDynamic, gotoFlow }) => {
    const idUsuario = ctx.from;
    const datosUsuario = sesiones.get(idUsuario);
    const selectedSlot = datosUsuario.horario;

    if (!selectedSlot) {
      await flowDynamic(
        "Parece que hubo un problema al seleccionar la cita. Por favor, inténtalo nuevamente. 😓"
      );
      return gotoFlow(flowCitasDisponibles);
    }

    const date = selectedSlot.split(" ")[1];
    const startTime = selectedSlot.split(" ")[3];
    const endTime = selectedSlot.split(" ")[5];

    const startDateTime = `${date}T${startTime}:00`;
    const endDateTime = `${date}T${endTime}:00`;

    // Función para calcular la fecha de recordatorio (2 días antes)
    const calcularRecordatorio = (dateTimeStr) => {
      const dateObj = new Date(dateTimeStr);
      dateObj.setDate(dateObj.getDate() - 2);
      dateObj.setHours(9, 0, 0, 0); // Fijar hora específica para recordatorios (ej. 9 AM)
      return dateObj.toISOString();
    };

    const recordatorioDateTime = calcularRecordatorio(startDateTime);

    // Formatear fecha en "DD/MM/AAAA"
    const [year, month, day] = date.split("-");
    const fechaCitaFormateada = `${day}/${month}/${year}`;

    // Separar hora y determinar AM/PM
    const [horaStr, minutoStr] = startTime.split(":");
    const hora = parseInt(horaStr, 10);
    let ampm = "am";
    let horaFormateada = startTime;

    if (hora >= 12) {
      ampm = "pm";
      if (hora > 12) {
        horaFormateada = `${hora - 12}:${minutoStr}`;
      }
    }

    try {
      // Validar una última vez la disponibilidad antes de reservar
      const responseValidation = await axios.get(
        "http://localhost:5000/DentalArce/getAvailableSlots/ce85ebbb918c7c7dfd7bad2eec6c142012d24c2b17e803e21b9d6cc98bb8472b"
      );
      const currentSlots = responseValidation.data;
      
      const isStillAvailable = currentSlots.some(slot => 
        slot.day === selectedSlot.split(" ")[0] && 
        slot.date === date && 
        slot.start === startTime
      );
      
      if (!isStillAvailable) {
        // Actualizar las citas disponibles en la sesión
        datosUsuario.slots = currentSlots;
        
        await flowDynamic([
          {
            body: "⚠️ Lo sentimos, la cita que seleccionaste fue tomada por otro paciente justo antes de que confirmáramos.",
          },
          {
            body: "Vamos a mostrarte las nuevas opciones disponibles:",
          }
        ]);
        
        return gotoFlow(flowCitasDisponibles);
      }

      // Si sigue disponible, proceder con la reserva
      const response = await axios.post(
        "http://localhost:5000/DentalArce/crearCitaCV/ce85ebbb918c7c7dfd7bad2eec6c142012d24c2b17e803e21b9d6cc98bb8472b/ee75200b88065c8f339787783c521b9f5bcc11242f09ac9dd1512d23a98fb485",
        {
          summary: datosUsuario.nombre,
          description: datosUsuario.motivoVisita,
          startDateTime: startDateTime,
          endDateTime: endDateTime,
        }
      );

      console.log("fecha de incio:", startDateTime);
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
          fechaCita: fechaCitaFormateada,
          horaCita: horaFormateada,
          ampm: ampm,
          enviado: env,
        }
      );

      console.log("Confirmación de paciente cita", respons.data);

      await flowDynamic([
        {
          body: `✅ ¡Tu cita ha sido reservada exitosamente para el ${datosUsuario.horario}! 🎉`,
        },
        {
          body: "Te enviaremos un recordatorio 2 días antes de tu cita. ¡Te esperamos!",
        }
      ]);
    } catch (error) {
      console.error("Error al reservar la cita:", error);
      
      if (error.response?.status === 409) {
        // Conflicto - cita ya ocupada
        await flowDynamic([
          {
            body: "⚠️ Lo sentimos, la cita que seleccionaste fue tomada por otro paciente mientras intentábamos reservarla.",
          },
          {
            body: "Vamos a mostrarte las nuevas opciones disponibles:",
          }
        ]);
        return gotoFlow(flowCitasDisponibles);
      } else {
        await flowDynamic([
          {
            body: "¡Ups! Algo salió mal al reservar la cita. Por favor, intenta más tarde. 🙏",
          },
          {
            body: "Si el problema persiste, contáctanos directamente para asistencia.",
          }
        ]);
      }
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
      "💰 Costo: $750.00 MXN\n\n",
      "➡️ Nuestra atención a pacientes es a partir de los 18 años de edad. \n",
    ],
    null,
    async (ctx, { flowDynamic }) => {
      await flowDynamic([
        {
          body: "🤔 Le gustaría reservar una consulta para: ",
          buttons: [
            {
              body: "Paciente mayor",
            },
            {
              body: "No agendar cita",
            },
          ],
        },
      ]);
    }
  )
  .addAnswer(["Por favor, selecciona una opción."], null, null, [
    flowAgendarCitaMayor,
    flowNoAgendar,
    flowMensajeUrgente,
  ]);

const welcomeFlow = addKeyword([
  "hola",
  "ole",
  "alo",
  "inicio",
  "Cita",
  "cita",
  "Doctor",
])
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
                `¡Hola, ${paciente.apodo}! 👋\n\n` +
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
    flowAlergias,
    flowMedicamento,
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

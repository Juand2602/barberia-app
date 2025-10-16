// backend/src/services/whatsapp/bot.processor.ts

import { PrismaClient } from '@prisma/client';
import whatsappService from './whatsapp.service';
import {
  MENSAJES,
  formatearFecha,
  formatearHora,
  formatearPrecio,
  generarRadicado,
  validarNombreCompleto
} from './templates';
import { WhatsAppMessage, ConversacionContexto, PasoConversacion, BotResponse } from '../../types/whatsapp.types';

const prisma = new PrismaClient();

// Configuración de la barbería (puede venir de BD)
const CONFIG = {
  nombreBarberia: process.env.BARBERIA_NOMBRE || 'Madison MVP Barbería',
  direccion: process.env.BARBERIA_DIRECCION || 'Centro Comercial Acrópolis, primer piso local 108',
  telefono: process.env.BARBERIA_TELEFONO || '+573001234567'
};

class BotProcessor {
  /**
   * Procesar mensaje entrante
   */
  async procesarMensaje(
    telefono: string,
    mensaje: WhatsAppMessage,
    nombreContacto?: string
  ): Promise<void> {
    try {
      console.log(`📨 Procesando mensaje de ${telefono}: ${mensaje.text?.body || mensaje.type}`);

      // Obtener o crear conversación
      let conversacion = await this.obtenerConversacionActiva(telefono);
      
      if (!conversacion) {
        conversacion = await this.crearNuevaConversacion(telefono, nombreContacto);
      }

      // Extraer texto del mensaje
      const textoMensaje = this.extraerTextoMensaje(mensaje);

      // Guardar mensaje en BD
      await this.guardarMensaje(conversacion.id, mensaje.id, textoMensaje, 'CLIENTE');

      // Obtener contexto actual
      const contexto: ConversacionContexto = conversacion.contexto
        ? JSON.parse(conversacion.contexto)
        : this.crearContextoInicial();

      // Agregar teléfono al contexto si no existe
      if (!contexto.datosTemp.clienteTelefono) {
        contexto.datosTemp.clienteTelefono = telefono;
      }

      // Procesar según el paso actual
      const respuesta = await this.procesarPaso(
        conversacion.paso as PasoConversacion,
        textoMensaje,
        contexto,
        telefono
      );

      // Enviar respuesta
      await this.enviarRespuesta(telefono, respuesta);

      // Actualizar conversación
      await this.actualizarConversacion(
        conversacion.id,
        respuesta.siguientePaso,
        {
          ...contexto.datosTemp,
          ...respuesta.actualizarContexto
        }
      );

      console.log(`✅ Mensaje procesado correctamente`);
    } catch (error) {
      console.error('❌ Error procesando mensaje:', error);
      await whatsappService.enviarMensajeTexto(telefono, MENSAJES.ERROR_SERVIDOR());
    }
  }

  /**
   * Procesar según el paso de la conversación
   */
  private async procesarPaso(
    paso: PasoConversacion,
    mensaje: string,
    contexto: ConversacionContexto,
    telefono: string
  ): Promise<BotResponse> {
    const mensajeLower = mensaje.toLowerCase().trim();

    switch (paso) {
      case 'INICIAL':
        return this.procesarInicial(mensajeLower);

      case 'MENU_PRINCIPAL':
        return await this.procesarMenuPrincipal(mensaje, contexto);

      case 'PUEDE_SERVIR_MAS':
        return this.procesarPuedeServirMas(mensajeLower);

      case 'ELIGIENDO_EMPLEADO':
        return await this.procesarSeleccionEmpleado(mensaje, contexto);

      case 'SOLICITANDO_NOMBRE':
        return this.procesarNombre(mensaje, telefono, contexto);

      case 'ELIGIENDO_FECHA':
        return await this.procesarSeleccionFecha(mensaje, contexto);

      case 'ELIGIENDO_HORA':
        return await this.procesarSeleccionHora(mensaje, contexto, telefono);

      case 'CANCELANDO_CITA':
        return await this.procesarCancelacion(mensaje, contexto, telefono);

      case 'SOLICITAR_RADICADO_CANCELAR':
        return await this.procesarRadicadoCancelar(mensaje, contexto, telefono);

      case 'CONFIRMAR_CANCELACION':
        return await this.procesarConfirmarCancelacion(mensaje, contexto, telefono);

      default:
        return {
          tipo: 'texto',
          mensaje: MENSAJES.OPCION_INVALIDA(),
          siguientePaso: 'INICIAL'
        };
    }
  }

  /**
   * PASO 1: Mensaje inicial - Mostrar menú
   */
  private procesarInicial(mensaje: string): BotResponse {
    return {
      tipo: 'texto',
      mensaje: MENSAJES.BIENVENIDA(CONFIG.nombreBarberia),
      siguientePaso: 'MENU_PRINCIPAL'
    };
  }

  /**
   * PASO 2: Procesar opción del menú principal
   */
  private async procesarMenuPrincipal(mensaje: string, contexto: ConversacionContexto): Promise<BotResponse> {
    const opcion = mensaje.trim();

    switch (opcion) {
      case '1': // Dónde estamos
        return {
          tipo: 'texto',
          mensaje: MENSAJES.UBICACION(CONFIG.direccion),
          siguientePaso: 'PUEDE_SERVIR_MAS'
        };

      case '2': // Lista de precios
        const servicios = await prisma.servicio.findMany({
          where: { activo: true },
          orderBy: { precio: 'asc' }
        });

        return {
          tipo: 'texto',
          mensaje: MENSAJES.LISTA_PRECIOS(servicios) + '\n\n' + MENSAJES.PUEDE_SERVIR_MAS(),
          siguientePaso: 'PUEDE_SERVIR_MAS'
        };

      case '3': // Agendar una cita
        const barberos = await prisma.empleado.findMany({
          where: { activo: true },
          orderBy: { nombre: 'asc' }
        });

        return {
          tipo: 'texto',
          mensaje: MENSAJES.ELEGIR_BARBERO(barberos),
          siguientePaso: 'ELIGIENDO_EMPLEADO'
        };

      case '4': // Cancelar una cita
        return {
          tipo: 'texto',
          mensaje: MENSAJES.SOLICITAR_RADICADO(),
          siguientePaso: 'CANCELANDO_CITA'
        };

      default:
        return {
          tipo: 'texto',
          mensaje: MENSAJES.OPCION_INVALIDA() + '\n\n' + MENSAJES.BIENVENIDA(CONFIG.nombreBarberia),
          siguientePaso: 'MENU_PRINCIPAL'
        };
    }
  }

  /**
   * PASO 3: ¿Puede servir en algo más?
   */
  private procesarPuedeServirMas(mensaje: string): BotResponse {
    if (mensaje === 'si' || mensaje === 'sí') {
      return {
        tipo: 'texto',
        mensaje: MENSAJES.BIENVENIDA(CONFIG.nombreBarberia),
        siguientePaso: 'MENU_PRINCIPAL'
      };
    }

    if (mensaje === 'no') {
      return {
        tipo: 'texto',
        mensaje: MENSAJES.DESPEDIDA(),
        siguientePaso: 'INICIAL'
      };
    }

    return {
      tipo: 'texto',
      mensaje: MENSAJES.OPCION_INVALIDA() + '\n\n' + MENSAJES.PUEDE_SERVIR_MAS(),
      siguientePaso: 'PUEDE_SERVIR_MAS'
    };
  }

  /**
   * PASO 4: Seleccionar barbero
   */
  private async procesarSeleccionEmpleado(mensaje: string, contexto: ConversacionContexto): Promise<BotResponse> {
    const opcion = parseInt(mensaje.trim());
    const barberos = await prisma.empleado.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' }
    });

    // Opción "Ninguno"
    if (mensaje.toLowerCase().includes('ninguno')) {
      return {
        tipo: 'texto',
        mensaje: MENSAJES.DESPEDIDA(),
        siguientePaso: 'INICIAL'
      };
    }

    // Validar opción
    if (!isNaN(opcion) && opcion > 0 && opcion <= barberos.length) {
      const barberoSeleccionado = barberos[opcion - 1];

      return {
        tipo: 'texto',
        mensaje: MENSAJES.SOLICITAR_NOMBRE_COMPLETO(),
        siguientePaso: 'SOLICITANDO_NOMBRE',
        actualizarContexto: {
          empleadoId: barberoSeleccionado.id,
          empleadoNombre: barberoSeleccionado.nombre
        }
      };
    }

    return {
      tipo: 'texto',
      mensaje: MENSAJES.OPCION_INVALIDA() + '\n\n' + MENSAJES.ELEGIR_BARBERO(barberos),
      siguientePaso: 'ELIGIENDO_EMPLEADO'
    };
  }

  /**
   * PASO 5: Solicitar nombre completo
   */
  private procesarNombre(mensaje: string, telefono: string, contexto: ConversacionContexto): BotResponse {
    // Validar nombre completo (al menos 2 palabras)
    if (!validarNombreCompleto(mensaje)) {
      return {
        tipo: 'texto',
        mensaje: MENSAJES.NOMBRE_INVALIDO(),
        siguientePaso: 'SOLICITANDO_NOMBRE'
      };
    }

    // Guardar/actualizar cliente
    this.guardarCliente(telefono, mensaje);

    return {
      tipo: 'texto',
      mensaje: MENSAJES.SOLICITAR_FECHA(),
      siguientePaso: 'ELIGIENDO_FECHA',
      actualizarContexto: {
        nombreCliente: mensaje
      }
    };
  }

  /**
   * PASO 6: Seleccionar fecha
   */
  private async procesarSeleccionFecha(mensaje: string, contexto: ConversacionContexto): Promise<BotResponse> {
    const mensajeLower = mensaje.toLowerCase().trim();
    let fecha: Date;

    if (mensajeLower === 'hoy') {
      fecha = new Date();
    } else if (mensajeLower === 'mañana' || mensajeLower === 'manana') {
      fecha = new Date();
      fecha.setDate(fecha.getDate() + 1);
    } else if (mensajeLower === 'pasado mañana' || mensajeLower === 'pasado manana') {
      fecha = new Date();
      fecha.setDate(fecha.getDate() + 2);
    } else {
      return {
        tipo: 'texto',
        mensaje: MENSAJES.OPCION_INVALIDA() + '\n\n' + MENSAJES.SOLICITAR_FECHA(),
        siguientePaso: 'ELIGIENDO_FECHA'
      };
    }

    // Enviar mensaje de "consultando..."
    await whatsappService.enviarMensajeTexto(
      contexto.datosTemp.clienteTelefono || '',
      MENSAJES.CONSULTANDO_AGENDA()
    );

    // Obtener horarios disponibles
    const horariosDisponibles = await this.obtenerHorariosDisponibles(
      contexto.datosTemp.empleadoId!,
      fecha.toISOString().split('T')[0]
    );

    if (horariosDisponibles.length === 0) {
      return {
        tipo: 'texto',
        mensaje: MENSAJES.NO_HAY_HORARIOS(),
        siguientePaso: 'ELIGIENDO_FECHA'
      };
    }

    // Formatear horarios con números
    const horariosFormateados = horariosDisponibles.map((hora, index) => ({
      numero: index + 1,
      hora: formatearHora(hora)
    }));

    return {
      tipo: 'texto',
      mensaje: MENSAJES.HORARIOS_DISPONIBLES(horariosFormateados),
      siguientePaso: 'ELIGIENDO_HORA',
      actualizarContexto: {
        fecha: fecha.toISOString().split('T')[0],
        horariosDisponibles: JSON.stringify(horariosDisponibles)
      }
    };
  }

  /**
   * PASO 7: Seleccionar hora
   */
  private async procesarSeleccionHora(
    mensaje: string,
    contexto: ConversacionContexto,
    telefono: string
  ): Promise<BotResponse> {
    const mensajeLower = mensaje.toLowerCase().trim();

    // Cancelar proceso
    if (mensajeLower === 'cancelar') {
      return {
        tipo: 'texto',
        mensaje: MENSAJES.DESPEDIDA(),
        siguientePaso: 'INICIAL'
      };
    }

    // Validar número de turno
    const opcion = parseInt(mensaje.trim());
    const horariosDisponibles = JSON.parse(contexto.datosTemp.horariosDisponibles || '[]');

    if (isNaN(opcion) || opcion < 1 || opcion > horariosDisponibles.length) {
      return {
        tipo: 'texto',
        mensaje: MENSAJES.OPCION_INVALIDA(),
        siguientePaso: 'ELIGIENDO_HORA'
      };
    }

    const horaSeleccionada = horariosDisponibles[opcion - 1];

    // Crear la cita
    const cliente = await prisma.cliente.findUnique({ where: { telefono } });
    if (!cliente) throw new Error('Cliente no encontrado');

    const empleado = await prisma.empleado.findUnique({
      where: { id: contexto.datosTemp.empleadoId }
    });
    if (!empleado) throw new Error('Empleado no encontrado');

    // Obtener primer servicio activo (o definir uno por defecto)
    const servicio = await prisma.servicio.findFirst({
      where: { activo: true }
    });

    const radicado = generarRadicado();
    const fechaHora = new Date(`${contexto.datosTemp.fecha}T${horaSeleccionada}:00`);

    await prisma.cita.create({
      data: {
        clienteId: cliente.id,
        empleadoId: empleado.id,
        servicioNombre: servicio?.nombre || 'Corte básico',
        fechaHora,
        duracionMinutos: servicio?.duracionMinutos || 30,
        estado: 'CONFIRMADA',
        origen: 'WHATSAPP',
        notas: `Radicado: ${radicado} - Agendado por WhatsApp Bot`
      }
    });

    return {
      tipo: 'texto',
      mensaje: MENSAJES.CITA_CONFIRMADA({
        radicado,
        servicio: servicio?.nombre || 'Corte básico',
        barbero: empleado.nombre,
        fecha: formatearFecha(fechaHora),
        hora: formatearHora(horaSeleccionada)
      }),
      siguientePaso: 'INICIAL'
    };
  }

  /**
   * PASO 8: Cancelar cita - Solicitar radicado
   */
  private async procesarCancelacion(
    mensaje: string,
    contexto: ConversacionContexto,
    telefono: string
  ): Promise<BotResponse> {
    const mensajeLower = mensaje.toLowerCase().trim();

    if (mensajeLower === 'sí' || mensajeLower === 'si') {
      return {
        tipo: 'texto',
        mensaje: MENSAJES.SOLICITAR_CODIGO_RADICADO(),
        siguientePaso: 'SOLICITAR_RADICADO_CANCELAR'
      };
    }

    if (mensajeLower === 'no') {
      return {
        tipo: 'texto',
        mensaje: MENSAJES.SIN_RADICADO() + '\n\n' + MENSAJES.DESPEDIDA(),
        siguientePaso: 'INICIAL'
      };
    }

    return {
      tipo: 'texto',
      mensaje: MENSAJES.OPCION_INVALIDA() + '\n\n' + MENSAJES.SOLICITAR_RADICADO(),
      siguientePaso: 'CANCELANDO_CITA'
    };
  }

  /**
   * PASO 9: Procesar código de radicado
   */
  private async procesarRadicadoCancelar(
    mensaje: string,
    contexto: ConversacionContexto,
    telefono: string
  ): Promise<BotResponse> {
    const radicado = mensaje.trim().toUpperCase();

    // Buscar cita por radicado (en las notas)
    const cita = await prisma.cita.findFirst({
      where: {
        notas: { contains: radicado },
        estado: { in: ['PENDIENTE', 'CONFIRMADA'] }
      },
      include: {
        empleado: true
      }
    });

    if (!cita) {
      return {
        tipo: 'texto',
        mensaje: MENSAJES.RADICADO_NO_ENCONTRADO(),
        siguientePaso: 'INICIAL'
      };
    }

    return {
      tipo: 'texto',
      mensaje: MENSAJES.CONFIRMAR_CANCELACION({
        radicado,
        servicio: cita.servicioNombre,
        fecha: formatearFecha(cita.fechaHora),
        hora: formatearHora(cita.fechaHora.toISOString().split('T')[1].substring(0, 5))
      }),
      siguientePaso: 'CONFIRMAR_CANCELACION',
      actualizarContexto: {
        citaId: cita.id
      }
    };
  }

  /**
   * PASO 10: Confirmar cancelación
   */
  private async procesarConfirmarCancelacion(
    mensaje: string,
    contexto: ConversacionContexto,
    telefono: string
  ): Promise<BotResponse> {
    const mensajeLower = mensaje.toLowerCase().trim();

    if (mensajeLower.includes('sí') || mensajeLower.includes('si') || mensajeLower.includes('cancelar')) {
      await prisma.cita.update({
        where: { id: contexto.datosTemp.citaId },
        data: {
          estado: 'CANCELADA',
          motivoCancelacion: 'Cancelada por el cliente vía WhatsApp'
        }
      });

      return {
        tipo: 'texto',
        mensaje: MENSAJES.CITA_CANCELADA(),
        siguientePaso: 'INICIAL'
      };
    }

    return {
      tipo: 'texto',
      mensaje: MENSAJES.DESPEDIDA(),
      siguientePaso: 'INICIAL'
    };
  }

  // ==================== HELPERS ====================

  private async obtenerConversacionActiva(telefono: string) {
    return await prisma.conversacion.findFirst({
      where: {
        clienteTelefono: telefono,
        estado: 'ACTIVA'
      },
      orderBy: { ultimoMensaje: 'desc' }
    });
  }

  private async crearNuevaConversacion(telefono: string, nombreContacto?: string) {
    return await prisma.conversacion.create({
      data: {
        clienteTelefono: telefono,
        estado: 'ACTIVA',
        paso: 'INICIAL',
        contexto: JSON.stringify(this.crearContextoInicial()),
        ultimoMensaje: new Date()
      }
    });
  }

  private crearContextoInicial(): ConversacionContexto {
    return {
      paso: 'INICIAL',
      datosTemp: {},
      intentos: 0
    };
  }

  private extraerTextoMensaje(mensaje: WhatsAppMessage): string {
    if (mensaje.type === 'text' && mensaje.text) {
      return mensaje.text.body;
    }
    
    if (mensaje.type === 'button' && mensaje.button) {
      return mensaje.button.text;
    }
    
    if (mensaje.type === 'interactive' && mensaje.interactive) {
      if (mensaje.interactive.button_reply) {
        return mensaje.interactive.button_reply.title;
      }
      if (mensaje.interactive.list_reply) {
        return mensaje.interactive.list_reply.title;
      }
    }
    
    return '';
  }

  private async guardarMensaje(
    conversacionId: string,
    waMessageId: string,
    mensaje: string,
    remitente: 'CLIENTE' | 'BOT'
  ) {
    await prisma.mensajeWhatsApp.create({
      data: {
        conversacionId,
        waMessageId,
        remitente,
        mensaje,
        tipo: 'TEXTO',
        timestamp: new Date()
      }
    });
  }

  private async enviarRespuesta(telefono: string, respuesta: BotResponse) {
    if (respuesta.tipo === 'texto') {
      await whatsappService.enviarMensajeTexto(telefono, respuesta.mensaje);
    }
  }

  private async actualizarConversacion(
    conversacionId: string,
    paso: PasoConversacion,
    datosTemp: any
  ) {
    const contexto: ConversacionContexto = {
      paso,
      datosTemp,
      intentos: 0
    };

    await prisma.conversacion.update({
      where: { id: conversacionId },
      data: {
        paso,
        contexto: JSON.stringify(contexto),
        ultimoMensaje: new Date()
      }
    });
  }

  private async guardarCliente(telefono: string, nombre: string) {
    const clienteExistente = await prisma.cliente.findUnique({
      where: { telefono }
    });

    if (clienteExistente) {
      if (clienteExistente.nombre !== nombre) {
        await prisma.cliente.update({
          where: { id: clienteExistente.id },
          data: { nombre }
        });
      }
      return clienteExistente;
    }

    return await prisma.cliente.create({
      data: {
        nombre,
        telefono,
        origen: 'WHATSAPP',
        activo: true
      }
    });
  }

  private async obtenerHorariosDisponibles(empleadoId: string, fecha: string): Promise<string[]> {
    const fechaObj = new Date(fecha);
    const diaSemana = fechaObj.getDay();
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
    const nombreDia = diasSemana[diaSemana];

    // Obtener empleado y su horario
    const empleado = await prisma.empleado.findUnique({
      where: { id: empleadoId }
    });

    if (!empleado) return [];

    // Obtener horario del día
    const campoHorario = `horario${nombreDia}` as keyof typeof empleado;
    const horarioDia = empleado[campoHorario];

    if (!horarioDia || typeof horarioDia !== 'string') return [];

    const horario = JSON.parse(horarioDia);
    if (!horario.inicio || !horario.fin) return [];

    // Obtener citas existentes del empleado ese día
    const inicioDelDia = new Date(fecha);
    inicioDelDia.setHours(0, 0, 0, 0);
    
    const finDelDia = new Date(fecha);
    finDelDia.setHours(23, 59, 59, 999);

    const citasExistentes = await prisma.cita.findMany({
      where: {
        empleadoId,
        fechaHora: {
          gte: inicioDelDia,
          lte: finDelDia
        },
        estado: {
          in: ['PENDIENTE', 'CONFIRMADA']
        }
      },
      select: {
        fechaHora: true,
        duracionMinutos: true
      }
    });

    // Generar horarios disponibles cada 30 minutos
    const horariosDisponibles: string[] = [];
    const [horaInicio, minInicio] = horario.inicio.split(':').map(Number);
    const [horaFin, minFin] = horario.fin.split(':').map(Number);

    let horaActual = horaInicio;
    let minActual = minInicio;

    while (
      horaActual < horaFin ||
      (horaActual === horaFin && minActual < minFin)
    ) {
      const horaString = `${horaActual.toString().padStart(2, '0')}:${minActual.toString().padStart(2, '0')}`;
      
      // Verificar si está ocupado
      const horarioOcupado = citasExistentes.some(cita => {
        const horaCita = new Date(cita.fechaHora);
        const horaFinCita = new Date(horaCita.getTime() + cita.duracionMinutos * 60000);
        
        const horaVerificar = new Date(fecha);
        horaVerificar.setHours(horaActual, minActual, 0, 0);
        
        return horaVerificar >= horaCita && horaVerificar < horaFinCita;
      });

      if (!horarioOcupado) {
        horariosDisponibles.push(horaString);
      }

      // Incrementar 30 minutos
      minActual += 30;
      if (minActual >= 60) {
        minActual = 0;
        horaActual += 1;
      }
    }

    return horariosDisponibles;
  }
}

export default new BotProcessor();
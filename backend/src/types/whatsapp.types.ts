// backend/src/types/whatsapp.types.ts

// ==================== WEBHOOK DE WHATSAPP ====================

export interface WhatsAppWebhookPayload {
  object: string;
  entry: WhatsAppEntry[];
}

export interface WhatsAppEntry {
  id: string;
  changes: WhatsAppChange[];
}

export interface WhatsAppChange {
  value: WhatsAppValue;
  field: string;
}

export interface WhatsAppValue {
  messaging_product: string;
  metadata: WhatsAppMetadata;
  contacts?: WhatsAppContact[];
  messages?: WhatsAppMessage[];
  statuses?: WhatsAppStatus[];
}

export interface WhatsAppMetadata {
  display_phone_number: string;
  phone_number_id: string;
}

export interface WhatsAppContact {
  profile: {
    name: string;
  };
  wa_id: string;
}

export interface WhatsAppMessage {
  from: string;
  id: string;
  timestamp: string;
  type: 'text' | 'image' | 'audio' | 'video' | 'document' | 'button' | 'interactive';
  text?: {
    body: string;
  };
  button?: {
    text: string;
    payload: string;
  };
  interactive?: {
    type: string;
    button_reply?: {
      id: string;
      title: string;
    };
    list_reply?: {
      id: string;
      title: string;
      description?: string;
    };
  };
  image?: {
    id: string;
    mime_type: string;
    sha256: string;
  };
}

export interface WhatsAppStatus {
  id: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  recipient_id: string;
}

// ==================== MENSAJES SALIENTES ====================

export interface WhatsAppTextMessage {
  messaging_product: 'whatsapp';
  recipient_type: 'individual';
  to: string;
  type: 'text';
  text: {
    preview_url: boolean;
    body: string;
  };
}

export interface WhatsAppButtonMessage {
  messaging_product: 'whatsapp';
  recipient_type: 'individual';
  to: string;
  type: 'interactive';
  interactive: {
    type: 'button';
    body: {
      text: string;
    };
    action: {
      buttons: Array<{
        type: 'reply';
        reply: {
          id: string;
          title: string;
        };
      }>;
    };
  };
}

export interface WhatsAppListMessage {
  messaging_product: 'whatsapp';
  recipient_type: 'individual';
  to: string;
  type: 'interactive';
  interactive: {
    type: 'list';
    header?: {
      type: 'text';
      text: string;
    };
    body: {
      text: string;
    };
    footer?: {
      text: string;
    };
    action: {
      button: string;
      sections: Array<{
        title: string;
        rows: Array<{
          id: string;
          title: string;
          description?: string;
        }>;
      }>;
    };
  };
}

// ==================== CONTEXTO DE CONVERSACIÓN ====================

export interface ConversacionContexto {
  paso: PasoConversacion;
  datosTemp: {
    clienteTelefono?: string;
    nombreCliente?: string;
    servicioId?: string;
    servicioNombre?: string;
    empleadoId?: string;
    empleadoNombre?: string;
    fecha?: string;
    hora?: string;
    horariosDisponibles?: string;
    citaId?: string;
    radicado?: string;
  };
  intentos: number;
  ultimaAccion?: string;
}

export type PasoConversacion =
  | 'INICIAL'
  | 'MENU_PRINCIPAL'
  | 'PUEDE_SERVIR_MAS'
  | 'ELIGIENDO_EMPLEADO'
  | 'SOLICITANDO_NOMBRE'
  | 'ELIGIENDO_FECHA'
  | 'ELIGIENDO_HORA'
  | 'CANCELANDO_CITA'
  | 'SOLICITAR_RADICADO_CANCELAR'
  | 'CONFIRMAR_CANCELACION'
  | 'CITA_CONFIRMADA'
  | 'ERROR';

// ==================== RESPUESTAS DEL BOT ====================

export interface BotResponse {
  tipo: 'texto' | 'botones' | 'lista';
  mensaje: string;
  opciones?: Array<{
    id: string;
    titulo: string;
    descripcion?: string;
  }>;
  siguientePaso: PasoConversacion;
  actualizarContexto?: Partial<ConversacionContexto['datosTemp']>;
}
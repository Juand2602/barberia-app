// backend/src/services/whatsapp/whatsapp.service.ts

import axios, { AxiosInstance } from 'axios';
import {
  WhatsAppTextMessage,
  WhatsAppButtonMessage,
  WhatsAppListMessage
} from '../../types/whatsapp.types';

class WhatsAppService {
  private api: AxiosInstance;
  private phoneNumberId: string;
  private accessToken: string;

  constructor() {
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';

    if (!this.phoneNumberId || !this.accessToken) {
      console.warn('⚠️  Credenciales de WhatsApp no configuradas');
    }

    this.api = axios.create({
      baseURL: `https://graph.facebook.com/v21.0/${this.phoneNumberId}`,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Enviar mensaje de texto simple
   */
  async enviarMensajeTexto(to: string, mensaje: string): Promise<any> {
    try {
      const payload: WhatsAppTextMessage = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'text',
        text: {
          preview_url: false,
          body: mensaje
        }
      };

      const response = await this.api.post('/messages', payload);
      console.log(`✅ Mensaje enviado a ${to}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error enviando mensaje:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Enviar mensaje con botones (máximo 3 botones)
   */
  async enviarMensajeBotones(
    to: string,
    mensaje: string,
    botones: Array<{ id: string; titulo: string }>
  ): Promise<any> {
    try {
      // WhatsApp solo permite máximo 3 botones
      const botonesFiltrados = botones.slice(0, 3);

      const payload: WhatsAppButtonMessage = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'interactive',
        interactive: {
          type: 'button',
          body: {
            text: mensaje
          },
          action: {
            buttons: botonesFiltrados.map(btn => ({
              type: 'reply',
              reply: {
                id: btn.id,
                title: btn.titulo.slice(0, 20) // Máximo 20 caracteres
              }
            }))
          }
        }
      };

      const response = await this.api.post('/messages', payload);
      console.log(`✅ Mensaje con botones enviado a ${to}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error enviando mensaje con botones:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Enviar mensaje con lista (menú desplegable)
   */
  async enviarMensajeLista(
    to: string,
    mensaje: string,
    tituloBoton: string,
    opciones: Array<{ id: string; titulo: string; descripcion?: string }>
  ): Promise<any> {
    try {
      const payload: WhatsAppListMessage = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'interactive',
        interactive: {
          type: 'list',
          body: {
            text: mensaje
          },
          action: {
            button: tituloBoton,
            sections: [
              {
                title: 'Opciones',
                rows: opciones.map(opt => ({
                  id: opt.id,
                  title: opt.titulo.slice(0, 24), // Máximo 24 caracteres
                  description: opt.descripcion?.slice(0, 72) // Máximo 72 caracteres
                }))
              }
            ]
          }
        }
      };

      const response = await this.api.post('/messages', payload);
      console.log(`✅ Mensaje con lista enviado a ${to}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error enviando mensaje con lista:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Marcar mensaje como leído
   */
  async marcarComoLeido(messageId: string): Promise<void> {
    try {
      await this.api.post('/messages', {
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId
      });
      console.log(`✅ Mensaje ${messageId} marcado como leído`);
    } catch (error: any) {
      console.error('❌ Error marcando mensaje como leído:', error.response?.data || error.message);
    }
  }

  /**
   * Verificar si las credenciales están configuradas
   */
  isConfigured(): boolean {
    return !!(this.phoneNumberId && this.accessToken);
  }
}

export default new WhatsAppService();
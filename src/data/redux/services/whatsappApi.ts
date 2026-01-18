import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// WhatsApp Business API types
export interface WhatsAppMessage {
  messaging_product: 'whatsapp';
  to: string;
  type: 'document' | 'text' | 'template';
  document?: {
    link: string;
    caption?: string;
    filename?: string;
  };
  text?: {
    body: string;
  };
  template?: {
    name: string;
    language: {
      code: string;
    };
    components?: any[];
  };
}

export interface PatientAccount {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  emergencyContact?: string;
  medicalHistory?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface WhatsAppResponse {
  messaging_product: string;
  contacts: Array<{
    input: string;
    wa_id: string;
  }>;
  messages: Array<{
    id: string;
  }>;
}

export const whatsappApi = createApi({
  reducerPath: 'whatsappApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://graph.facebook.com/v18.0/',
    prepareHeaders: (headers) => {
      // Replace with your WhatsApp Business API token
      const token = process.env.WHATSAPP_ACCESS_TOKEN || 'YOUR_WHATSAPP_ACCESS_TOKEN';
      headers.set('Authorization', `Bearer ${token}`);
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Patient'],
  endpoints: (builder) => ({
    // Send PDF document via WhatsApp
    sendPdfReport: builder.mutation<WhatsAppResponse, {
      phoneNumber: string;
      pdfUrl: string;
      patientName: string;
      reportType: string;
    }>({
      query: ({ phoneNumber, pdfUrl, patientName, reportType }) => {
        const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || 'YOUR_PHONE_NUMBER_ID';
        
        return {
          url: `${phoneNumberId}/messages`,
          method: 'POST',
          body: {
            messaging_product: 'whatsapp',
            to: phoneNumber,
            type: 'document',
            document: {
              link: pdfUrl,
              caption: `Dear ${patientName}, here is your ${reportType} report. Please keep it safe for your records.`,
              filename: `${reportType}_Report_${patientName.replace(/\s+/g, '_')}.pdf`
            }
          } as WhatsAppMessage,
        };
      },
    }),

    // Send text message
    sendTextMessage: builder.mutation<WhatsAppResponse, {
      phoneNumber: string;
      message: string;
    }>({
      query: ({ phoneNumber, message }) => {
        const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || 'YOUR_PHONE_NUMBER_ID';
        
        return {
          url: `${phoneNumberId}/messages`,
          method: 'POST',
          body: {
            messaging_product: 'whatsapp',
            to: phoneNumber,
            type: 'text',
            text: {
              body: message
            }
          } as WhatsAppMessage,
        };
      },
    }),

    // Send template message (for appointment reminders, etc.)
    sendTemplateMessage: builder.mutation<WhatsAppResponse, {
      phoneNumber: string;
      templateName: string;
      languageCode: string;
      parameters?: string[];
    }>({
      query: ({ phoneNumber, templateName, languageCode, parameters = [] }) => {
        const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || 'YOUR_PHONE_NUMBER_ID';
        
        return {
          url: `${phoneNumberId}/messages`,
          method: 'POST',
          body: {
            messaging_product: 'whatsapp',
            to: phoneNumber,
            type: 'template',
            template: {
              name: templateName,
              language: {
                code: languageCode
              },
              components: parameters.length > 0 ? [{
                type: 'body',
                parameters: parameters.map(param => ({
                  type: 'text',
                  text: param
                }))
              }] : undefined
            }
          } as WhatsAppMessage,
        };
      },
    }),
  }),
});

export const {
  useSendPdfReportMutation,
  useSendTextMessageMutation,
  useSendTemplateMessageMutation,
} = whatsappApi;
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface PatientAccount {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  emergencyContact?: string;
  emergencyContactName?: string;
  bloodGroup?: string;
  allergies?: string[];
  medicalHistory?: string[];
  currentMedications?: string[];
  doctorNotes?: string;
  profileImage?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePatientRequest {
  name: string;
  phone: string;
  email?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  emergencyContact?: string;
  emergencyContactName?: string;
  bloodGroup?: string;
  allergies?: string[];
  medicalHistory?: string[];
  currentMedications?: string[];
}

export interface UpdatePatientRequest extends Partial<CreatePatientRequest> {
  id: string;
}

export interface PatientReport {
  id?: string;
  patientId: string;
  reportType: string;
  reportDate: string;
  pdfUrl: string;
  doctorName?: string;
  notes?: string;
  isShared?: boolean;
  sharedAt?: string;
  createdAt?: string;
}

export const patientApi = createApi({
  reducerPath: 'patientApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://gbs-api.thankfulflower-dcee2acb.centralindia.azurecontainerapps.io/api/',
    prepareHeaders: (headers, { getState }) => {
      // Add authentication token if available
      const token = (getState() as any)?.auth?.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Patient', 'Report'],
  endpoints: (builder) => ({
    // Create new patient account
    createPatient: builder.mutation<PatientAccount, CreatePatientRequest>({
      query: (patientData) => ({
        url: 'patients',
        method: 'POST',
        body: patientData,
      }),
      invalidatesTags: ['Patient'],
    }),

    // Get all patients
    getPatients: builder.query<PatientAccount[], { page?: number; limit?: number; search?: string }>({
      query: ({ page = 1, limit = 20, search = '' }) => ({
        url: 'patients',
        params: { page, limit, search },
      }),
      providesTags: ['Patient'],
    }),

    // Get patient by ID
    getPatientById: builder.query<PatientAccount, string>({
      query: (id) => `patients/${id}`,
      providesTags: (result, error, id) => [{ type: 'Patient', id }],
    }),

    // Update patient
    updatePatient: builder.mutation<PatientAccount, UpdatePatientRequest>({
      query: ({ id, ...patch }) => ({
        url: `patients/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Patient', id }],
    }),

    // Delete patient
    deletePatient: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `patients/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Patient'],
    }),

    // Search patients by phone or name
    searchPatients: builder.query<PatientAccount[], string>({
      query: (searchTerm) => ({
        url: 'patients/search',
        params: { q: searchTerm },
      }),
      providesTags: ['Patient'],
    }),

    // Upload patient report
    uploadPatientReport: builder.mutation<PatientReport, {
      patientId: string;
      reportType: string;
      file: File | Blob;
      doctorName?: string;
      notes?: string;
    }>({
      query: ({ patientId, reportType, file, doctorName, notes }) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('patientId', patientId);
        formData.append('reportType', reportType);
        if (doctorName) formData.append('doctorName', doctorName);
        if (notes) formData.append('notes', notes);

        return {
          url: 'patients/reports',
          method: 'POST',
          body: formData,
          formData: true,
        };
      },
      invalidatesTags: ['Report'],
    }),

    // Get patient reports
    getPatientReports: builder.query<PatientReport[], string>({
      query: (patientId) => `patients/${patientId}/reports`,
      providesTags: ['Report'],
    }),

    // Share report via WhatsApp
    shareReportViaWhatsApp: builder.mutation<{ success: boolean; messageId: string }, {
      reportId: string;
      patientId: string;
      customMessage?: string;
    }>({
      query: ({ reportId, patientId, customMessage }) => ({
        url: 'patients/reports/share-whatsapp',
        method: 'POST',
        body: { reportId, patientId, customMessage },
      }),
      invalidatesTags: ['Report'],
    }),
  }),
});

export const {
  useCreatePatientMutation,
  useGetPatientsQuery,
  useGetPatientByIdQuery,
  useUpdatePatientMutation,
  useDeletePatientMutation,
  useSearchPatientsQuery,
  useUploadPatientReportMutation,
  useGetPatientReportsQuery,
  useShareReportViaWhatsAppMutation,
} = patientApi;
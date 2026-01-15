import z from "zod";

// Clinic schemas
export const ClinicSchema = z.object({
  id: z.number(),
  name: z.string(),
  cnpj: z.string().nullable(),
  address: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  phone: z.string().nullable(),
  owner_user_id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateClinicSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  cnpj: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  phone: z.string().optional(),
});

export const UpdateClinicSchema = CreateClinicSchema.partial();

export type Clinic = z.infer<typeof ClinicSchema>;
export type CreateClinic = z.infer<typeof CreateClinicSchema>;
export type UpdateClinic = z.infer<typeof UpdateClinicSchema>;

// Equipment schemas
export const EquipmentSchema = z.object({
  id: z.number(),
  clinic_id: z.number(),
  name: z.string(),
  category: z.string().nullable(),
  manufacturer: z.string().nullable(),
  model: z.string().nullable(),
  serial_number: z.string().nullable(),
  purchase_date: z.string().nullable(),
  calibration_date: z.string().nullable(),
  calibration_due_date: z.string().nullable(),
  responsible_technician: z.string().nullable(),
  notes: z.string().nullable(),
  manual_url: z.string().nullable(),
  invoice_url: z.string().nullable(),
  photo_url: z.string().nullable(),
  is_active: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateEquipmentSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  category: z.string().optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  serial_number: z.string().optional(),
  purchase_date: z.string().optional(),
  calibration_date: z.string().optional(),
  calibration_due_date: z.string().optional(),
  responsible_technician: z.string().optional(),
  notes: z.string().optional(),
  manual_url: z.string().optional(),
  invoice_url: z.string().optional(),
  photo_url: z.string().optional(),
});

export const UpdateEquipmentSchema = CreateEquipmentSchema.partial();

export type Equipment = z.infer<typeof EquipmentSchema>;
export type CreateEquipment = z.infer<typeof CreateEquipmentSchema>;
export type UpdateEquipment = z.infer<typeof UpdateEquipmentSchema>;

// Manual schemas
export const ManualSchema = z.object({
  id: z.number(),
  clinic_id: z.number(),
  title: z.string(),
  type: z.string(),
  content: z.string().nullable(),
  version: z.string().nullable(),
  status: z.string(),
  created_by: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateManualSchema = z.object({
  title: z.string().min(1),
  type: z.string().min(1),
  content: z.string().optional(),
  version: z.string().optional(),
  status: z.string().optional(),
});

export const UpdateManualSchema = CreateManualSchema.partial();

export type Manual = z.infer<typeof ManualSchema>;
export type CreateManual = z.infer<typeof CreateManualSchema>;
export type UpdateManual = z.infer<typeof UpdateManualSchema>;

// Routine Task schemas
export const RoutineTaskSchema = z.object({
  id: z.number(),
  clinic_id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  frequency: z.string(),
  responsible: z.string().nullable(),
  is_active: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateRoutineTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  frequency: z.string().min(1),
  responsible: z.string().optional(),
});

export const UpdateRoutineTaskSchema = CreateRoutineTaskSchema.partial();

export type RoutineTask = z.infer<typeof RoutineTaskSchema>;
export type CreateRoutineTask = z.infer<typeof CreateRoutineTaskSchema>;
export type UpdateRoutineTask = z.infer<typeof UpdateRoutineTaskSchema>;

// Routine Checkin schemas
export const RoutineCheckinSchema = z.object({
  id: z.number(),
  task_id: z.number(),
  completed_by: z.string(),
  completed_at: z.string(),
  notes: z.string().nullable(),
  photo_url: z.string().nullable(),
  batch_number: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateRoutineCheckinSchema = z.object({
  completed_at: z.string(),
  notes: z.string().optional(),
  photo_url: z.string().optional(),
  batch_number: z.string().optional(),
});

export type RoutineCheckin = z.infer<typeof RoutineCheckinSchema>;
export type CreateRoutineCheckin = z.infer<typeof CreateRoutineCheckinSchema>;

// Waste Management Plan schemas
export const WasteManagementPlanSchema = z.object({
  id: z.number(),
  clinic_id: z.number(),
  plan_data: z.string(),
  floor_plan_url: z.string().nullable(),
  status: z.string(),
  created_by: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateWasteManagementPlanSchema = z.object({
  plan_data: z.string(),
  floor_plan_url: z.string().optional(),
  status: z.string().optional(),
});

export const UpdateWasteManagementPlanSchema = CreateWasteManagementPlanSchema.partial();

export type WasteManagementPlan = z.infer<typeof WasteManagementPlanSchema>;
export type CreateWasteManagementPlan = z.infer<typeof CreateWasteManagementPlanSchema>;
export type UpdateWasteManagementPlan = z.infer<typeof UpdateWasteManagementPlanSchema>;

// Partner schemas
export const PartnerSchema = z.object({
  id: z.number(),
  name: z.string(),
  category: z.string(),
  description: z.string().nullable(),
  contact_email: z.string().nullable(),
  contact_phone: z.string().nullable(),
  website: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  discount_code: z.string().nullable(),
  commission_rate: z.number().nullable(),
  is_active: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Partner = z.infer<typeof PartnerSchema>;

// Health Document schemas
export const HealthDocumentSchema = z.object({
  id: z.number(),
  clinic_id: z.number(),
  document_type: z.string(),
  document_url: z.string().nullable(),
  expiry_date: z.string().nullable(),
  partner_id: z.number().nullable(),
  notes: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateHealthDocumentSchema = z.object({
  document_type: z.string().min(1),
  document_url: z.string().optional(),
  expiry_date: z.string().optional(),
  partner_id: z.number().optional(),
  notes: z.string().optional(),
});

export const UpdateHealthDocumentSchema = CreateHealthDocumentSchema.partial();

export type HealthDocument = z.infer<typeof HealthDocumentSchema>;
export type CreateHealthDocument = z.infer<typeof CreateHealthDocumentSchema>;
export type UpdateHealthDocument = z.infer<typeof UpdateHealthDocumentSchema>;

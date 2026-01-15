import { Hono } from "hono";
import { cors } from "hono/cors";
import {
  exchangeCodeForSessionToken,
  getOAuthRedirectUrl,
  authMiddleware,
  deleteSession,
  MOCHA_SESSION_TOKEN_COOKIE_NAME,
} from "@getmocha/users-service/backend";
import { getCookie, setCookie } from "hono/cookie";
import {
  ClinicSchema,
  CreateClinicSchema,
  UpdateClinicSchema,
  EquipmentSchema,
  CreateEquipmentSchema,
  UpdateEquipmentSchema,
  ManualSchema,
  CreateManualSchema,
  UpdateManualSchema,
  RoutineTaskSchema,
  CreateRoutineTaskSchema,
  RoutineCheckinSchema,
  CreateRoutineCheckinSchema,
  WasteManagementPlanSchema,
  CreateWasteManagementPlanSchema,
  UpdateWasteManagementPlanSchema,
  HealthDocumentSchema,
  CreateHealthDocumentSchema,
} from "@/shared/types";

const app = new Hono<{ Bindings: Env }>();

app.use("*", cors());

// Auth endpoints
app.get("/api/oauth/google/redirect_url", async (c) => {
  const redirectUrl = await getOAuthRedirectUrl("google", {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  return c.json({ redirectUrl }, 200);
});

app.post("/api/sessions", async (c) => {
  const body = await c.req.json();

  if (!body.code) {
    return c.json({ error: "No authorization code provided" }, 400);
  }

  const sessionToken = await exchangeCodeForSessionToken(body.code, {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true,
    maxAge: 60 * 24 * 60 * 60,
  });

  return c.json({ success: true }, 200);
});

app.get("/api/users/me", authMiddleware, async (c) => {
  return c.json(c.get("user"));
});

app.get("/api/logout", async (c) => {
  const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);

  if (typeof sessionToken === "string") {
    await deleteSession(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
    });
  }

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, "", {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true,
    maxAge: 0,
  });

  return c.json({ success: true }, 200);
});

// Clinics endpoints
app.get("/api/clinics", authMiddleware, async (c) => {
  const user = c.get("user")!;

  const { results } = await c.env.DB.prepare(
    "SELECT * FROM clinics WHERE owner_user_id = ? ORDER BY created_at DESC"
  )
    .bind(user.id)
    .all();

  return c.json(results);
});

app.post("/api/clinics", authMiddleware, async (c) => {
  const user = c.get("user")!;
  const body = await c.req.json();

  const validatedData = CreateClinicSchema.parse(body);

  const result = await c.env.DB.prepare(
    `INSERT INTO clinics (name, cnpj, address, city, state, phone, owner_user_id, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
  )
    .bind(
      validatedData.name,
      validatedData.cnpj || null,
      validatedData.address || null,
      validatedData.city || null,
      validatedData.state || null,
      validatedData.phone || null,
      user.id
    )
    .run();

  const clinic = await c.env.DB.prepare("SELECT * FROM clinics WHERE id = ?")
    .bind(result.meta.last_row_id)
    .first();

  return c.json(ClinicSchema.parse(clinic), 201);
});

app.get("/api/clinics/:id", authMiddleware, async (c) => {
  const user = c.get("user")!;
  const clinicId = c.req.param("id");

  const clinic = await c.env.DB.prepare(
    "SELECT * FROM clinics WHERE id = ? AND owner_user_id = ?"
  )
    .bind(clinicId, user.id)
    .first();

  if (!clinic) {
    return c.json({ error: "Clínica não encontrada" }, 404);
  }

  return c.json(ClinicSchema.parse(clinic));
});

app.put("/api/clinics/:id", authMiddleware, async (c) => {
  const user = c.get("user")!;
  const clinicId = c.req.param("id");
  const body = await c.req.json();

  const clinic = await c.env.DB.prepare(
    "SELECT * FROM clinics WHERE id = ? AND owner_user_id = ?"
  )
    .bind(clinicId, user.id)
    .first();

  if (!clinic) {
    return c.json({ error: "Clínica não encontrada" }, 404);
  }

  const validatedData = UpdateClinicSchema.parse(body);

  const updates: string[] = [];
  const values: any[] = [];

  if (validatedData.name !== undefined) {
    updates.push("name = ?");
    values.push(validatedData.name);
  }
  if (validatedData.cnpj !== undefined) {
    updates.push("cnpj = ?");
    values.push(validatedData.cnpj || null);
  }
  if (validatedData.address !== undefined) {
    updates.push("address = ?");
    values.push(validatedData.address || null);
  }
  if (validatedData.city !== undefined) {
    updates.push("city = ?");
    values.push(validatedData.city || null);
  }
  if (validatedData.state !== undefined) {
    updates.push("state = ?");
    values.push(validatedData.state || null);
  }
  if (validatedData.phone !== undefined) {
    updates.push("phone = ?");
    values.push(validatedData.phone || null);
  }

  if (updates.length > 0) {
    updates.push("updated_at = CURRENT_TIMESTAMP");
    values.push(clinicId);

    await c.env.DB.prepare(
      `UPDATE clinics SET ${updates.join(", ")} WHERE id = ?`
    )
      .bind(...values)
      .run();
  }

  const updatedClinic = await c.env.DB.prepare(
    "SELECT * FROM clinics WHERE id = ?"
  )
    .bind(clinicId)
    .first();

  return c.json(ClinicSchema.parse(updatedClinic));
});

// Equipment endpoints
app.get("/api/clinics/:clinicId/equipment", authMiddleware, async (c) => {
  const user = c.get("user")!;
  const clinicId = c.req.param("clinicId");

  const clinic = await c.env.DB.prepare(
    "SELECT * FROM clinics WHERE id = ? AND owner_user_id = ?"
  )
    .bind(clinicId, user.id)
    .first();

  if (!clinic) {
    return c.json({ error: "Clínica não encontrada" }, 404);
  }

  const { results } = await c.env.DB.prepare(
    "SELECT * FROM equipment WHERE clinic_id = ? AND is_active = 1 ORDER BY created_at DESC"
  )
    .bind(clinicId)
    .all();

  return c.json(results);
});

app.post("/api/clinics/:clinicId/equipment", authMiddleware, async (c) => {
  const user = c.get("user")!;
  const clinicId = c.req.param("clinicId");
  const body = await c.req.json();

  const clinic = await c.env.DB.prepare(
    "SELECT * FROM clinics WHERE id = ? AND owner_user_id = ?"
  )
    .bind(clinicId, user.id)
    .first();

  if (!clinic) {
    return c.json({ error: "Clínica não encontrada" }, 404);
  }

  const validatedData = CreateEquipmentSchema.parse(body);

  const result = await c.env.DB.prepare(
    `INSERT INTO equipment (
      clinic_id, name, category, manufacturer, model, serial_number,
      purchase_date, calibration_date, calibration_due_date,
      responsible_technician, notes, manual_url, invoice_url, photo_url, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
  )
    .bind(
      clinicId,
      validatedData.name,
      validatedData.category || null,
      validatedData.manufacturer || null,
      validatedData.model || null,
      validatedData.serial_number || null,
      validatedData.purchase_date || null,
      validatedData.calibration_date || null,
      validatedData.calibration_due_date || null,
      validatedData.responsible_technician || null,
      validatedData.notes || null,
      validatedData.manual_url || null,
      validatedData.invoice_url || null,
      validatedData.photo_url || null
    )
    .run();

  const equipment = await c.env.DB.prepare(
    "SELECT * FROM equipment WHERE id = ?"
  )
    .bind(result.meta.last_row_id)
    .first();

  return c.json(EquipmentSchema.parse(equipment), 201);
});

app.get("/api/equipment/:id", authMiddleware, async (c) => {
  const user = c.get("user")!;
  const equipmentId = c.req.param("id");

  const equipment = await c.env.DB.prepare(
    `SELECT e.* FROM equipment e
     INNER JOIN clinics c ON e.clinic_id = c.id
     WHERE e.id = ? AND c.owner_user_id = ?`
  )
    .bind(equipmentId, user.id)
    .first();

  if (!equipment) {
    return c.json({ error: "Equipamento não encontrado" }, 404);
  }

  return c.json(EquipmentSchema.parse(equipment));
});

app.put("/api/equipment/:id", authMiddleware, async (c) => {
  const user = c.get("user")!;
  const equipmentId = c.req.param("id");
  const body = await c.req.json();

  const equipment = await c.env.DB.prepare(
    `SELECT e.* FROM equipment e
     INNER JOIN clinics c ON e.clinic_id = c.id
     WHERE e.id = ? AND c.owner_user_id = ?`
  )
    .bind(equipmentId, user.id)
    .first();

  if (!equipment) {
    return c.json({ error: "Equipamento não encontrado" }, 404);
  }

  const validatedData = UpdateEquipmentSchema.parse(body);

  const updates: string[] = [];
  const values: any[] = [];

  Object.entries(validatedData).forEach(([key, value]) => {
    updates.push(`${key} = ?`);
    values.push(value || null);
  });

  if (updates.length > 0) {
    updates.push("updated_at = CURRENT_TIMESTAMP");
    values.push(equipmentId);

    await c.env.DB.prepare(
      `UPDATE equipment SET ${updates.join(", ")} WHERE id = ?`
    )
      .bind(...values)
      .run();
  }

  const updatedEquipment = await c.env.DB.prepare(
    "SELECT * FROM equipment WHERE id = ?"
  )
    .bind(equipmentId)
    .first();

  return c.json(EquipmentSchema.parse(updatedEquipment));
});

app.delete("/api/equipment/:id", authMiddleware, async (c) => {
  const user = c.get("user")!;
  const equipmentId = c.req.param("id");

  const equipment = await c.env.DB.prepare(
    `SELECT e.* FROM equipment e
     INNER JOIN clinics c ON e.clinic_id = c.id
     WHERE e.id = ? AND c.owner_user_id = ?`
  )
    .bind(equipmentId, user.id)
    .first();

  if (!equipment) {
    return c.json({ error: "Equipamento não encontrado" }, 404);
  }

  await c.env.DB.prepare("UPDATE equipment SET is_active = 0 WHERE id = ?")
    .bind(equipmentId)
    .run();

  return c.json({ success: true });
});

// Manuals endpoints
app.get("/api/clinics/:clinicId/manuals", authMiddleware, async (c) => {
  const user = c.get("user")!;
  const clinicId = c.req.param("clinicId");

  const clinic = await c.env.DB.prepare(
    "SELECT * FROM clinics WHERE id = ? AND owner_user_id = ?"
  )
    .bind(clinicId, user.id)
    .first();

  if (!clinic) {
    return c.json({ error: "Clínica não encontrada" }, 404);
  }

  const { results } = await c.env.DB.prepare(
    "SELECT * FROM manuals WHERE clinic_id = ? ORDER BY created_at DESC"
  )
    .bind(clinicId)
    .all();

  return c.json(results);
});

app.post("/api/clinics/:clinicId/manuals", authMiddleware, async (c) => {
  const user = c.get("user")!;
  const clinicId = c.req.param("clinicId");
  const body = await c.req.json();

  const clinic = await c.env.DB.prepare(
    "SELECT * FROM clinics WHERE id = ? AND owner_user_id = ?"
  )
    .bind(clinicId, user.id)
    .first();

  if (!clinic) {
    return c.json({ error: "Clínica não encontrada" }, 404);
  }

  const validatedData = CreateManualSchema.parse(body);

  const result = await c.env.DB.prepare(
    `INSERT INTO manuals (clinic_id, title, type, content, version, status, created_by, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
  )
    .bind(
      clinicId,
      validatedData.title,
      validatedData.type,
      validatedData.content || null,
      validatedData.version || "1.0",
      validatedData.status || "draft",
      user.id
    )
    .run();

  const manual = await c.env.DB.prepare("SELECT * FROM manuals WHERE id = ?")
    .bind(result.meta.last_row_id)
    .first();

  return c.json(ManualSchema.parse(manual), 201);
});

app.get("/api/manuals/:id", authMiddleware, async (c) => {
  const user = c.get("user")!;
  const manualId = c.req.param("id");

  const manual = await c.env.DB.prepare(
    `SELECT m.* FROM manuals m
     INNER JOIN clinics c ON m.clinic_id = c.id
     WHERE m.id = ? AND c.owner_user_id = ?`
  )
    .bind(manualId, user.id)
    .first();

  if (!manual) {
    return c.json({ error: "Manual não encontrado" }, 404);
  }

  return c.json(ManualSchema.parse(manual));
});

app.put("/api/manuals/:id", authMiddleware, async (c) => {
  const user = c.get("user")!;
  const manualId = c.req.param("id");
  const body = await c.req.json();

  const manual = await c.env.DB.prepare(
    `SELECT m.* FROM manuals m
     INNER JOIN clinics c ON m.clinic_id = c.id
     WHERE m.id = ? AND c.owner_user_id = ?`
  )
    .bind(manualId, user.id)
    .first();

  if (!manual) {
    return c.json({ error: "Manual não encontrado" }, 404);
  }

  const validatedData = UpdateManualSchema.parse(body);

  const updates: string[] = [];
  const values: any[] = [];

  Object.entries(validatedData).forEach(([key, value]) => {
    updates.push(`${key} = ?`);
    values.push(value || null);
  });

  if (updates.length > 0) {
    updates.push("updated_at = CURRENT_TIMESTAMP");
    values.push(manualId);

    await c.env.DB.prepare(
      `UPDATE manuals SET ${updates.join(", ")} WHERE id = ?`
    )
      .bind(...values)
      .run();
  }

  const updatedManual = await c.env.DB.prepare(
    "SELECT * FROM manuals WHERE id = ?"
  )
    .bind(manualId)
    .first();

  return c.json(ManualSchema.parse(updatedManual));
});

app.delete("/api/manuals/:id", authMiddleware, async (c) => {
  const user = c.get("user")!;
  const manualId = c.req.param("id");

  const manual = await c.env.DB.prepare(
    `SELECT m.* FROM manuals m
     INNER JOIN clinics c ON m.clinic_id = c.id
     WHERE m.id = ? AND c.owner_user_id = ?`
  )
    .bind(manualId, user.id)
    .first();

  if (!manual) {
    return c.json({ error: "Manual não encontrado" }, 404);
  }

  await c.env.DB.prepare("DELETE FROM manuals WHERE id = ?")
    .bind(manualId)
    .run();

  return c.json({ success: true });
});

// Routine Tasks endpoints
app.get("/api/clinics/:clinicId/routine-tasks", authMiddleware, async (c) => {
  const user = c.get("user")!;
  const clinicId = c.req.param("clinicId");

  const clinic = await c.env.DB.prepare(
    "SELECT * FROM clinics WHERE id = ? AND owner_user_id = ?"
  )
    .bind(clinicId, user.id)
    .first();

  if (!clinic) {
    return c.json({ error: "Clínica não encontrada" }, 404);
  }

  const { results } = await c.env.DB.prepare(
    "SELECT * FROM routine_tasks WHERE clinic_id = ? AND is_active = 1 ORDER BY created_at DESC"
  )
    .bind(clinicId)
    .all();

  return c.json(results);
});

app.post("/api/clinics/:clinicId/routine-tasks", authMiddleware, async (c) => {
  const user = c.get("user")!;
  const clinicId = c.req.param("clinicId");
  const body = await c.req.json();

  const clinic = await c.env.DB.prepare(
    "SELECT * FROM clinics WHERE id = ? AND owner_user_id = ?"
  )
    .bind(clinicId, user.id)
    .first();

  if (!clinic) {
    return c.json({ error: "Clínica não encontrada" }, 404);
  }

  const validatedData = CreateRoutineTaskSchema.parse(body);

  const result = await c.env.DB.prepare(
    `INSERT INTO routine_tasks (clinic_id, title, description, frequency, responsible, updated_at)
     VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
  )
    .bind(
      clinicId,
      validatedData.title,
      validatedData.description || null,
      validatedData.frequency,
      validatedData.responsible || null
    )
    .run();

  const task = await c.env.DB.prepare("SELECT * FROM routine_tasks WHERE id = ?")
    .bind(result.meta.last_row_id)
    .first();

  return c.json(RoutineTaskSchema.parse(task), 201);
});

app.get("/api/routine-tasks/:taskId/checkins", authMiddleware, async (c) => {
  const user = c.get("user")!;
  const taskId = c.req.param("taskId");

  const task = await c.env.DB.prepare(
    `SELECT rt.* FROM routine_tasks rt
     INNER JOIN clinics c ON rt.clinic_id = c.id
     WHERE rt.id = ? AND c.owner_user_id = ?`
  )
    .bind(taskId, user.id)
    .first();

  if (!task) {
    return c.json({ error: "Tarefa não encontrada" }, 404);
  }

  const { results } = await c.env.DB.prepare(
    "SELECT * FROM routine_checkins WHERE task_id = ? ORDER BY completed_at DESC LIMIT 50"
  )
    .bind(taskId)
    .all();

  return c.json(results);
});

app.post("/api/routine-tasks/:taskId/checkins", authMiddleware, async (c) => {
  const user = c.get("user")!;
  const taskId = c.req.param("taskId");
  const body = await c.req.json();

  const task = await c.env.DB.prepare(
    `SELECT rt.* FROM routine_tasks rt
     INNER JOIN clinics c ON rt.clinic_id = c.id
     WHERE rt.id = ? AND c.owner_user_id = ?`
  )
    .bind(taskId, user.id)
    .first();

  if (!task) {
    return c.json({ error: "Tarefa não encontrada" }, 404);
  }

  const validatedData = CreateRoutineCheckinSchema.parse(body);

  const result = await c.env.DB.prepare(
    `INSERT INTO routine_checkins (task_id, completed_by, completed_at, notes, photo_url, batch_number, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
  )
    .bind(
      taskId,
      user.id,
      validatedData.completed_at,
      validatedData.notes || null,
      validatedData.photo_url || null,
      validatedData.batch_number || null
    )
    .run();

  const checkin = await c.env.DB.prepare("SELECT * FROM routine_checkins WHERE id = ?")
    .bind(result.meta.last_row_id)
    .first();

  return c.json(RoutineCheckinSchema.parse(checkin), 201);
});

// Waste Management Plans endpoints
app.get("/api/clinics/:clinicId/waste-plan", authMiddleware, async (c) => {
  const user = c.get("user")!;
  const clinicId = c.req.param("clinicId");

  const clinic = await c.env.DB.prepare(
    "SELECT * FROM clinics WHERE id = ? AND owner_user_id = ?"
  )
    .bind(clinicId, user.id)
    .first();

  if (!clinic) {
    return c.json({ error: "Clínica não encontrada" }, 404);
  }

  const plan = await c.env.DB.prepare(
    "SELECT * FROM waste_management_plans WHERE clinic_id = ? ORDER BY created_at DESC LIMIT 1"
  )
    .bind(clinicId)
    .first();

  if (!plan) {
    return c.json(null);
  }

  return c.json(WasteManagementPlanSchema.parse(plan));
});

app.post("/api/clinics/:clinicId/waste-plan", authMiddleware, async (c) => {
  const user = c.get("user")!;
  const clinicId = c.req.param("clinicId");
  const body = await c.req.json();

  const clinic = await c.env.DB.prepare(
    "SELECT * FROM clinics WHERE id = ? AND owner_user_id = ?"
  )
    .bind(clinicId, user.id)
    .first();

  if (!clinic) {
    return c.json({ error: "Clínica não encontrada" }, 404);
  }

  const validatedData = CreateWasteManagementPlanSchema.parse(body);

  const result = await c.env.DB.prepare(
    `INSERT INTO waste_management_plans (clinic_id, plan_data, floor_plan_url, status, created_by, updated_at)
     VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
  )
    .bind(
      clinicId,
      validatedData.plan_data,
      validatedData.floor_plan_url || null,
      validatedData.status || "draft",
      user.id
    )
    .run();

  const plan = await c.env.DB.prepare("SELECT * FROM waste_management_plans WHERE id = ?")
    .bind(result.meta.last_row_id)
    .first();

  return c.json(WasteManagementPlanSchema.parse(plan), 201);
});

app.put("/api/waste-plan/:id", authMiddleware, async (c) => {
  const user = c.get("user")!;
  const planId = c.req.param("id");
  const body = await c.req.json();

  const plan = await c.env.DB.prepare(
    `SELECT wmp.* FROM waste_management_plans wmp
     INNER JOIN clinics c ON wmp.clinic_id = c.id
     WHERE wmp.id = ? AND c.owner_user_id = ?`
  )
    .bind(planId, user.id)
    .first();

  if (!plan) {
    return c.json({ error: "Plano não encontrado" }, 404);
  }

  const validatedData = UpdateWasteManagementPlanSchema.parse(body);

  const updates: string[] = [];
  const values: any[] = [];

  Object.entries(validatedData).forEach(([key, value]) => {
    updates.push(`${key} = ?`);
    values.push(value || null);
  });

  if (updates.length > 0) {
    updates.push("updated_at = CURRENT_TIMESTAMP");
    values.push(planId);

    await c.env.DB.prepare(
      `UPDATE waste_management_plans SET ${updates.join(", ")} WHERE id = ?`
    )
      .bind(...values)
      .run();
  }

  const updatedPlan = await c.env.DB.prepare(
    "SELECT * FROM waste_management_plans WHERE id = ?"
  )
    .bind(planId)
    .first();

  return c.json(WasteManagementPlanSchema.parse(updatedPlan));
});

// Partners endpoints
app.get("/api/partners", authMiddleware, async (c) => {
  const category = c.req.query("category");

  let query = "SELECT * FROM partners WHERE is_active = 1";
  const params: any[] = [];

  if (category) {
    query += " AND category = ?";
    params.push(category);
  }

  query += " ORDER BY name";

  const { results } = await c.env.DB.prepare(query)
    .bind(...params)
    .all();

  return c.json(results);
});

// Health Documents endpoints
app.get("/api/clinics/:clinicId/health-documents", authMiddleware, async (c) => {
  const user = c.get("user")!;
  const clinicId = c.req.param("clinicId");

  const clinic = await c.env.DB.prepare(
    "SELECT * FROM clinics WHERE id = ? AND owner_user_id = ?"
  )
    .bind(clinicId, user.id)
    .first();

  if (!clinic) {
    return c.json({ error: "Clínica não encontrada" }, 404);
  }

  const { results } = await c.env.DB.prepare(
    "SELECT * FROM health_documents WHERE clinic_id = ? ORDER BY created_at DESC"
  )
    .bind(clinicId)
    .all();

  return c.json(results);
});

app.post("/api/clinics/:clinicId/health-documents", authMiddleware, async (c) => {
  const user = c.get("user")!;
  const clinicId = c.req.param("clinicId");
  const body = await c.req.json();

  const clinic = await c.env.DB.prepare(
    "SELECT * FROM clinics WHERE id = ? AND owner_user_id = ?"
  )
    .bind(clinicId, user.id)
    .first();

  if (!clinic) {
    return c.json({ error: "Clínica não encontrada" }, 404);
  }

  const validatedData = CreateHealthDocumentSchema.parse(body);

  const result = await c.env.DB.prepare(
    `INSERT INTO health_documents (clinic_id, document_type, document_url, expiry_date, partner_id, notes, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
  )
    .bind(
      clinicId,
      validatedData.document_type,
      validatedData.document_url || null,
      validatedData.expiry_date || null,
      validatedData.partner_id || null,
      validatedData.notes || null
    )
    .run();

  const document = await c.env.DB.prepare("SELECT * FROM health_documents WHERE id = ?")
    .bind(result.meta.last_row_id)
    .first();

  return c.json(HealthDocumentSchema.parse(document), 201);
});

export default app;

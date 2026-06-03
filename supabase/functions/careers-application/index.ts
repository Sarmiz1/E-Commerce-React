import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const cloudName = Deno.env.get("CLOUDINARY_CLOUD_NAME");
const cloudinaryApiKey = Deno.env.get("CLOUDINARY_API_KEY");
const cloudinaryApiSecret = Deno.env.get("CLOUDINARY_API_SECRET");

const CAREERS_FOLDER = "woosho/careers";
const MAX_DOCUMENT_BYTES = 5 * 1024 * 1024;
const ALLOWED_DOCUMENTS = {
  pdf: new Set(["application/pdf"]),
  doc: new Set(["application/msword", "application/octet-stream"]),
  docx: new Set([
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/zip",
    "application/octet-stream",
  ]),
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

const serviceClient = () => createClient(supabaseUrl!, serviceRoleKey!, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

function cleanText(value: unknown, maxLength = 5000) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function safeFilename(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\w.\- ]+/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 120) || "document";
}

function extensionOf(filename: string) {
  return filename.toLowerCase().split(".").pop() || "";
}

function isPrivateIpv4(hostname: string) {
  const parts = hostname.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return false;
  }
  return parts[0] === 10
    || parts[0] === 127
    || parts[0] === 0
    || (parts[0] === 169 && parts[1] === 254)
    || (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31)
    || (parts[0] === 192 && parts[1] === 168);
}

function isSafePublicHttpsUrl(value: unknown) {
  if (!value) return true;
  try {
    const url = new URL(String(value));
    const hostname = url.hostname.toLowerCase();
    return url.protocol === "https:"
      && !url.username
      && !url.password
      && !["localhost", "::1", "[::1]"].includes(hostname)
      && !hostname.endsWith(".local")
      && !isPrivateIpv4(hostname);
  } catch {
    return false;
  }
}

async function matchesDocumentSignature(file: File, extension: string) {
  const bytes = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  if (extension === "pdf") {
    return String.fromCharCode(...bytes.slice(0, 5)) === "%PDF-";
  }
  if (extension === "doc") {
    return [0xd0, 0xcf, 0x11, 0xe0].every((value, index) => bytes[index] === value);
  }
  if (extension === "docx") {
    return bytes[0] === 0x50 && bytes[1] === 0x4b;
  }
  return false;
}

async function validateDocument(file: File, label: string) {
  const extension = extensionOf(file.name);
  const acceptedMimeTypes = ALLOWED_DOCUMENTS[extension as keyof typeof ALLOWED_DOCUMENTS];

  if (!acceptedMimeTypes || !acceptedMimeTypes.has(file.type || "application/octet-stream")) {
    throw new Error(`${label} must be a PDF, DOC, or DOCX document`);
  }
  if (!file.size || file.size > MAX_DOCUMENT_BYTES) {
    throw new Error(`${label} must be 5MB or smaller`);
  }
  if (!await matchesDocumentSignature(file, extension)) {
    throw new Error(`${label} content does not match its file extension`);
  }

  return {
    extension,
    filename: safeFilename(file.name),
    mimeType: file.type || "application/octet-stream",
  };
}

async function sha1(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-1", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function signCloudinaryParams(params: Record<string, string>) {
  const serialized = Object.entries(params)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  return sha1(`${serialized}${cloudinaryApiSecret}`);
}

async function uploadDocument(applicationId: string, kind: string, file: File) {
  const validation = await validateDocument(file, kind === "cv" ? "CV" : "Cover letter");
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const publicId = `${CAREERS_FOLDER}/${applicationId}/${kind}.${validation.extension}`;
  const params = {
    invalidate: "true",
    overwrite: "true",
    public_id: publicId,
    timestamp,
  };
  const formData = new FormData();
  const signature = await signCloudinaryParams(params);

  formData.append("file", file);
  formData.append("api_key", cloudinaryApiKey!);
  formData.append("signature", signature);
  Object.entries(params).forEach(([key, value]) => formData.append(key, value));

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/private`, {
    method: "POST",
    body: formData,
  });
  const result = await response.json();
  if (!response.ok || typeof result?.public_id !== "string") {
    throw new Error(result?.error?.message || `Unable to upload ${kind}`);
  }

  return {
    assetId: typeof result.asset_id === "string" ? result.asset_id : null,
    bytes: file.size,
    extension: validation.extension,
    filename: validation.filename,
    mimeType: validation.mimeType,
    publicId: result.public_id,
  };
}

async function destroyDocument(publicId: string) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const params = { invalidate: "true", public_id: publicId, timestamp, type: "private" };
  const signature = await signCloudinaryParams(params);
  const formData = new FormData();

  formData.append("api_key", cloudinaryApiKey!);
  formData.append("signature", signature);
  Object.entries(params).forEach(([key, value]) => formData.append(key, value));
  await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/destroy`, {
    method: "POST",
    body: formData,
  });
}

async function getAuthenticatedAdmin(req: Request) {
  const authorization = req.headers.get("Authorization");
  if (!authorization || !anonKey) return null;
  const userClient = createClient(supabaseUrl!, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: { user }, error } = await userClient.auth.getUser();
  if (error || !user) return null;

  const { data: admin } = await serviceClient()
    .from("admin_users")
    .select("id")
    .eq("id", user.id)
    .eq("role", "super_admin")
    .eq("is_active", true)
    .maybeSingle();
  return admin;
}

async function createPrivateDownloadUrl(documentId: string) {
  const { data: document, error } = await serviceClient()
    .from("career_application_documents")
    .select("cloudinary_public_id, file_extension")
    .eq("id", documentId)
    .single();
  if (error) throw error;

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const expiresAt = (Math.floor(Date.now() / 1000) + 5 * 60).toString();
  const params = {
    expires_at: expiresAt,
    format: document.file_extension,
    public_id: document.cloudinary_public_id,
    timestamp,
    type: "private",
  };
  const signature = await signCloudinaryParams(params);
  const query = new URLSearchParams({
    ...params,
    api_key: cloudinaryApiKey!,
    signature,
  });

  return `https://api.cloudinary.com/v1_1/${cloudName}/raw/download?${query}`;
}

async function submitApplication(formData: FormData) {
  const payload = JSON.parse(String(formData.get("application") || "{}"));
  const cv = formData.get("cv");
  const coverLetter = formData.get("coverLetter");
  const honeypot = cleanText(payload.website, 200);

  if (honeypot) return json({ submitted: true });
  if (!(cv instanceof File) || !(coverLetter instanceof File)) {
    return json({ error: "Choose a CV and cover letter before submitting" }, 400);
  }

  const fullName = cleanText(payload.fullName, 160);
  const email = cleanText(payload.email, 254).toLowerCase();
  const phone = cleanText(payload.phone, 40);
  const location = cleanText(payload.location, 160);
  const linkedinUrl = cleanText(payload.linkedinUrl, 500);
  const portfolioUrl = cleanText(payload.portfolioUrl, 500);
  const jobId = cleanText(payload.jobId, 64) || null;
  const answers = payload.answers && typeof payload.answers === "object" ? payload.answers : {};

  if (!fullName || !email.includes("@") || !location) {
    return json({ error: "Name, valid email, and location are required" }, 400);
  }
  if (![linkedinUrl, portfolioUrl].every(isSafePublicHttpsUrl)) {
    return json({ error: "Profile links must use safe public HTTPS URLs" }, 400);
  }

  const db = serviceClient();
  let job = null;
  if (jobId) {
    const { data, error } = await db
      .from("admin_job_openings")
      .select("id, title, is_technical")
      .eq("id", jobId)
      .eq("status", "open")
      .single();
    if (error) return json({ error: "This position is no longer accepting applications" }, 400);
    job = data;
  }

  const { data: questions, error: questionsError } = await db
    .from("career_application_questions")
    .select("job_id, question_scope, field_key, field_type, is_required, is_technical_only")
    .eq("is_active", true);
  if (questionsError) throw questionsError;

  const activeQuestions = (questions || [])
    .filter((question) => question.question_scope === "shared"
      || (!jobId && question.question_scope === "talent_pool")
      || (jobId && question.question_scope === "role" && question.job_id === jobId))
    .filter((question) => !question.is_technical_only || job?.is_technical);
  const normalizedAnswers: Record<string, string | boolean> = {};
  for (const question of activeQuestions) {
    const answer = answers[question.field_key];
    if (question.is_required && (answer === undefined || answer === null || String(answer).trim() === "")) {
      return json({ error: `Answer the required question: ${question.field_key}` }, 400);
    }
    if (question.field_type === "url" && answer && !isSafePublicHttpsUrl(answer)) {
      return json({ error: "Project links must use safe public HTTPS URLs" }, 400);
    }
    normalizedAnswers[question.field_key] = question.field_type === "checkbox"
      ? Boolean(answer)
      : cleanText(answer, 5000);
  }

  if (JSON.stringify(normalizedAnswers).length > 50_000) {
    return json({ error: "Application answers are too large" }, 400);
  }

  const liveProjectUrl = cleanText(normalizedAnswers.live_project_url, 500);
  if (job?.is_technical && !isSafePublicHttpsUrl(liveProjectUrl)) {
    return json({ error: "Technical applications require a safe public HTTPS live-project URL" }, 400);
  }

  await validateDocument(cv, "CV");
  await validateDocument(coverLetter, "Cover letter");

  let recentApplicationQuery = db
    .from("career_applications")
    .select("id")
    .eq("email", email)
    .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
  recentApplicationQuery = jobId
    ? recentApplicationQuery.eq("job_id", jobId)
    : recentApplicationQuery.is("job_id", null);
  const { data: recent } = await recentApplicationQuery
    .maybeSingle();
  if (recent) return json({ error: "An application for this opportunity was already submitted recently" }, 409);

  const { data: candidate, error: candidateError } = await db
    .from("admin_hiring_candidates")
    .insert({ full_name: fullName, role_title: job?.title || "Talent Pool" })
    .select("id")
    .single();
  if (candidateError) throw candidateError;

  const { data: application, error: applicationError } = await db
    .from("career_applications")
    .insert({
      candidate_id: candidate.id,
      job_id: jobId,
      full_name: fullName,
      email,
      phone: phone || null,
      location,
      linkedin_url: linkedinUrl || null,
      portfolio_url: portfolioUrl || null,
      live_project_url: liveProjectUrl || null,
      answers: normalizedAnswers,
    })
    .select("id")
    .single();

  if (applicationError) {
    await db.from("admin_hiring_candidates").delete().eq("id", candidate.id);
    throw applicationError;
  }

  const uploaded: Array<Record<string, unknown>> = [];
  try {
    for (const [kind, file] of [["cv", cv], ["cover_letter", coverLetter]] as const) {
      const document = await uploadDocument(application.id, kind, file);
      uploaded.push(document);
      const { error } = await db.from("career_application_documents").insert({
        application_id: application.id,
        document_type: kind,
        original_filename: document.filename,
        mime_type: document.mimeType,
        file_extension: document.extension,
        bytes: document.bytes,
        cloudinary_public_id: document.publicId,
        cloudinary_asset_id: document.assetId,
      });
      if (error) throw error;
    }
  } catch (error) {
    await Promise.all(uploaded.map((document) => destroyDocument(String(document.publicId))));
    await db.from("admin_hiring_candidates").delete().eq("id", candidate.id);
    throw error;
  }

  return json({ applicationId: application.id, submitted: true }, 201);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!supabaseUrl || !anonKey || !serviceRoleKey || !cloudName || !cloudinaryApiKey || !cloudinaryApiSecret) {
    return json({ error: "Careers uploads are not configured" }, 500);
  }

  try {
    if (req.headers.get("content-type")?.includes("multipart/form-data")) {
      return await submitApplication(await req.formData());
    }

    const body = await req.json();
    if (body?.action === "view") {
      if (!await getAuthenticatedAdmin(req)) return json({ error: "Super-admin access is required" }, 403);
      return json({ url: await createPrivateDownloadUrl(cleanText(body.documentId, 64)) });
    }
    return json({ error: "Unsupported careers action" }, 400);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Careers request failed" }, 500);
  }
});

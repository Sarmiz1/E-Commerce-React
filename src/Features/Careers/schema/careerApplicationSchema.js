import { z } from "zod";
import { CAREER_COUNTRY_OPTIONS, OTHER_CITY_VALUE } from "../data/careerApplicationData";
import { isSafePublicHttpsUrl, MAX_CAREER_DOCUMENT_BYTES } from "../utils/careerSecurity";

const countryCodes = new Set(CAREER_COUNTRY_OPTIONS.map((country) => country.value));
const optionalSafeUrl = z.string().trim().max(500).refine(isSafePublicHttpsUrl, {
  message: "Use a safe public HTTPS URL.",
});
const documentList = (label) => z.array(z.instanceof(File))
  .length(1, `Choose one ${label}.`)
  .refine(([file]) => file && file.size <= MAX_CAREER_DOCUMENT_BYTES, `${label} must be 5MB or smaller.`);

export const createCareerApplicationSchema = (questions = []) => z.object({
  answers: z.record(z.string(), z.union([z.string(), z.boolean()])),
  city: z.string().trim().min(1, "Choose your city."),
  country: z.string().refine((value) => countryCodes.has(value), "Choose a valid country."),
  coverLetterFiles: documentList("cover letter"),
  cvFiles: documentList("CV"),
  email: z.email("Enter a valid email address.").max(254),
  fullName: z.string().trim().min(2, "Enter your full name.").max(160),
  jobId: z.string(),
  linkedinUrl: optionalSafeUrl,
  otherCity: z.string().trim().max(100, "Use 100 characters or fewer."),
  phone: z.string().trim().max(40),
  portfolioUrl: optionalSafeUrl,
  website: z.string().max(0),
}).superRefine((values, context) => {
  if (values.city === OTHER_CITY_VALUE && !values.otherCity) {
    context.addIssue({
      code: "custom",
      message: "Enter your city.",
      path: ["otherCity"],
    });
  }
  questions.forEach((question) => {
    const answer = values.answers?.[question.key];
    if (question.required && (answer === undefined || answer === null || String(answer).trim() === "")) {
      context.addIssue({
        code: "custom",
        message: "This answer is required.",
        path: ["answers", question.key],
      });
    }
    if (question.type === "url" && answer && !isSafePublicHttpsUrl(String(answer))) {
      context.addIssue({
        code: "custom",
        message: "Use a safe public HTTPS URL.",
        path: ["answers", question.key],
      });
    }
  });
});

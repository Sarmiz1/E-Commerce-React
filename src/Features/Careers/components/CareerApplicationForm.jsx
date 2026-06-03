import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { Link } from "react-router-dom";
import FileUpload from "../../../Components/Ui/FileUpload";
import PremiumDropdown from "../../../Components/Ui/PremiumDropdown";
import { getAddressCountryLabel } from "../../../utils/addressCountries";
import {
  CAREER_COUNTRY_OPTIONS,
  getCareerCityOptions,
  OTHER_CITY_VALUE,
} from "../data/careerApplicationData";
import { createCareerApplicationSchema } from "../schema/careerApplicationSchema";
import { CAREER_DOCUMENT_ACCEPT, MAX_CAREER_DOCUMENT_BYTES } from "../utils/careerSecurity";
import { useCareerForm, useSubmitCareerApplication } from "../hooks/useCareersQueries";

const inputClass = "w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-950 outline-none transition-colors placeholder:text-gray-400 focus:border-blue-600 dark:border-white/10 dark:bg-zinc-900 dark:text-white";

function FieldError({ error }) {
  return error ? <p className="mt-1.5 text-xs font-semibold text-red-600 dark:text-red-300">{error.message}</p> : null;
}

function TextField({ error, label, register, required, textarea = false, type = "text", ...props }) {
  const Component = textarea ? "textarea" : "input";
  return (
    <label className="block">
      <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{label}{required ? " *" : ""}</span>
      <Component className={`${inputClass} mt-2 ${textarea ? "min-h-28 resize-y" : ""}`} type={textarea ? undefined : type} {...register} {...props} />
      <FieldError error={error} />
    </label>
  );
}

function SelectField({ control, error, includePlaceholder = true, label, name, onValueChange, options, placeholder = "Select an option", required }) {
  const dropdownOptions = includePlaceholder
    ? [{ label: placeholder, value: "" }, ...options.filter((option) => option.value !== "")]
    : options;
  return (
    <div>
      <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{label}{required ? " *" : ""}</span>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <PremiumDropdown
            buttonClassName="mt-2 min-h-12 !rounded-xl"
            onChange={(value) => {
              field.onChange(value);
              onValueChange?.(value);
            }}
            options={dropdownOptions}
            value={field.value}
          />
        )}
      />
      <FieldError error={error} />
    </div>
  );
}

function DynamicQuestion({ control, error, question, register }) {
  const name = `answers.${question.key}`;
  if (question.type === "select") {
    return (
      <SelectField
        control={control}
        error={error}
        label={question.label}
        name={name}
        options={(question.options || []).map((option) => ({ label: option, value: option }))}
        required={question.required}
      />
    );
  }
  if (question.type === "checkbox") {
    return (
      <label className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-zinc-900">
        <input className="mt-1 h-4 w-4 accent-blue-600" type="checkbox" {...register(name)} />
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{question.label}{question.required ? " *" : ""}</span>
        <FieldError error={error} />
      </label>
    );
  }
  return (
    <TextField
      error={error}
      label={question.label}
      placeholder={question.placeholder}
      register={register(name)}
      required={question.required}
      textarea={question.type === "textarea"}
      type={question.type === "url" ? "url" : "text"}
    />
  );
}

export default function CareerApplicationForm({ initialJobId = "", openings = [] }) {
  const [progress, setProgress] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const submission = useSubmitCareerApplication();
  const jobOptions = useMemo(() => [
    { label: "Join the talent pool", value: "" },
    ...(initialJobId && !openings.some((job) => job.id === initialJobId)
      ? [{ label: "Selected role", value: initialJobId }]
      : []),
    ...openings.map((job) => ({ label: job.title, value: job.id })),
  ], [initialJobId, openings]);

  const [selectedJobId, setSelectedJobId] = useState(initialJobId);
  const formConfig = useCareerForm(selectedJobId);
  const questions = useMemo(
    () => Array.isArray(formConfig.data?.questions) ? formConfig.data.questions : [],
    [formConfig.data],
  );
  const schema = useMemo(() => createCareerApplicationSchema(questions), [questions]);
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      answers: {},
      city: "",
      country: "NG",
      coverLetterFiles: [],
      cvFiles: [],
      email: "",
      fullName: "",
      jobId: initialJobId,
      linkedinUrl: "",
      otherCity: "",
      phone: "",
      portfolioUrl: "",
      website: "",
    },
    resolver: zodResolver(schema),
  });
  const selectedCity = useWatch({ control, name: "city" });
  const selectedCountry = useWatch({ control, name: "country" });
  const cityOptions = useMemo(() => getCareerCityOptions(selectedCountry), [selectedCountry]);
  const submit = handleSubmit(async (values) => {
    setProgress(0);
    setSubmitError("");
    try {
      await submission.mutateAsync({
        values: {
          answers: values.answers,
          email: values.email,
          fullName: values.fullName,
          jobId: values.jobId,
          linkedinUrl: values.linkedinUrl,
          location: `${values.city === OTHER_CITY_VALUE ? values.otherCity : values.city}, ${getAddressCountryLabel(values.country)}`,
          phone: values.phone,
          portfolioUrl: values.portfolioUrl,
          website: values.website,
        },
        coverLetter: values.coverLetterFiles[0],
        cv: values.cvFiles[0],
        onProgress: setProgress,
      });
      setProgress(100);
      setSubmitted(true);
      reset();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setSubmitError(error.message);
    }
  });

  if (submitted) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-7 text-center dark:border-green-500/20 dark:bg-green-500/10 sm:p-10">
        <CheckCircle2 className="mx-auto text-green-600 dark:text-green-400" size={54} />
        <h2 className="mt-5 text-3xl font-black uppercase tracking-tighter text-gray-950 dark:text-white">Application Received</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          Your application and documents were submitted securely. The hiring team can now review them from the admin pipeline.
        </p>
        <Link className="mt-6 inline-block bg-gray-950 px-6 py-3 text-xs font-black uppercase tracking-widest text-white dark:bg-white dark:text-black" to="/careers">
          Return To Careers
        </Link>
      </div>
    );
  }

  return (
    <form className="space-y-8" onSubmit={submit}>
      <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-zinc-950/40 sm:p-7">
        <h2 className="text-xl font-black text-gray-950 dark:text-white">Your details</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <TextField error={errors.fullName} label="Full name" register={register("fullName")} required />
          <TextField error={errors.email} label="Email address" register={register("email")} required type="email" />
          <TextField error={errors.phone} label="Phone number" register={register("phone")} type="tel" />
          <SelectField
            control={control}
            error={errors.country}
            label="Country"
            name="country"
            onValueChange={() => {
              setValue("city", "", { shouldValidate: true });
              setValue("otherCity", "");
            }}
            options={CAREER_COUNTRY_OPTIONS}
            placeholder="Select a country"
            required
          />
          <SelectField control={control} error={errors.city} label="City" name="city" options={cityOptions} required />
          {selectedCity === OTHER_CITY_VALUE && (
            <TextField error={errors.otherCity} label="Your city" placeholder="Enter your city" register={register("otherCity")} required />
          )}
          <TextField error={errors.linkedinUrl} label="LinkedIn URL" placeholder="https://linkedin.com/in/..." register={register("linkedinUrl")} type="url" />
          <TextField error={errors.portfolioUrl} label="Portfolio or profile URL" placeholder="https://..." register={register("portfolioUrl")} type="url" />
          <div className="md:col-span-2">
            <SelectField control={control} error={errors.jobId} includePlaceholder={false} label="Application path" name="jobId" onValueChange={setSelectedJobId} options={jobOptions} required />
            {!selectedJobId && (
              <p className="mt-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                The talent pool is always open. These questions help the hiring team understand where you could contribute when a relevant opportunity appears.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-zinc-950/40 sm:p-7">
        <h2 className="text-xl font-black text-gray-950 dark:text-white">Application questions</h2>
        <div className="mt-5 space-y-5">
          {questions.map((question) => (
            <DynamicQuestion
              control={control}
              error={errors.answers?.[question.key]}
              key={question.id}
              question={question}
              register={register}
            />
          ))}
        </div>
      </section>

      <section className="grid gap-5 rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-zinc-950/40 sm:p-7 md:grid-cols-2">
        <div className="md:col-span-2">
          <h2 className="text-xl font-black text-gray-950 dark:text-white">Documents</h2>
          <p className="mt-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
            Documents upload to restricted Cloudinary storage only when you submit. The hiring team opens them through short-lived signed links.
          </p>
        </div>
        <Controller
          control={control}
          name="cvFiles"
          render={({ field }) => (
            <FileUpload
              accept={CAREER_DOCUMENT_ACCEPT}
              disabled={submission.isPending}
              error={errors.cvFiles?.message}
              files={field.value}
              label="CV or resume"
              maxSize={MAX_CAREER_DOCUMENT_BYTES}
              onFilesChange={field.onChange}
              required
              status={submission.isPending ? "uploading" : "idle"}
              progress={progress}
            />
          )}
        />
        <Controller
          control={control}
          name="coverLetterFiles"
          render={({ field }) => (
            <FileUpload
              accept={CAREER_DOCUMENT_ACCEPT}
              disabled={submission.isPending}
              error={errors.coverLetterFiles?.message}
              files={field.value}
              label="Cover letter"
              maxSize={MAX_CAREER_DOCUMENT_BYTES}
              onFilesChange={field.onChange}
              required
              status={submission.isPending ? "uploading" : "idle"}
              progress={progress}
            />
          )}
        />
      </section>

      <input aria-hidden="true" autoComplete="off" className="hidden" tabIndex="-1" {...register("website")} />

      {submitError && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">{submitError}</p>}

      <button
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-sm font-black uppercase tracking-widest text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={submission.isPending || formConfig.isLoading}
        type="submit"
      >
        {submission.isPending ? <Loader2 className="animate-spin" size={18} /> : <Send size={17} />}
        {submission.isPending ? "Submitting securely..." : "Submit application"}
      </button>
    </form>
  );
}

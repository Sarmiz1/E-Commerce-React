import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import ModernNavbar from "../../Components/ModernNavbar";
import { ModernFooter } from "../Marketting/ModernLanding/SharedComponents/ModernFooter";

export default function ApplicationForm() {
  const [searchParams] = useSearchParams();
  const preSelectedRole = searchParams.get("role") || "";

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    timezone: "",
    linkedin: "",
    portfolio: "",
    role: preSelectedRole,
    type: "Full-time",
    startTimeline: "",
    compensation: "",
    hours: "",
    whyWoosho: "",
    buildingDifferently: "",
    improveImmediately: "",
    // Role specific
    techStack: "",
    builtSystem: "",
    scaleSystem: "",
    githubLink: "",
    designLinks: "",
    designProcess: "",
    designPerformance: "",
    designRedesign: "",
    growthScale: "",
    growthChannels: "",
    growthProof: "",
    growthZeroBudget: "",
    // Common scenarios
    scenarioConversion: "",
    initiativeExample: "",
    unclearInstructions: "",
    motivation: "Ownership",
    threeYears: "",
    startupFit: "Yes",
    anythingElse: "",
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const totalSteps = 6;

  useEffect(() => {
    // Removed forced dark mode class and body style
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    setIsSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isDeveloper =
    [
      "Frontend Engineer (React)",
      "Backend Engineer (Node.js)",
      "AI/ML Engineer",
    ].includes(formData.role) ||
    formData.role.toLowerCase().includes("engineer");
  const isDesigner =
    ["Product Designer (UI/UX)"].includes(formData.role) ||
    formData.role.toLowerCase().includes("design");
  const isMarketing =
    ["Growth & Marketing Lead"].includes(formData.role) ||
    formData.role.toLowerCase().includes("marketing");

  if (isSubmitted) {
    return (
      <div
        className="bg-white dark:bg-[#0E0E10] text-gray-900 dark:text-white min-h-screen selection:bg-blue-600/30 flex flex-col transition-colors duration-300"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <ModernNavbar />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-white/10 p-12 max-w-2xl w-full transition-colors duration-300"
          >
            <CheckCircle2 size={64} className="text-green-500 mx-auto mb-6" />
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-4 text-gray-900 dark:text-white">
              Application Received.
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">
              Thank you for applying to join the Woosho team. We review
              applications on a rolling basis. If your profile and responses
              align with what we're looking for, we'll be in touch within 48
              hours for the next async screening stage.
            </p>
            <Link
              to="/careers"
              className="inline-block px-8 py-4 bg-gray-900 text-white dark:bg-white dark:text-black font-bold uppercase tracking-widest text-sm hover:bg-blue-600 dark:hover:bg-gray-200 transition-colors"
            >
              Return to Careers
            </Link>
          </motion.div>
        </main>
        <ModernFooter />
      </div>
    );
  }

  return (
    <div
      className="bg-white dark:bg-[#0E0E10] text-gray-900 dark:text-white min-h-screen selection:bg-blue-600/30 flex flex-col transition-colors duration-300"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <ModernNavbar />

      <main className="flex-1 pt-32 pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <Link
              to="/careers"
              className="inline-flex items-center text-sm font-bold text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white uppercase tracking-widest transition-colors mb-6"
            >
              <ArrowLeft size={16} className="mr-2" /> Back to roles
            </Link>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2 text-gray-900 dark:text-white">
              Join The Core Team.
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Applications without thoughtful answers will not be reviewed.
              Please take your time.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-white/5 h-1 mb-12 overflow-hidden transition-colors duration-300">
            <motion.div
              className="bg-blue-600 h-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold border-b border-gray-200 dark:border-white/10 pb-4 mb-6 text-gray-900 dark:text-white transition-colors duration-300">
                    1. Basic Information
                  </h2>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Full Name *
                      </label>
                      <input
                        required
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-white/10 p-4 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none transition-colors text-gray-900 dark:text-white"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Email Address *
                      </label>
                      <input
                        required
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-white/10 p-4 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none transition-colors text-gray-900 dark:text-white"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Location *
                      </label>
                      <input
                        required
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-white/10 p-4 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none transition-colors text-gray-900 dark:text-white"
                        placeholder="Lagos, Nigeria"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Timezone *
                      </label>
                      <input
                        required
                        type="text"
                        name="timezone"
                        value={formData.timezone}
                        onChange={handleChange}
                        className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-white/10 p-4 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none transition-colors text-gray-900 dark:text-white"
                        placeholder="WAT (UTC+1)"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        LinkedIn Profile *
                      </label>
                      <input
                        required
                        type="url"
                        name="linkedin"
                        value={formData.linkedin}
                        onChange={handleChange}
                        className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-white/10 p-4 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none transition-colors text-gray-900 dark:text-white"
                        placeholder="https://linkedin.com/in/..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Portfolio / GitHub / Website *
                      </label>
                      <input
                        required
                        type="url"
                        name="portfolio"
                        value={formData.portfolio}
                        onChange={handleChange}
                        className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-white/10 p-4 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none transition-colors text-gray-900 dark:text-white"
                        placeholder="https://github.com/..."
                      />
                    </div>
                  </div>

                  <div className="space-y-2 pt-4">
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Role You're Applying For *
                    </label>
                    <select
                      required
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-white/10 p-4 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none transition-colors appearance-none text-gray-900 dark:text-white"
                    >
                      <option value="" disabled>
                        Select a role...
                      </option>
                      <option value="Frontend Engineer (React)">
                        Frontend Engineer (React)
                      </option>
                      <option value="Backend Engineer (Node.js)">
                        Backend Engineer (Node.js)
                      </option>
                      <option value="Product Designer (UI/UX)">
                        Product Designer (UI/UX)
                      </option>
                      <option value="AI/ML Engineer">AI/ML Engineer</option>
                      <option value="Growth & Marketing Lead">
                        Growth & Marketing Lead
                      </option>
                      <option value="Operations Manager">
                        Operations Manager
                      </option>
                      <option value="General Application">
                        General Application
                      </option>
                    </select>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold border-b border-gray-200 dark:border-white/10 pb-4 mb-6 text-gray-900 dark:text-white transition-colors duration-300">
                    2. Commitment & Availability
                  </h2>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Applying For *
                      </label>
                      <select
                        required
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-white/10 p-4 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none transition-colors appearance-none text-gray-900 dark:text-white"
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        When can you start? *
                      </label>
                      <input
                        required
                        type="text"
                        name="startTimeline"
                        value={formData.startTimeline}
                        onChange={handleChange}
                        className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-white/10 p-4 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none transition-colors text-gray-900 dark:text-white"
                        placeholder="e.g., Immediately, 2 weeks notice"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Expected monthly compensation (Range) *
                      </label>
                      <input
                        required
                        type="text"
                        name="compensation"
                        value={formData.compensation}
                        onChange={handleChange}
                        className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-white/10 p-4 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none transition-colors text-gray-900 dark:text-white"
                        placeholder="e.g., $2000 - $3000 USD"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Hours per week? *
                      </label>
                      <input
                        required
                        type="text"
                        name="hours"
                        value={formData.hours}
                        onChange={handleChange}
                        className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-white/10 p-4 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none transition-colors text-gray-900 dark:text-white"
                        placeholder="e.g., 40 hrs"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold border-b border-gray-200 dark:border-white/10 pb-4 mb-6 text-gray-900 dark:text-white transition-colors duration-300">
                    3. Intent Filter (Crucial)
                  </h2>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Why do you want to work at Woosho? (Max 150 words) *
                      </label>
                      <textarea
                        required
                        name="whyWoosho"
                        value={formData.whyWoosho}
                        onChange={handleChange}
                        rows={4}
                        className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-white/10 p-4 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none transition-colors resize-y text-gray-900 dark:text-white"
                        placeholder="Be direct."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        What do you think Woosho is building differently from
                        other ecommerce platforms? *
                      </label>
                      <textarea
                        required
                        name="buildingDifferently"
                        value={formData.buildingDifferently}
                        onChange={handleChange}
                        rows={4}
                        className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-white/10 p-4 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none transition-colors resize-y text-gray-900 dark:text-white"
                        placeholder="Show us your understanding of our vision."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        If you were hired today, what is one thing you would
                        improve immediately? *
                      </label>
                      <textarea
                        required
                        name="improveImmediately"
                        value={formData.improveImmediately}
                        onChange={handleChange}
                        rows={3}
                        className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-white/10 p-4 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none transition-colors resize-y text-gray-900 dark:text-white"
                        placeholder="Product, code, design, or process."
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold border-b border-gray-200 dark:border-white/10 pb-4 mb-6 text-gray-900 dark:text-white transition-colors duration-300">
                    4. Skill Deep Dive
                  </h2>

                  {isDeveloper ? (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          What stack are you most comfortable with? *
                        </label>
                        <input
                          required
                          type="text"
                          name="techStack"
                          value={formData.techStack}
                          onChange={handleChange}
                          className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-white/10 p-4 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none text-gray-900 dark:text-white"
                          placeholder="React, Next, Node, PostgreSQL..."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Describe a system or feature you built from scratch. *
                        </label>
                        <textarea
                          required
                          name="builtSystem"
                          value={formData.builtSystem}
                          onChange={handleChange}
                          rows={4}
                          className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-white/10 p-4 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none text-gray-900 dark:text-white"
                          placeholder="What was the problem? What was your architecture?"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          How would you structure a scalable product comparison
                          system? *
                        </label>
                        <textarea
                          required
                          name="scaleSystem"
                          value={formData.scaleSystem}
                          onChange={handleChange}
                          rows={4}
                          className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-white/10 p-4 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none text-gray-900 dark:text-white"
                          placeholder="Think about DB schema, caching, state management."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Share a GitHub project you are proud of and explain
                          your contribution. *
                        </label>
                        <input
                          required
                          type="url"
                          name="githubLink"
                          value={formData.githubLink}
                          onChange={handleChange}
                          className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-white/10 p-4 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none text-gray-900 dark:text-white"
                          placeholder="https://github.com/..."
                        />
                      </div>
                    </div>
                  ) : isDesigner ? (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Share 2–3 product designs you’ve worked on (Links). *
                        </label>
                        <textarea
                          required
                          name="designLinks"
                          value={formData.designLinks}
                          onChange={handleChange}
                          rows={3}
                          className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-white/10 p-4 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none text-gray-900 dark:text-white"
                          placeholder="Figma, Dribbble, Live Sites..."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Walk us through your design process from idea to final
                          UI. *
                        </label>
                        <textarea
                          required
                          name="designProcess"
                          value={formData.designProcess}
                          onChange={handleChange}
                          rows={4}
                          className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-white/10 p-4 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none text-gray-900 dark:text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          How do you balance aesthetics with conversion
                          performance? *
                        </label>
                        <textarea
                          required
                          name="designPerformance"
                          value={formData.designPerformance}
                          onChange={handleChange}
                          rows={3}
                          className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-white/10 p-4 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none text-gray-900 dark:text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Link to a quick redesign of one Woosho feature concept
                          (Optional but highly recommended).
                        </label>
                        <input
                          type="url"
                          name="designRedesign"
                          value={formData.designRedesign}
                          onChange={handleChange}
                          className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-white/10 p-4 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none text-gray-900 dark:text-white"
                          placeholder="Figma link..."
                        />
                      </div>
                    </div>
                  ) : isMarketing ? (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          How would you grow Woosho to 10,000 active users in 6
                          months? *
                        </label>
                        <textarea
                          required
                          name="growthScale"
                          value={formData.growthScale}
                          onChange={handleChange}
                          rows={4}
                          className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-white/10 p-4 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none text-gray-900 dark:text-white"
                          placeholder="Be specific about strategies."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Which growth channels would you prioritize and why? *
                        </label>
                        <textarea
                          required
                          name="growthChannels"
                          value={formData.growthChannels}
                          onChange={handleChange}
                          rows={3}
                          className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-white/10 p-4 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none text-gray-900 dark:text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Have you ever scaled a brand or page? Show proof. *
                        </label>
                        <textarea
                          required
                          name="growthProof"
                          value={formData.growthProof}
                          onChange={handleChange}
                          rows={3}
                          className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-white/10 p-4 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none text-gray-900 dark:text-white"
                          placeholder="Case studies, links, numbers."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          If ad budget is zero, what would you do? *
                        </label>
                        <textarea
                          required
                          name="growthZeroBudget"
                          value={formData.growthZeroBudget}
                          onChange={handleChange}
                          rows={3}
                          className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-white/10 p-4 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-gray-600 dark:text-gray-400">
                        No specific technical questions for this role category.
                        Proceed to the next step.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {currentStep === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold border-b border-gray-200 dark:border-white/10 pb-4 mb-6 text-gray-900 dark:text-white transition-colors duration-300">
                    5. Problem-Solving & Scenario
                  </h2>

                  <div className="space-y-6 bg-blue-50 dark:bg-zinc-900/50 p-6 border border-blue-100 dark:border-white/5 transition-colors duration-300">
                    <p className="text-lg text-blue-900 dark:text-blue-100 italic">
                      "Woosho is struggling with low conversion rates. Users
                      browse heavily but don't buy."
                    </p>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        What would you analyze and improve? *
                      </label>
                      <textarea
                        required
                        name="scenarioConversion"
                        value={formData.scenarioConversion}
                        onChange={handleChange}
                        rows={5}
                        className="w-full bg-white dark:bg-zinc-900 border border-gray-300 dark:border-white/10 p-4 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none text-gray-900 dark:text-white"
                        placeholder="Walk us through your thought process."
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 6 && (
                <motion.div
                  key="step6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold border-b border-gray-200 dark:border-white/10 pb-4 mb-6 text-gray-900 dark:text-white transition-colors duration-300">
                    6. Ownership & Culture Fit
                  </h2>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Describe a time you solved a problem without being told.
                        *
                      </label>
                      <textarea
                        required
                        name="initiativeExample"
                        value={formData.initiativeExample}
                        onChange={handleChange}
                        rows={3}
                        className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-white/10 p-4 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none text-gray-900 dark:text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        How do you handle unclear instructions? *
                      </label>
                      <textarea
                        required
                        name="unclearInstructions"
                        value={formData.unclearInstructions}
                        onChange={handleChange}
                        rows={3}
                        className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-white/10 p-4 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none text-gray-900 dark:text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        What motivates you more? *
                      </label>
                      <select
                        required
                        name="motivation"
                        value={formData.motivation}
                        onChange={handleChange}
                        className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-white/10 p-4 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none appearance-none text-gray-900 dark:text-white"
                      >
                        <option value="Stability">Stability</option>
                        <option value="Fast growth">Fast growth</option>
                        <option value="Ownership">Ownership</option>
                        <option value="Creative freedom">
                          Creative freedom
                        </option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Where do you see yourself in 3 years? *
                      </label>
                      <input
                        required
                        type="text"
                        name="threeYears"
                        value={formData.threeYears}
                        onChange={handleChange}
                        className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-white/10 p-4 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none text-gray-900 dark:text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Are you comfortable working in a startup environment
                        where structure is still evolving? *
                      </label>
                      <select
                        required
                        name="startupFit"
                        value={formData.startupFit}
                        onChange={handleChange}
                        className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-white/10 p-4 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none appearance-none text-gray-900 dark:text-white"
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Anything else we should know about you? (Optional)
                      </label>
                      <textarea
                        name="anythingElse"
                        value={formData.anythingElse}
                        onChange={handleChange}
                        rows={2}
                        className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-white/10 p-4 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between pt-8 border-t border-gray-200 dark:border-white/10 transition-colors duration-300">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white font-bold uppercase tracking-widest text-sm hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                >
                  Previous
                </button>
              ) : (
                <div></div>
              )}

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-8 py-4 bg-gray-900 text-white dark:bg-white dark:text-black font-bold uppercase tracking-widest text-sm hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white transition-colors"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-10 py-4 bg-blue-600 text-white font-bold uppercase tracking-widest text-sm hover:bg-blue-700 transition-colors"
                >
                  Submit Application
                </button>
              )}
            </div>
          </form>
        </div>
      </main>

      <ModernFooter />
    </div>
  );
}

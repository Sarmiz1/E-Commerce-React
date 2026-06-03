import { ArrowLeft } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import ModernNavbar from "../../Components/ModernNavbar";
import SEO from "../../Components/SEO";
import CareerApplicationForm from "./components/CareerApplicationForm";
import { CAREERS_NAV_LINKS } from "./data/careersData";
import { useCareerOpenings } from "./hooks/useCareersQueries";

export default function ApplicationForm() {
  const [searchParams] = useSearchParams();
  const openings = useCareerOpenings();
  const jobs = Array.isArray(openings.data?.roles) ? openings.data.roles : [];
  const requestedJobId = searchParams.get("job") || "";
  const noOpenJobs = !openings.isPlaceholderData && !openings.data?.unavailable && jobs.length === 0;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors dark:bg-[#0E0E10] dark:text-white">
      <SEO description="Submit a secure application for an open WooSho role or join the talent pool." noIndex title="Apply to WooSho | Careers" />
      <ModernNavbar navLinks={CAREERS_NAV_LINKS} />
      <main className="mx-auto max-w-4xl px-5 pb-20 pt-32 sm:px-8 sm:pt-36">
        <Link className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500 transition-colors hover:text-blue-600" to="/careers">
          <ArrowLeft size={15} /> Back to careers
        </Link>
        <h1 className="mt-6 text-4xl font-black uppercase leading-none tracking-tighter text-gray-950 dark:text-white sm:text-6xl">Apply To Join WooSho.</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-300 sm:text-base">
          Complete the form carefully. Questions update with the position selected, and technical roles require a live-project URL.
        </p>
        <div className="mt-9">
          {noOpenJobs && (
            <div className="mb-5 rounded-2xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-500/20 dark:bg-blue-500/10 sm:p-7">
              <h2 className="text-2xl font-black uppercase tracking-tighter text-gray-950 dark:text-white">No Available Jobs</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                There are no open positions accepting applications right now. The talent pool is always open, so tell us what you do well and what kind of opportunity would fit you.
              </p>
            </div>
          )}
          <CareerApplicationForm initialJobId={requestedJobId} openings={jobs} />
        </div>
      </main>
    </div>
  );
}

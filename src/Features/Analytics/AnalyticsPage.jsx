import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Database,
  RefreshCcw,
} from "lucide-react";
import ModernNavbar from "../../Components/ModernNavbar";
import SEO from "../../Components/SEO";
import LeadCaptureForm from "../Marketting/Components/LeadCaptureForm";
import { useMarketplaceSnapshot } from "./Hooks/useMarketplaceSnapshot";
import {
  ANALYTICS_NAV_LINKS,
  ANALYTICS_SEO,
  DISCOVERY_CAPABILITIES,
  INTELLIGENCE_FLOW,
  SIGNAL_METRICS,
  SNAPSHOT_METRICS,
} from "./utils/analyticsData";

const numberFormatter = new Intl.NumberFormat("en-US");

function formatMetric(value, status) {
  if (status === "loading") return "...";
  if (status === "unavailable") return "Unavailable";
  return numberFormatter.format(value);
}

function getMetricStatus(metric, isLoading, unavailableSources) {
  if (isLoading) return "loading";
  if (metric.source === "Curation feed" && unavailableSources.curations) {
    return "unavailable";
  }
  if (metric.source === "Live catalog" && unavailableSources.catalog) {
    return "unavailable";
  }
  return "ready";
}

function MetricCard({ metric, snapshot, isLoading, unavailableSources }) {
  const status = getMetricStatus(metric, isLoading, unavailableSources);

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-lg dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none"
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
          <metric.icon className="h-5 w-5" />
        </div>
        <span className="rounded-full border border-slate-200 px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 dark:border-white/10 dark:text-slate-400">
          {metric.source}
        </span>
      </div>
      <p
        className={`font-black tracking-tight text-slate-950 dark:text-white ${
          status === "unavailable" ? "text-xl" : "text-4xl"
        }`}
      >
        {formatMetric(snapshot[metric.key], status)}
      </p>
      <h3 className="mt-2 text-sm font-black uppercase tracking-[0.12em] text-slate-700 dark:text-slate-200">
        {metric.label}
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
        {metric.description}
      </p>
    </motion.article>
  );
}
function DataNote({ isFetching, unavailableSources, onRefresh }) {
  const hasUnavailableSource =
    unavailableSources.catalog || unavailableSources.curations;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none">
      <div className="flex items-start gap-3">
        <Database className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-300" />
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">
            {hasUnavailableSource
              ? "Some live sources are temporarily unavailable."
              : "Snapshot generated from live marketplace records."}
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
            Empty and unavailable sources stay visible as-is. The page does not
            substitute marketing estimates.
          </p>
        </div>
      </div>
      <button
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-slate-700 transition hover:border-blue-600 hover:text-blue-700 disabled:cursor-wait disabled:opacity-60 dark:border-white/15 dark:text-slate-200 dark:hover:border-blue-400 dark:hover:text-blue-300"
        disabled={isFetching}
        onClick={onRefresh}
        type="button"
      >
        <RefreshCcw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
        {isFetching ? "Refreshing" : "Refresh data"}
      </button>
    </div>
  );
}

function getAnalyticsPageSchema(canonical) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "WooSho Commerce Intelligence",
    description: ANALYTICS_SEO.description,
    ...(canonical ? { url: canonical } : {}),
    about: {
      "@type": "Thing",
      name: "WooSho marketplace analytics and commerce infrastructure",
    },
  };
}

function scrollToSection(sectionId) {
  document.getElementById(sectionId)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

export default function AnalyticsPage() {
  const {
    snapshot,
    isLoading,
    isFetching,
    unavailableSources,
    refresh,
  } = useMarketplaceSnapshot();
  const canonical =
    typeof window !== "undefined"
      ? `${window.location.origin}/analytics`
      : undefined;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 selection:bg-blue-600/20 dark:bg-[#0e0e10] dark:text-white">
      <SEO
        canonical={canonical}
        description={ANALYTICS_SEO.description}
        keywords={ANALYTICS_SEO.keywords}
        schema={getAnalyticsPageSchema(canonical)}
        title={ANALYTICS_SEO.title}
      />
      <ModernNavbar navLinks={ANALYTICS_NAV_LINKS} />

      <main>
        <section className="relative overflow-hidden border-b border-slate-200 px-5 pb-12 pt-32 dark:border-white/10 sm:px-6 sm:pb-16 sm:pt-36">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(37,99,235,0.12),_transparent_46%)] dark:bg-[radial-gradient(circle_at_top_right,_rgba(37,99,235,0.16),_transparent_42%)]" />
          <div className="relative mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-blue-700 dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-blue-200"
            >
              <Brain className="h-4 w-4" /> WooSho intelligence
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="mt-5 max-w-4xl text-4xl font-black tracking-[-0.055em] text-slate-950 dark:text-white sm:text-5xl lg:text-7xl"
            >
              Live marketplace data.
              <span className="block text-blue-700 dark:text-blue-300">
                Clear commerce signals.
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="mt-5 max-w-2xl text-base font-medium leading-7 text-slate-700 dark:text-slate-300 sm:text-lg"
            >
              This page reads WooSho&apos;s active catalog and curation feeds to
              show the public marketplace footprint behind product discovery.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24 }}
              className="mt-7 flex flex-col gap-3 sm:flex-row"
            >
              <button
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-800"
                onClick={() => scrollToSection("live-snapshot")}
                type="button"
              >
                Explore live snapshot <ArrowRight className="h-4 w-4" />
              </button>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-800 transition hover:border-blue-600 hover:text-blue-700 dark:border-white/15 dark:bg-white/[0.04] dark:text-white dark:hover:border-blue-400 dark:hover:text-blue-300"
                onClick={() => scrollToSection("partner-form")}
                type="button"
              >
                Partner with WooSho
              </button>
            </motion.div>
          </div>
        </section>

        <section
          className="scroll-mt-24 px-5 py-10 sm:px-6 sm:py-14"
          id="live-snapshot"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-700 dark:text-blue-300">
                Live marketplace snapshot
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                Real records, compact view.
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400 sm:text-base">
                These counters are derived in the browser from the public
                sellable catalog and active curation feed.
              </p>
            </div>
            <DataNote
              isFetching={isFetching}
              onRefresh={refresh}
              unavailableSources={unavailableSources}
            />
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {SNAPSHOT_METRICS.map((metric) => (
                <MetricCard
                  isLoading={isLoading}
                  key={metric.key}
                  metric={metric}
                  snapshot={snapshot}
                  unavailableSources={unavailableSources}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white px-5 py-10 dark:border-white/10 dark:bg-[#131315] sm:px-6 sm:py-14">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-700 dark:text-blue-300">
                Discovery infrastructure
              </p>
              <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                Product context flows through the marketplace.
              </h2>
              <div className="mt-6 grid gap-3">
                {DISCOVERY_CAPABILITIES.map((capability, index) => (
                  <motion.article
                    initial={{ opacity: 0, y: 12 }}
                    key={capability.title}
                    transition={{ delay: index * 0.06 }}
                    viewport={{ once: true, margin: "-40px" }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.035]"
                  >
                    <div className="flex gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-700 dark:text-blue-300" />
                      <div>
                        <h3 className="font-black text-slate-900 dark:text-white">
                          {capability.title}
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                          {capability.description}
                        </p>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {SIGNAL_METRICS.map((metric) => (
                <MetricCard
                  isLoading={isLoading}
                  key={metric.key}
                  metric={metric}
                  snapshot={snapshot}
                  unavailableSources={unavailableSources}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-10 sm:px-6 sm:py-14">
          <div className="mx-auto grid max-w-7xl gap-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none sm:p-7 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-700 dark:text-blue-300">
                Data flow
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white">
                One catalog, multiple discovery surfaces.
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                The public snapshot is deliberately narrow. Private revenue,
                customer, and order analytics remain inside role-protected
                dashboards.
              </p>
            </div>
            <ol className="grid gap-3 sm:grid-cols-2">
              {INTELLIGENCE_FLOW.map((step, index) => (
                <li
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-black/15"
                  key={step}
                >
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-blue-700 dark:text-blue-300">
                    0{index + 1}
                  </span>
                  <p className="mt-2 text-sm font-medium leading-6 text-slate-700 dark:text-slate-300">
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          className="scroll-mt-24 border-t border-slate-200 bg-slate-950 px-5 py-12 text-white dark:border-white/10 sm:px-6 sm:py-16"
          id="partner-form"
        >
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-300">
                Partnerships
              </p>
              <h2 className="mt-3 max-w-xl text-3xl font-black tracking-tight sm:text-4xl">
                Build useful commerce infrastructure with WooSho.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                Share your company and collaboration idea. The partnership form
                stores the request locally first and submits it to the
                configured marketing lead table when available.
              </p>
              <a
                className="mt-5 inline-flex items-center gap-2 text-sm font-black text-blue-300 transition hover:text-blue-200"
                href="mailto:partners@woosho.com"
              >
                partners@woosho.com <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            <LeadCaptureForm
              audience="partner"
              cta="Send partnership request"
              dark
              description="Tell us who you are and the kind of partnership you want to explore."
              title="Partner with WooSho"
            />
          </div>
        </section>
      </main>
    </div>
  );
}

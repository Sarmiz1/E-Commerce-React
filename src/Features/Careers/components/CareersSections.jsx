import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Brain, Code, Globe2, ShieldCheck, UserPlus, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import {
  BENEFITS,
  CULTURE_PILLARS,
  DEFAULT_ROLE_DETAILS,
  EMPLOYMENT_TYPE_LABELS,
  IMPACT_POINTS,
} from "../data/careersData";

const ICONS = { brain: Brain, globe: Globe2, shield: ShieldCheck, zap: Zap };
const reveal = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.55 },
};

export function CareersHero({ showOpenRoles }) {
  return (
    <section className="relative overflow-hidden px-5 pb-20 pt-36 text-center sm:px-6 sm:pb-28 sm:pt-44">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-100/70 via-white to-white dark:from-blue-900/20 dark:via-[#0E0E10] dark:to-[#0E0E10]" />
      <motion.div animate={{ opacity: 1, y: 0 }} className="relative z-10 mx-auto max-w-5xl" initial={{ opacity: 0, y: 24 }} transition={{ duration: 0.75 }}>
        <p className="mb-5 text-xs font-black uppercase tracking-[0.35em] text-blue-600 dark:text-blue-400">Careers at WooSho</p>
        <h1 className="text-5xl font-black uppercase leading-[0.9] tracking-tighter text-gray-950 dark:text-white sm:text-6xl md:text-8xl">
          Build Intelligent Commerce.
        </h1>
        <p className="mx-auto mt-7 max-w-3xl text-base leading-relaxed text-gray-600 dark:text-gray-300 sm:text-xl">
          Join a focused team building practical systems that make online shopping clearer and more useful.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          {showOpenRoles && (
            <a className="bg-gray-950 px-7 py-4 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-blue-600 dark:bg-white dark:text-black dark:hover:bg-blue-500 dark:hover:text-white" href="/careers#open-roles">
              View Open Roles
            </a>
          )}
          <Link className="border border-gray-300 px-7 py-4 text-xs font-black uppercase tracking-widest text-gray-900 transition-colors hover:border-gray-950 dark:border-white/20 dark:text-white dark:hover:border-white" to="/careers/apply">
            Join Talent Pool
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

export function CareersMission() {
  return (
    <section className="mx-auto max-w-[1500px] px-5 py-12 sm:px-8 sm:py-20">
      <motion.div {...reveal} className="overflow-hidden bg-blue-600 px-6 py-14 text-center text-white shadow-xl shadow-blue-900/10 sm:px-12 md:py-20">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-100">Why WooSho</p>
        <h2 className="mx-auto mt-4 max-w-4xl text-3xl font-black uppercase leading-none tracking-tighter sm:text-5xl md:text-6xl">
          Better commerce starts with better decisions.
        </h2>
        <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-blue-100 sm:text-xl">
          We are building useful product discovery and marketplace tools around real customer and seller needs.
        </p>
      </motion.div>
    </section>
  );
}

export function CultureGrid() {
  return (
    <section className="mx-auto max-w-[1500px] border-t border-gray-200 px-5 py-16 dark:border-white/5 sm:px-8 sm:py-20">
      <motion.h2 {...reveal} className="mb-10 text-center text-4xl font-black uppercase tracking-tighter text-gray-950 dark:text-white sm:text-5xl">How We Work</motion.h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CULTURE_PILLARS.map((pillar) => {
          const Icon = ICONS[pillar.icon];
          return (
            <motion.article {...reveal} className="border border-gray-200 bg-gray-50 p-6 dark:border-white/5 dark:bg-zinc-900/60 sm:p-8" key={pillar.title}>
              <Icon className="text-blue-600 dark:text-blue-400" size={30} />
              <h3 className="mt-5 text-lg font-black text-gray-950 dark:text-white">{pillar.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{pillar.description}</p>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

export function TeamImpact() {
  return (
    <section className="mx-auto grid max-w-[1500px] gap-9 border-t border-gray-200 px-5 py-16 dark:border-white/5 sm:px-8 sm:py-20 lg:grid-cols-2 lg:items-center">
      <motion.div {...reveal}>
        <h2 className="text-4xl font-black uppercase tracking-tighter text-gray-950 dark:text-white sm:text-6xl">Small Team.<br />Visible Impact.</h2>
        <div className="mt-8 space-y-5">
          {IMPACT_POINTS.map((point) => (
            <div className="flex gap-4" key={point.title}>
              <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600" />
              <div>
                <h3 className="font-black text-gray-950 dark:text-white">{point.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{point.description}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
      <motion.div {...reveal} className="relative min-h-72 overflow-hidden border border-gray-200 bg-gray-100 dark:border-white/5 dark:bg-zinc-900 sm:min-h-[420px]">
        <img
          alt="Team collaborating around a table"
          className="absolute inset-0 h-full w-full object-cover opacity-80 dark:opacity-50"
          decoding="async"
          loading="lazy"
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=82&w=1200"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/45 via-transparent to-white/10 dark:from-[#0E0E10]/80" />
        <Code className="absolute bottom-7 right-7 text-white/80" size={70} />
      </motion.div>
    </section>
  );
}

function RoleCard({ role }) {
  const [open, setOpen] = useState(false);
  const responsibilities = role.responsibilities?.length ? role.responsibilities : DEFAULT_ROLE_DETAILS.responsibilities;
  const requirements = role.requirements?.length ? role.requirements : DEFAULT_ROLE_DETAILS.requirements;

  return (
    <motion.article {...reveal} className="overflow-hidden border border-gray-200 bg-gray-50 dark:border-white/5 dark:bg-zinc-900/60">
      <button className="flex w-full items-start justify-between gap-5 p-5 text-left transition-colors hover:bg-gray-100 dark:hover:bg-zinc-800 sm:p-7" onClick={() => setOpen((value) => !value)} type="button">
        <div>
          <h3 className="text-xl font-black text-gray-950 dark:text-white sm:text-2xl">{role.title}</h3>
          {role.summary && <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{role.summary}</p>}
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-gray-600 dark:text-gray-300">
            <span className="rounded-full bg-gray-200 px-3 py-1 dark:bg-white/10">{role.department}</span>
            <span className="rounded-full bg-gray-200 px-3 py-1 dark:bg-white/10">{role.location}</span>
            <span className="rounded-full bg-gray-200 px-3 py-1 dark:bg-white/10">{EMPLOYMENT_TYPE_LABELS[role.employmentType] || role.employmentType}</span>
          </div>
        </div>
        <ArrowRight className={`mt-1 shrink-0 transition-transform duration-300 ${open ? "rotate-90 text-blue-600" : "text-gray-400"}`} size={20} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div animate={{ height: "auto", opacity: 1 }} className="overflow-hidden" exit={{ height: 0, opacity: 0 }} initial={{ height: 0, opacity: 0 }}>
            <div className="grid gap-6 border-t border-gray-200 bg-white p-5 dark:border-white/5 dark:bg-zinc-950/40 sm:p-7 md:grid-cols-2">
              <RoleList items={responsibilities} title="What you will do" />
              <RoleList items={requirements} title="What we are looking for" />
              <Link className="inline-flex w-fit items-center gap-2 bg-gray-950 px-5 py-3 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-blue-600 dark:bg-white dark:text-black dark:hover:bg-blue-500 dark:hover:text-white md:col-span-2" to={`/careers/apply?job=${encodeURIComponent(role.id)}`}>
                Apply For This Role <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

function RoleList({ items, title }) {
  return (
    <div>
      <h4 className="font-black text-gray-950 dark:text-white">{title}</h4>
      <ul className="mt-3 space-y-2 pl-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
        {items.map((item) => <li className="list-disc marker:text-blue-600" key={item}>{item}</li>)}
      </ul>
    </div>
  );
}

export function OpenRoles({ hidden, isLoading, roles }) {
  if (hidden) return null;

  return (
    <section className="mx-auto max-w-4xl scroll-mt-24 border-t border-gray-200 px-5 py-16 dark:border-white/5 sm:px-8 sm:py-20" id="open-roles">
      <motion.div {...reveal} className="mb-10 text-center">
        <h2 className="text-4xl font-black uppercase tracking-tighter text-gray-950 dark:text-white sm:text-6xl">Open Positions</h2>
        <p className="mt-3 text-base text-gray-600 dark:text-gray-400">Current vacancies come directly from the WooSho hiring team.</p>
      </motion.div>
      <div className="space-y-3">
        {isLoading && <StatusCard>Loading open roles...</StatusCard>}
        {!isLoading && !roles.length && <StatusCard>There are no open roles right now. You can still join the talent pool.</StatusCard>}
        {roles.map((role) => <RoleCard key={role.id} role={role} />)}
      </div>
    </section>
  );
}

function StatusCard({ children }) {
  return <div className="border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-600 dark:border-white/10 dark:bg-zinc-900 dark:text-gray-300">{children}</div>;
}

export function BenefitsAndTalentPool() {
  return (
    <>
      <section className="mx-auto max-w-[1500px] border-t border-gray-200 px-5 py-16 dark:border-white/5 sm:px-8 sm:py-20">
        <motion.h2 {...reveal} className="mb-10 text-center text-4xl font-black uppercase tracking-tighter text-gray-950 dark:text-white sm:text-5xl">What You Get</motion.h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((benefit) => (
            <motion.article {...reveal} className="border border-gray-200 bg-gray-50 p-6 dark:border-white/5 dark:bg-zinc-900/60" key={benefit.title}>
              <h3 className="font-black text-gray-950 dark:text-white">{benefit.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{benefit.description}</p>
            </motion.article>
          ))}
        </div>
      </section>
      <section className="border-t border-gray-200 bg-gray-50 px-5 py-20 text-center dark:border-white/5 dark:bg-zinc-900 sm:px-8">
        <UserPlus className="mx-auto text-blue-600 dark:text-blue-400" size={38} />
        <h2 className="mt-5 text-4xl font-black uppercase tracking-tighter text-gray-950 dark:text-white sm:text-5xl">Do Not See Your Role?</h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-gray-400">Join the talent pool and tell us where your experience could make the product stronger.</p>
        <Link className="mt-7 inline-block bg-gray-950 px-7 py-4 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-blue-600 dark:bg-white dark:text-black dark:hover:bg-blue-500 dark:hover:text-white" to="/careers/apply">
          Join Talent Pool
        </Link>
      </section>
    </>
  );
}

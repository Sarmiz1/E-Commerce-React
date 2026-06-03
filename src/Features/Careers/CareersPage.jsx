import SEO from "../../Components/SEO";
import ModernNavbar from "../../Components/ModernNavbar";
import {
  BenefitsAndTalentPool,
  CareersHero,
  CareersMission,
  CultureGrid,
  OpenRoles,
  TeamImpact,
} from "./components/CareersSections";
import { CAREERS_NAV_LINKS, CAREERS_SEO } from "./data/careersData";
import { useCareerOpenings } from "./hooks/useCareersQueries";

export default function CareersPage() {
  const openings = useCareerOpenings();
  const roles = Array.isArray(openings.data?.roles) ? openings.data.roles : [];
  const vacanciesUnavailable = Boolean(openings.data?.unavailable);
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: CAREERS_SEO.title,
    description: CAREERS_SEO.description,
    mainEntity: roles.map((role) => ({
      "@type": "JobPosting",
      title: role.title,
      description: role.description || role.summary,
      employmentType: role.employmentType,
      jobLocationType: role.location?.toLowerCase().includes("remote") ? "TELECOMMUTE" : undefined,
    })),
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 transition-colors duration-300 dark:bg-[#0E0E10] dark:text-white">
      <SEO description={CAREERS_SEO.description} keywords={CAREERS_SEO.keywords} schema={schema} title={CAREERS_SEO.title} />
      <ModernNavbar navLinks={CAREERS_NAV_LINKS} />
      <main>
        <CareersHero showOpenRoles={!vacanciesUnavailable} />
        <CareersMission />
        <CultureGrid />
        <TeamImpact />
        <OpenRoles hidden={vacanciesUnavailable} isLoading={openings.isPlaceholderData} roles={roles} />
        <BenefitsAndTalentPool />
      </main>
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import SEO from "../../Components/SEO";
import { useTheme } from "../../Store/useThemeStore";
import { CurationsAPI } from "../../api/curationsApi";
import CurationBreadcrumbs from "./Components/CurationBreadcrumbs";
import CurationCard from "./Components/CurationCard";
import {
  CurationErrorState,
  CurationLoadingState,
} from "./Components/CurationStates";
import { PG_STYLES } from "../Product/Styles/ProductsPageStyles";

export default function CurationIndexPage() {
  const { colors, isDark } = useTheme();
  const {
    data: curations = [],
    isError,
    isLoading,
    refetch,
  } = useQuery(CurationsAPI.getAll());

  return (
    <div
      className="min-h-screen overflow-x-clip pt-20"
      style={{ background: colors.surface.primary, color: colors.text.primary }}
    >
      <SEO
        description="Explore WooSho curations, from fresh arrivals and flash deals to customer favourites and editorial picks."
        title="Shop Curations | WooSho"
      />
      <style>{PG_STYLES}</style>

      {isLoading ? (
        <CurationLoadingState colors={colors} isDark={isDark} />
      ) : isError ? (
        <CurationErrorState colors={colors} onRetry={refetch} />
      ) : (
        <>
          <CurationBreadcrumbs colors={colors} title="Curations" />
          <section className="bg-slate-950 text-white">
            <div className="mx-auto max-w-screen-xl px-6 py-16 sm:py-20">
              <p className="text-[11px] font-black uppercase tracking-[0.32em] text-blue-300">
                WooSho Curations
              </p>
              <h1 className="mt-4 max-w-3xl font-serif text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Shop collections shaped around the way you browse.
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Explore live marketplace selections, from fresh arrivals and flash deals
                to customer favourites and editorial picks.
              </p>
            </div>
          </section>

          <main className="mx-auto max-w-screen-xl px-6 py-10 sm:py-14">
            <div className="mb-7">
              <p
                className="text-[10px] font-black uppercase tracking-[0.22em]"
                style={{ color: colors.text.accent }}
              >
                Browse curations
              </p>
              <h2 className="mt-2 font-serif text-3xl font-bold">
                Find your next favourite
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {curations.map((curation, index) => (
                <CurationCard
                  curation={curation}
                  index={index}
                  key={curation.id}
                />
              ))}
            </div>
          </main>
        </>
      )}
    </div>
  );
}

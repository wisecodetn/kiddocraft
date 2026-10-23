import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/locales";
import { AGE_RANGES, type ProductCardData, type ProductSort } from "@/lib/queries";
import { ProductCard } from "./ProductCard";
import { SortSelect } from "./SortSelect";

/** Product grid with age chips and sorting; filters are plain links/query params (crawlable, no JS needed). */
export async function ProductListing({
  locale,
  products,
  basePath,
  sort,
  age,
}: {
  locale: Locale;
  products: ProductCardData[];
  basePath: string;
  sort: ProductSort;
  age?: string;
}) {
  const [t, ta] = await Promise.all([getTranslations("shop"), getTranslations("ages")]);
  const query = (next: { age?: string; sort?: ProductSort }) => {
    const params = new URLSearchParams();
    const a = "age" in next ? next.age : age;
    const s = next.sort ?? sort;
    if (a) params.set("age", a);
    if (s !== "featured") params.set("sort", s);
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="group" aria-label={t("age")}>
          <FilterChip href={query({ age: undefined })} active={!age}>
            {t("allAges")}
          </FilterChip>
          {AGE_RANGES.map((r) => (
            <FilterChip key={r} href={query({ age: r })} active={age === r}>
              {ta(r)}
            </FilterChip>
          ))}
        </div>
        <div className="flex items-center justify-between gap-4 sm:justify-end">
          <p className="text-sm font-bold text-muted" aria-live="polite">
            {t("results", { count: products.length })}
          </p>
          <SortSelect
            value={sort}
            label={t("sort")}
            options={[
              { value: "featured", label: t("sortFeatured") },
              { value: "new", label: t("sortNew") },
              { value: "price-asc", label: t("sortPriceAsc") },
              { value: "price-desc", label: t("sortPriceDesc") },
            ]}
          />
        </div>
      </div>

      {products.length === 0 ? (
        <div className="card flex flex-col items-center gap-4 px-6 py-16 text-center">
          <span className="tile tile-sun size-14 rotate-6" aria-hidden />
          <p className="text-lg text-ink-soft">{t("empty")}</p>
          <Link href={basePath} className="btn btn-sun">
            {t("reset")}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} locale={locale} priority={i < 4} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "true" : undefined}
      className={`shrink-0 rounded-full border-2 px-4 py-2 text-sm font-bold transition ${
        active ? "border-sky-500 bg-sky-500 text-white" : "border-line bg-white text-ink-soft hover:border-sky-200"
      }`}
    >
      {children}
    </Link>
  );
}

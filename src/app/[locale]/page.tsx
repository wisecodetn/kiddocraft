import type { Metadata } from "next";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Banknote, Brain, Heart, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { locale as rootLocale } from "next/root-params";
import { PostCard } from "@/components/shop/PostCard";
import { ProductCard } from "@/components/shop/ProductCard";
import { FloatingTiles, SectionHeading } from "@/components/ui/Tiles";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/locales";
import { formatPrice } from "@/lib/format";
import { slugOf, t as tr } from "@/lib/localize";
import { AGE_RANGES, getCategories, getPosts, getProducts } from "@/lib/queries";
import { getSettings } from "@/lib/settings";
import { paths } from "@/lib/paths";
import { jsonLd, pageMetadata } from "@/lib/seo";

const catStyle: Record<string, { bg: string; ring: string; text: string }> = {
  yellow: { bg: "bg-sun-100", ring: "group-hover:ring-sun-400", text: "text-sun-700" },
  blue: { bg: "bg-sky-100", ring: "group-hover:ring-sky-400", text: "text-sky-700" },
  coral: { bg: "bg-coral-100", ring: "group-hover:ring-coral-400", text: "text-coral-600" },
  green: { bg: "bg-mint-100", ring: "group-hover:ring-mint-400", text: "text-mint-600" },
};

const ageStyle = ["tile-sun", "tile", "tile-coral", "tile-mint"];

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await rootLocale()) as Locale;
  const t = await getTranslations("meta");
  return pageMetadata({ locale, paths: paths.home, title: t("homeTitle"), description: t("homeDescription"), absoluteTitle: true });
}

export default async function HomePage() {
  const locale = (await rootLocale()) as Locale;
  const [t, th, ta, tb, categories, featured, posts, settings] = await Promise.all([
    getTranslations("home"),
    getTranslations("hero"),
    getTranslations("ages"),
    getTranslations("blog"),
    getCategories(),
    getProducts(locale, { featured: true, take: 8 }),
    getPosts({ take: 3 }),
    getSettings(),
  ]);
  const products = featured.length >= 4 ? featured : await getProducts(locale, { take: 8 });
  const heroProduct = products[0];
  const Arrow = locale === "ar" ? ArrowLeft : ArrowRight;

  const faq = [1, 2, 3, 4, 5].map((i) => ({
    q: t(`faq${i}Q`),
    a: t(`faq${i}A`, { fee: formatPrice(settings.shippingFee, locale), free: formatPrice(settings.freeShippingFrom, locale) }),
  }));
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  const title = th("title");
  const highlight = th("highlight");
  const [before, after] = title.includes(highlight) ? title.split(highlight) : [title, ""];

  return (
    <>
      {/* ------------------------------------------------------------ Hero */}
      <section className="sky-bg relative overflow-hidden">
        <FloatingTiles
          tiles={[
            { className: "start-[4%] top-16 size-10", color: "sky", rotate: -12 },
            { className: "start-[44%] top-10 size-8", color: "coral", shape: "triangle", rotate: 15, delay: 1 },
            { className: "end-[6%] top-24 size-12", color: "sun", rotate: 18, delay: 2 },
            { className: "start-[2%] bottom-6 size-12", color: "mint", shape: "triangle", rotate: -8, delay: 1.5 },
            { className: "end-[40%] bottom-16 size-7", color: "sun", shape: "triangle", rotate: 30, delay: 0.5 },
          ]}
        />
        <div className="container-x relative grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-20">
          <div className="animate-slide-in">
            <span className="chip bg-white/80 px-4 py-1.5 text-sm text-sky-700 shadow-sm">
              <Sparkles className="size-4 text-sun-500" aria-hidden /> {th("badge")}
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.1] text-ink sm:text-5xl lg:text-6xl">
              {before}
              <span className="relative whitespace-nowrap text-sky-500">
                {highlight}
                <svg className="absolute -bottom-2 start-0 h-3 w-full text-sun-400" viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden>
                  <path d="M2 9 Q 50 1 100 6 T 198 4" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" />
                </svg>
              </span>
              {after}
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ink-soft sm:text-xl">{th("subtitle")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/boutique" className="btn btn-sun px-8 py-4 text-lg">
                {th("ctaShop")} <Arrow className="size-5" aria-hidden />
              </Link>
              <Link href="#categories" className="btn btn-ghost px-8 py-4 text-lg">
                {th("ctaCategories")}
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold text-ink-soft">
              <li className="flex items-center gap-2">
                <Truck className="size-5 text-sky-500" aria-hidden /> {th("trustDelivery")}
              </li>
              <li className="flex items-center gap-2">
                <Banknote className="size-5 text-mint-500" aria-hidden /> {th("trustCod")}
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-coral-500" aria-hidden /> {th("trustSafe")}
              </li>
            </ul>
          </div>

          {heroProduct?.image && (
            <div className="relative mx-auto w-full max-w-md lg:max-w-lg">
              <div className="absolute -inset-4 rotate-3 rounded-[2.5rem] bg-sun-400/90" aria-hidden />
              <div className="absolute -inset-4 -rotate-2 rounded-[2.5rem] bg-sky-500/90" aria-hidden />
              <Link href={`/produit/${locale === "ar" ? heroProduct.slugAr : heroProduct.slugFr}`} className="relative block overflow-hidden rounded-[2rem] bg-white shadow-soft">
                <Image src={heroProduct.image} alt={heroProduct.imageAlt} width={800} height={800} priority sizes="(min-width: 1024px) 512px, 90vw" className="aspect-square w-full object-cover" />
              </Link>
              <div className="absolute -bottom-6 start-4 card flex items-center gap-3 px-4 py-3 sm:-start-6">
                <span className="grid size-10 place-items-center rounded-full bg-coral-100 text-coral-500">
                  <Heart className="size-5 fill-current" aria-hidden />
                </span>
                <div className="leading-tight">
                  <p className="font-display font-semibold">{heroProduct.name}</p>
                  <p className="font-display font-bold text-sky-600">{formatPrice(heroProduct.price, locale)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ------------------------------------------------------------ Categories */}
      <section id="categories" className="container-x scroll-mt-24 py-16 lg:py-20">
        <SectionHeading title={t("categoriesTitle")} subtitle={t("categoriesSubtitle")} />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {categories.map((c) => {
            const s = catStyle[c.color] ?? catStyle.blue;
            return (
              <Link key={c.id} href={`/categorie/${slugOf(c, locale)}`} className={`group relative overflow-hidden rounded-[1.75rem] ${s.bg} p-3 ring-4 ring-transparent transition ${s.ring}`}>
                {c.image && (
                  <div className="relative aspect-square overflow-hidden rounded-3xl">
                    <Image src={c.image} alt={tr(c, "name", locale)} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover transition duration-500 group-hover:scale-105" />
                  </div>
                )}
                <div className="px-2 pb-1 pt-3">
                  <h3 className="font-display text-lg font-semibold leading-tight sm:text-xl">{tr(c, "name", locale)}</h3>
                  <p className={`mt-0.5 text-sm font-bold ${s.text}`}>{t("productsCount", { count: c._count.products })}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------------------ Featured products */}
      <section className="bg-cloud py-16 lg:py-20">
        <div className="container-x">
          <SectionHeading
            title={t("featuredTitle")}
            subtitle={t("featuredSubtitle")}
            action={
              <Link href="/boutique" className="btn btn-ghost btn-sm">
                {t("viewAll")} <Arrow className="size-4" aria-hidden />
              </Link>
            }
          />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} locale={locale} />
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ Shop by age */}
      <section className="container-x py-16 lg:py-20">
        <SectionHeading title={t("ageTitle")} subtitle={t("ageSubtitle")} />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {AGE_RANGES.map((range, i) => (
            <Link key={range} href={`/boutique?age=${range}`} className="group card flex items-center gap-4 p-5 transition hover:-translate-y-1">
              <span className={`tile ${ageStyle[i]} size-14 shrink-0 transition group-hover:rotate-6`} aria-hidden />
              <span>
                <span className="block font-display text-xl font-semibold">{ta(range)}</span>
                <span className="text-sm text-muted">{ta(`${range}Hint`)}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------ Why */}
      <section className="relative overflow-hidden bg-sky-500 py-16 text-white lg:py-20">
        <FloatingTiles
          tiles={[
            { className: "end-[5%] top-10 size-16 opacity-30", color: "sun", rotate: 12 },
            { className: "start-[3%] bottom-8 size-14 opacity-30", color: "coral", shape: "triangle", rotate: -10, delay: 1 },
          ]}
        />
        <div className="container-x relative">
          <h2 className="section-title max-w-2xl text-white">{t("whyTitle")}</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Brain, color: "bg-sun-400 text-ink", n: 1 },
              { icon: ShieldCheck, color: "bg-mint-400 text-ink", n: 2 },
              { icon: Truck, color: "bg-coral-400 text-ink", n: 3 },
              { icon: Banknote, color: "bg-white text-sky-600", n: 4 },
            ].map(({ icon: Icon, color, n }) => (
              <div key={n} className="rounded-3xl bg-white/10 p-6 backdrop-blur-sm">
                <span className={`grid size-14 place-items-center rounded-2xl ${color}`}>
                  <Icon className="size-7" aria-hidden />
                </span>
                <h3 className="mt-4 font-display text-xl font-semibold">{t(`why${n}Title`)}</h3>
                <p className="mt-2 text-sky-50">{t(`why${n}Text`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ Blog */}
      {posts.length > 0 && (
        <section className="container-x py-16 lg:py-20">
          <SectionHeading
            title={t("blogTitle")}
            subtitle={t("blogSubtitle")}
            action={
              <Link href="/blog" className="btn btn-ghost btn-sm">
                {tb("back")} <Arrow className="size-4" aria-hidden />
              </Link>
            }
          />
          <div className="grid gap-6 md:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} locale={locale} />
            ))}
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------ FAQ */}
      <section id="faq" className="scroll-mt-24 bg-cloud py-16 lg:py-20">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <h2 className="section-title">{t("faqTitle")}</h2>
            <Image src="/brand/mark.png" alt="" width={180} height={180} className="mt-8 hidden opacity-90 lg:block" />
          </div>
          <div className="space-y-3">
            {faq.map((f, i) => (
              <details key={i} className="group card px-6 py-1 open:pb-4" open={i === 0}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-display text-lg font-semibold [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-sun-100 text-sun-700 transition group-open:rotate-45" aria-hidden>
                    +
                  </span>
                </summary>
                <p className="text-ink-soft">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(faqLd)} />
      </section>

      {/* ------------------------------------------------------------ CTA */}
      <section className="container-x pt-16 lg:pt-20">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-sun-400 px-6 py-12 text-center sm:px-12">
          <FloatingTiles
            tiles={[
              { className: "start-[6%] top-6 size-12", color: "sky", rotate: -10 },
              { className: "end-[8%] bottom-6 size-14", color: "coral", shape: "triangle", rotate: 12, delay: 1 },
              { className: "end-[20%] top-4 size-8", color: "mint", rotate: 20, delay: 2 },
            ]}
          />
          <h2 className="relative font-display text-3xl font-bold text-ink sm:text-4xl">{t("ctaTitle")}</h2>
          <p className="relative mt-3 text-lg font-semibold text-ink/80">{t("ctaText")}</p>
          <Link href="/boutique" className="btn btn-sky relative mt-7 px-8 py-4 text-lg">
            {t("ctaButton")} <Arrow className="size-5" aria-hidden />
          </Link>
        </div>
      </section>
    </>
  );
}

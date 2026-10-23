import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  return (
    <div className="container-x flex flex-col items-center py-24 text-center">
      <Image src="/brand/mark.png" alt="" width={160} height={160} className="animate-float" />
      <h1 className="mt-6 font-display text-4xl font-bold">{t("title")}</h1>
      <p className="mt-3 text-lg text-muted">{t("text")}</p>
      <Link href="/" className="btn btn-sun mt-8">
        {t("home")}
      </Link>
    </div>
  );
}

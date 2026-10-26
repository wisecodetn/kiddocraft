import Script from "next/script";
import { parseGaMeasurementId, parseMetaPixelId } from "@/lib/tracking";

/**
 * Meta Pixel and Google Analytics 4, loaded after the page is interactive (no impact on first paint/SEO).
 * Storefront only: the admin is never tracked. Both tools follow client-side navigation themselves
 * (Pixel listens to History API changes, GA4 "enhanced measurement" counts history page views).
 * IDs are re-validated here, so nothing but a well-formed ID is ever written into the scripts.
 */
export function Trackers({ metaPixelId, gaMeasurementId }: { metaPixelId: string; gaMeasurementId: string }) {
  const pixel = parseMetaPixelId(metaPixelId);
  const ga = parseGaMeasurementId(gaMeasurementId);

  return (
    <>
      {pixel && (
        <>
          <Script id="meta-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixel}');fbq('track','PageView');`}
          </Script>
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img height="1" width="1" style={{ display: "none" }} alt="" src={`https://www.facebook.com/tr?id=${pixel}&ev=PageView&noscript=1`} />
          </noscript>
        </>
      )}
      {ga && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${ga}');`}
          </Script>
        </>
      )}
    </>
  );
}

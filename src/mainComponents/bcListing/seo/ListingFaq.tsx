/**
 * "Questions about <address>" on the listing pages + the page's structured data (RealEstateListing + FAQPage).
 * A server component: the questions are in the first HTML, so Google can read them and show them in results.
 */
import { getListingSeo } from "./getListingSeo";
import type { ListingKind } from "../bcListingData";

export default async function ListingFaq({ id, kind }: { id: string; kind: ListingKind }) {
  const s = await getListingSeo(id, kind);
  if (!s) return null;
  const json = JSON.stringify(s.jsonLd).replace(/</g, "\\u003c");
  return (
    <>
      <script type="application/ld+json" id="listing-ld" dangerouslySetInnerHTML={{ __html: json }} />
      {s.faq.length > 0 && (
        <section id="bcl-faq" aria-labelledby="bcl-faq-h" className="mx-auto w-full max-w-[1140px] px-4 pb-10 pt-4 scroll-mt-24">
          <div className="rounded-2xl border border-[#e8edf3] bg-white p-4 md:p-5 shadow-[0_1px_2px_rgba(15,23,42,.03)]">
            <h2 id="bcl-faq-h" className="text-[17px] font-semibold leading-snug text-[#233142]">
              Questions about {s.listing.address}
            </h2>
            <div className="mt-1.5">
              {s.faq.map(([q, a], i) => (
                <details key={q} open={i === 0} className="group border-t border-[#e8edf3] first:border-t-0">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-3 py-3 text-[14.5px] font-semibold text-[#233142] [&::-webkit-details-marker]:hidden">
                    <h3 className="m-0 text-[14.5px] font-semibold">{q}</h3>
                    <span aria-hidden="true" className="text-[#6b7686] group-open:hidden">+</span>
                    <span aria-hidden="true" className="hidden text-[#6b7686] group-open:inline">–</span>
                  </summary>
                  <p className="mb-3 text-[14.5px] leading-relaxed text-[#475569]">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

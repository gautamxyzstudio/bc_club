"use client";
import React from "react";

/* ─── Single shimmer block ─────────────────────────────────────────────────── */
const S = ({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) => (
  <div
    className={`rounded-xl overflow-hidden ${className}`}
    style={{
      background: "linear-gradient(90deg,#ececec 25%,#d8d8d8 50%,#ececec 75%)",
      backgroundSize: "400% 100%",
      animation: "shimmer 1.6s ease-in-out infinite",
      ...style,
    }}
  />
);

/* ─── Reusable row of 2 shimmer cells ─────────────────────────────────────── */
const KVRow = () => (
  <div className="flex items-center justify-between gap-4 py-2.5 border-b border-[#f0f0f0] last:border-0">
    <S className="h-4 rounded-md" style={{ width: "38%" }} />
    <S className="h-4 rounded-md" style={{ width: "30%" }} />
  </div>
);

/* ─── Table section skeleton ──────────────────────────────────────────────── */
const TableSkeleton = ({ rows = 4 }: { rows?: number }) => (
  <div className="rounded-2xl border border-[#f0f0f0] overflow-hidden">
    {/* header row */}
    <div className="flex items-center gap-4 px-5 py-3.5 bg-[#f7f7f7]">
      <S className="h-4 rounded-md w-32" />
      <S className="h-4 rounded-md w-24 ml-auto" />
      <S className="h-4 rounded-md w-24" />
    </div>
    <div className="px-5 py-1">
      {Array.from({ length: rows }).map((_, i) => (
        <KVRow key={i} />
      ))}
    </div>
  </div>
);

/* ─── Main skeleton ───────────────────────────────────────────────────────── */
const PropertyInfoSkeleton = () => (
  <>
    <section className="xl:max-w-screen-2xl mx-auto w-full bg-background flex flex-col xl:px-16 md:px-9 px-6 pt-21 pb-13">
      {/* ── TOP ADDRESS SECTION ────────────────────────────────────────────── */}
      <div className="xl:mb-8 mb-4 w-full flex md:flex-row flex-col md:items-center md:justify-between gap-y-4">
        {/* left */}
        <div className="flex flex-col md:w-[72%] xl:gap-y-4 gap-y-3">
          <S className="h-9 rounded-lg" style={{ width: "68%" }} />
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <S className="h-5 rounded-full w-44" />
            <S className="h-5 rounded-full w-32" />
            <S className="h-5 rounded-full w-48" />
          </div>
        </div>
        {/* right – price */}
        <div className="flex md:flex-col items-center md:items-end gap-x-2 gap-y-2">
          <S className="h-12 rounded-lg w-40" />
          <S className="h-5 rounded-full w-24" />
        </div>
      </div>

      {/* ── GALLERY ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row flex-nowrap xl:gap-x-5 md:gap-x-3 gap-y-3 w-full xl:mb-12 mb-7">
        {/* main image */}
        <S className="md:w-1/2 w-full xl:h-134 md:h-76.5 h-56.5 rounded-2xl" />
        {/* thumbnails */}
        <div className="flex flex-row flex-wrap justify-between md:w-1/2 w-full gap-y-2.5">
          {[0, 1, 2, 3].map((i) => (
            <S key={i} className="w-[49%] xl:h-65.75 h-37 rounded-2xl" />
          ))}
        </div>
      </div>

      {/* ── INFORMATION SECTION ────────────────────────────────────────────── */}
      <div className="flex flex-row items-start flex-nowrap gap-5 w-full mt-6 md:mt-8 xl:mt-13">
        {/* ─ LEFT COLUMN ─────────────────────────────────────────────────── */}
        <div className="flex flex-col xl:w-[70%] w-full gap-y-8">
          {/* sticky-tab bar placeholder */}
          <div className="flex gap-x-2 border-b border-[#f0f0f0] pb-1">
            {[80, 64, 72, 80, 60].map((w, i) => (
              <S key={i} className="h-8 rounded-full" style={{ width: w }} />
            ))}
          </div>

          {/* Description block */}
          <div className="p-6 rounded-2xl bg-[#f7f7f7] flex flex-col gap-y-3">
            <S className="h-6 rounded-lg w-36" />
            <S className="h-4 rounded-md w-full" />
            <S className="h-4 rounded-md w-full" />
            <S className="h-4 rounded-md" style={{ width: "88%" }} />
            <S className="h-4 rounded-md" style={{ width: "72%" }} />
          </div>

          {/* Features block */}
          <div className="p-6 rounded-2xl border border-[#f0f0f0] flex flex-col gap-y-4">
            <S className="h-6 rounded-lg w-28" />
            <S
              className="h-px rounded-none w-full"
              style={{
                background: "linear-gradient(90deg,#e0e0e0,transparent)",
              }}
            />
            <div className="flex flex-row flex-wrap justify-between gap-y-4">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col gap-y-2 w-24">
                  <div className="flex items-center gap-x-2">
                    <S className="w-8 h-8 rounded-lg shrink-0" />
                    <S className="h-5 rounded-md w-10" />
                  </div>
                  <S className="h-4 rounded-md w-20" />
                </div>
              ))}
            </div>
          </div>

          {/* Map section */}
          <div className="flex flex-col gap-y-5">
            <div className="flex items-center justify-between">
              <S className="h-6 rounded-lg w-36" />
              <S className="h-10 rounded-2xl w-28" />
            </div>
            <S className="w-full h-72 rounded-2xl" />
          </div>

          {/* Property Details table */}
          <TableSkeleton rows={6} />

          {/* Room Information table */}
          <TableSkeleton rows={4} />

          {/* Assessment History */}
          <div className="flex flex-col gap-y-4">
            <S className="h-6 rounded-lg w-44" />
            <S className="w-full h-40 rounded-2xl" />
          </div>

          {/* Pricing Estimate */}
          <div className="p-5 rounded-xl bg-[#f7f7f7] flex flex-col gap-y-4">
            <S className="h-6 rounded-lg w-40" />
            <S
              className="h-px rounded-none w-full"
              style={{
                background: "linear-gradient(90deg,#e0e0e0,transparent)",
              }}
            />
            <div className="flex flex-row md:flex-nowrap flex-wrap gap-x-5 gap-y-4">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="bg-background px-4 py-5 flex items-center justify-between rounded-xl w-full"
                >
                  <S className="h-4 rounded-md w-36" />
                  <S className="h-7 rounded-lg w-28" />
                </div>
              ))}
            </div>
          </div>

          {/* Nearby schools table */}
          <TableSkeleton rows={4} />

          {/* Building complex table */}
          <TableSkeleton rows={3} />

          {/* Market stats table */}
          <TableSkeleton rows={5} />
        </div>

        {/* ─ RIGHT SIDEBAR (desktop only) ────────────────────────────────── */}
        <aside className="h-fit sticky top-14 self-start md:w-[30%] xl:flex hidden flex-col gap-y-4">
          {/* Avatar + agent info */}
          <div className="p-5 rounded-2xl border border-[#f0f0f0] flex flex-col gap-y-4">
            <div className="flex items-center gap-x-3">
              <S className="w-12 h-12 rounded-full shrink-0" />
              <div className="flex flex-col gap-y-1.5 flex-1">
                <S className="h-4 rounded-md w-3/4" />
                <S className="h-3 rounded-md w-1/2" />
              </div>
            </div>
            <S
              className="h-px rounded-none w-full"
              style={{
                background: "linear-gradient(90deg,#e0e0e0,transparent)",
              }}
            />
            {/* form fields */}
            {[0, 1, 2].map((i) => (
              <S key={i} className="h-11 rounded-xl w-full" />
            ))}
            {/* textarea */}
            <S className="h-28 rounded-xl w-full" />
            {/* submit */}
            <S className="h-12 rounded-xl w-full" />
          </div>
        </aside>
      </div>
    </section>
  </>
);

export default PropertyInfoSkeleton;

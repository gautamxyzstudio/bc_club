import React from "react";
import LineGradient from "../lineGradient/LineGradient";

type TableHeader = {
  key: string;
  label: string;
  align?: "left" | "right" | "center";
};

type TableRow = {
  data: Record<string, React.ReactNode>;
  subRows?: TableRow[];
};

interface DynamicTableProps {
  title: string;
  headers: TableHeader[];
  rows: TableRow[];
}

export const getAlignClass = (align?: "left" | "right" | "center") => {
  switch (align) {
    case "right":
      return "text-right";
    case "center":
      return "text-center";
    default:
      return "text-left";
  }
};

export default function DynamicTable({
  title,
  headers,
  rows,
}: DynamicTableProps) {
  const colCount = headers.length;

  return (
    <div className="rounded-2xl overflow-clip bg-gray">
      <h3 className="xl:text-xl md:text-lg text-base font-bold p-5 pb-4">
        {title}
      </h3>

      {/* Header */}
      {headers.length > 0 && (
        <div
          className="grid xl:text-base text-sm text-foreground px-5 mb-3 "
          style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}
        >
          {headers.map((h) => (
            <div key={h.key} className={getAlignClass(h.align)}>
              {h.label}
            </div>
          ))}
        </div>
      )}
      <LineGradient customClasses="my-1" />

      {/* Rows */}

      {rows.map((row, index) => (
        <div
          key={index}
          className={`px-5 py-3.5 xl:text-base text-sm ${
            index % 2 !== 0 ? "bg-background" : ""
          }`}
        >
          <div
            className={`grid text-foreground`}
            style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}
          >
            {headers.map((h) => (
              <div key={h.key} className={getAlignClass(h.align)}>
                {row.data[h.key]}
              </div>
            ))}
          </div>

          {/* Sub rows */}
          {row.subRows?.map((subRow, i) => (
            <div
              key={i}
              className="grid p-1 text-black70/50"
              style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}
            >
              {headers.map((h) => (
                <div key={h.key} className={getAlignClass(h.align)}>
                  {subRow.data[h.key]}
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

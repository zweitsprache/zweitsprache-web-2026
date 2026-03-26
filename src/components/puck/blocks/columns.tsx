"use client";

import type { ComponentConfig } from "@puckeditor/core";
import { DropZone } from "@puckeditor/core";

export type ColumnsProps = {
  columns: "2" | "3" | "4";
  distribution: "equal" | "left-wide" | "right-wide";
};

export const Columns: ComponentConfig<ColumnsProps> = {
  label: "Spalten",
  fields: {
    columns: {
      type: "select",
      label: "Anzahl Spalten",
      options: [
        { label: "2 Spalten", value: "2" },
        { label: "3 Spalten", value: "3" },
        { label: "4 Spalten", value: "4" },
      ],
    },
    distribution: {
      type: "select",
      label: "Verteilung",
      options: [
        { label: "Gleichmässig", value: "equal" },
        { label: "Links breiter", value: "left-wide" },
        { label: "Rechts breiter", value: "right-wide" },
      ],
    },
  },
  defaultProps: {
    columns: "2",
    distribution: "equal",
  },
  render: ({ columns, distribution }) => {
    const count = parseInt(columns);

    const gridClass = (() => {
      if (distribution === "equal") {
        return {
          2: "grid-cols-1 md:grid-cols-2",
          3: "grid-cols-1 md:grid-cols-3",
          4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
        }[count];
      }
      if (distribution === "left-wide") {
        return "grid-cols-1 md:grid-cols-[2fr_1fr]";
      }
      return "grid-cols-1 md:grid-cols-[1fr_2fr]";
    })();

    return (
      <div className={`grid gap-6 ${gridClass}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="min-h-[40px]">
            <DropZone zone={`column-${i}`} />
          </div>
        ))}
      </div>
    );
  },
};

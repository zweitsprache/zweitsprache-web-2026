import type { ComponentConfig } from "@puckeditor/core";

export type HeadingProps = {
  text: string;
  level: "h1" | "h2" | "h3" | "h4";
  alignment: "left" | "center" | "right";
};

export const Heading: ComponentConfig<HeadingProps> = {
  label: "Überschrift",
  fields: {
    text: { type: "text", label: "Text" },
    level: {
      type: "select",
      label: "Stufe",
      options: [
        { label: "H1", value: "h1" },
        { label: "H2", value: "h2" },
        { label: "H3", value: "h3" },
        { label: "H4", value: "h4" },
      ],
    },
    alignment: {
      type: "select",
      label: "Ausrichtung",
      options: [
        { label: "Links", value: "left" },
        { label: "Zentriert", value: "center" },
        { label: "Rechts", value: "right" },
      ],
    },
  },
  defaultProps: {
    text: "Überschrift",
    level: "h2",
    alignment: "left",
  },
  render: ({ text, level, alignment }) => {
    const Tag = level;
    const sizes = {
      h1: "text-4xl font-bold",
      h2: "text-3xl font-bold",
      h3: "text-2xl font-semibold",
      h4: "text-xl font-semibold",
    };
    const align = {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    };
    return <Tag className={`${sizes[level]} ${align[alignment]}`}>{text}</Tag>;
  },
};

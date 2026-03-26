import type { ComponentConfig } from "@puckeditor/core";

export type TextProps = {
  content: string;
  alignment: "left" | "center" | "right";
};

export const Text: ComponentConfig<TextProps> = {
  label: "Text",
  fields: {
    content: { type: "textarea", label: "Inhalt" },
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
    content: "Hier steht Ihr Text.",
    alignment: "left",
  },
  render: ({ content, alignment }) => {
    const align = {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    };
    return (
      <div className={`${align[alignment]} text-[18px] leading-relaxed text-zinc-700 dark:text-zinc-300`}>
        {content.split("\n").map((line, i) => (
          <p key={i} className={i > 0 ? "mt-4" : ""}>
            {line}
          </p>
        ))}
      </div>
    );
  },
};

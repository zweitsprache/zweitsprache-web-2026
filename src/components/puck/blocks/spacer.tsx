import type { ComponentConfig } from "@puckeditor/core";

export type SpacerProps = {
  size: "sm" | "md" | "lg" | "xl";
};

export const Spacer: ComponentConfig<SpacerProps> = {
  label: "Abstand",
  fields: {
    size: {
      type: "select",
      label: "Grösse",
      options: [
        { label: "Klein (16px)", value: "sm" },
        { label: "Mittel (32px)", value: "md" },
        { label: "Gross (64px)", value: "lg" },
        { label: "Sehr gross (96px)", value: "xl" },
      ],
    },
  },
  defaultProps: {
    size: "md",
  },
  render: ({ size }) => {
    const heights = {
      sm: "h-4",
      md: "h-8",
      lg: "h-16",
      xl: "h-24",
    };
    return <div className={heights[size]} />;
  },
};

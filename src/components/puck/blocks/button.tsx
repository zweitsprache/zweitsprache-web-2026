import type { ComponentConfig } from "@puckeditor/core";

export type ButtonProps = {
  label: string;
  href: string;
  variant: "primary" | "outline";
  alignment: "left" | "center" | "right";
};

export const Button: ComponentConfig<ButtonProps> = {
  label: "Button",
  fields: {
    label: { type: "text", label: "Beschriftung" },
    href: { type: "text", label: "Link-URL" },
    variant: {
      type: "select",
      label: "Variante",
      options: [
        { label: "Primär", value: "primary" },
        { label: "Umriss", value: "outline" },
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
    label: "Mehr erfahren",
    href: "#",
    variant: "primary",
    alignment: "left",
  },
  render: ({ label, href, variant, alignment }) => {
    const align = {
      left: "justify-start",
      center: "justify-center",
      right: "justify-end",
    };
    const styles = {
      primary:
        "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200",
      outline:
        "border border-zinc-300 text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800",
    };
    return (
      <div className={`flex ${align[alignment]}`}>
        <a
          href={href}
          className={`inline-block rounded-md px-5 py-2.5 text-sm font-medium transition-colors ${styles[variant]}`}
        >
          {label}
        </a>
      </div>
    );
  },
};

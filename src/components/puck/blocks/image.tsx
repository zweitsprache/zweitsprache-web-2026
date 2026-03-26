import type { ComponentConfig } from "@puckeditor/core";

export type ImageProps = {
  url: string;
  alt: string;
  width: "full" | "contained";
  caption: string;
};

export const Image: ComponentConfig<ImageProps> = {
  label: "Bild",
  fields: {
    url: { type: "text", label: "Bild-URL" },
    alt: { type: "text", label: "Alt-Text" },
    width: {
      type: "select",
      label: "Breite",
      options: [
        { label: "Volle Breite", value: "full" },
        { label: "Begrenzt", value: "contained" },
      ],
    },
    caption: { type: "text", label: "Bildunterschrift" },
  },
  defaultProps: {
    url: "",
    alt: "",
    width: "contained",
    caption: "",
  },
  render: ({ url, alt, width, caption }) => {
    if (!url) {
      return (
        <div className="flex h-48 items-center justify-center rounded-md bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
          Bild-URL eingeben
        </div>
      );
    }
    return (
      <figure className={width === "contained" ? "mx-auto max-w-2xl" : ""}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={alt}
          className="h-auto w-full rounded-md"
        />
        {caption && (
          <figcaption className="mt-2 text-center text-sm text-zinc-500">
            {caption}
          </figcaption>
        )}
      </figure>
    );
  },
};

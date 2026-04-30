"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const HERO_IMAGES = [
  "/key-visual/hero/01.jpg",
  "/key-visual/hero/02.jpg",
];

const DEFAULT = HERO_IMAGES[0];

export function HeroImage() {
  const [src, setSrc] = useState(DEFAULT);

  useEffect(() => {
    setSrc(HERO_IMAGES[Math.floor(Math.random() * HERO_IMAGES.length)]);
  }, []);

  return (
    <Image
      key={src}
      src={src}
      alt="DaZ einfach machen"
      fill
      className="object-cover object-right"
    />
  );
}

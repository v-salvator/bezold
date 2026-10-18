import type { Metadata } from "next";
import { BASE_OPEN_GRAPH } from "@/constant/seo";

interface PageMetadataInput {
  title: string;
  description: string;
  path: string;
  images?: string[];
}

// * title / description / canonical / og in one call, so a page can never
// * silently inherit the homepage's canonical or share card again
export const pageMetadata = ({
  title,
  description,
  path,
  images,
}: PageMetadataInput): Metadata => ({
  title,
  description,
  alternates: { canonical: path },
  openGraph: {
    ...BASE_OPEN_GRAPH,
    title,
    description,
    url: path,
    images: images ?? [...BASE_OPEN_GRAPH.images],
  },
});

// * flatten line breaks and cap the length for <meta name="description">
export const toMetaDescription = (text: string, maxLength = 120) => {
  const flatText = text.replace(/\s+/g, " ").trim();
  return flatText.length > maxLength
    ? `${flatText.slice(0, maxLength - 1)}…`
    : flatText;
};

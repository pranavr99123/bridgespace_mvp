import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bridgespace",
    short_name: "Bridgespace",
    description: "A warmer way to communicate—Pulse for daily connection, Mirror for empathy practice.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f1419",
    theme_color: "#0f1419",
    orientation: "portrait-primary",
    categories: ["lifestyle", "health"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}

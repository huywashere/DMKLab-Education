import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://dmklab.edu.vn";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/about", "/articles", "/contact", "/dashboard"],
        disallow: ["/api/", "/_next/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

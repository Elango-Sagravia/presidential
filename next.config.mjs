/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hedonova.b-cdn.net",
        port: "",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
        ],
      },
    ];
  },
  // async rewrites() {
  //   return [
  //     { source: "/sitemap.xml", destination: "/sitemap" },
  //     { source: "/sitemap_main.xml", destination: "/sitemap_main" },
  //     { source: "/sitemap_blogs.xml", destination: "/sitemap_blogs" },
  //     { source: "/sitemap_policies.xml", destination: "/sitemap_policies" },
  //     { source: "/sitemap_pages.xml", destination: "/sitemap_pages" },
  //     { source: "/sitemap_archives.xml", destination: "/sitemap_archives" },
  //   ];
  // },
};

export default nextConfig;

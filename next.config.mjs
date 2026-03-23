/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim() || "";

const nextConfig = {
  ...(basePath ? { basePath } : {}),
  /**
   * macOS often hits EMFILE (too many open files) with native FS watchers; Watchpack then fails
   * and `next dev` can serve 404 for every route while only compiling `/_not-found`. Polling avoids
   * that at the cost of slightly higher CPU in dev. Set NEXT_DEV_NATIVE_WATCH=1 to disable.
   */
  webpack: (config, { dev }) => {
    if (dev && process.env.NEXT_DEV_NATIVE_WATCH !== "1") {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

export default nextConfig;

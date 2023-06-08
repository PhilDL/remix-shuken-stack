import { flatRoutes } from "remix-flat-routes";

/**
 * @type {import('@remix-run/dev').AppConfig}
 */
export default {
  cacheDirectory: "./node_modules/.cache/remix",
  ignoredRouteFiles: ["**/*"],
  tailwind: true,
  future: {
    v2_routeConvention: true,
    v2_normalizeFormMethod: true,
    v2_meta: true,
    v2_errorBoundary: true,
    unstable_dev: true,
  },
  serverDependenciesToBundle: [],
  serverModuleFormat: "esm",
  serverPlatform: "node",
  routes: async (defineRoutes) => {
    return flatRoutes("routes", defineRoutes, {
      ignoredRouteFiles: [
        ".*",
        "**/*.css",
        "**/*.test.{js,jsx,ts,tsx}",
        "**/__*.*",
      ],
    });
  },
};

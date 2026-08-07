/**
 * @intlify/vite-plugin-vue-i18n@7 resolves @intlify/shared to 12.0.0-alpha.x,
 * whose "exports" break Node CJS resolution when loading vite.config.ts.
 * Pin Intlify packages to the same major line as vue-i18n@11.
 */
function readPackage(pkg) {
  if (pkg.name === "@intlify/vite-plugin-vue-i18n" && pkg.dependencies) {
    pkg.dependencies["@intlify/shared"] = "11.4.2";
  }
  if (pkg.name === "@intlify/bundle-utils" && pkg.dependencies) {
    pkg.dependencies["@intlify/shared"] = "11.4.2";
    pkg.dependencies["@intlify/message-compiler"] = "11.4.2";
  }
  return pkg;
}

module.exports = {
  hooks: {
    readPackage,
  },
};

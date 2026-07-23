/**
 * Ambient module for `.sql` files. drizzle-kit generates migration files that
 * `migrations.js` imports as modules; babel-plugin-inline-import turns each into a string
 * at build time. This declaration lets TypeScript type those imports.
 */
declare module "*.sql" {
  const content: string;
  export default content;
}

const rawEnvironment =
  process.env.NEXT_PUBLIC_VERCEL_ENV ??
  process.env.VERCEL_ENV ??
  process.env.NODE_ENV ??
  'development';

const normalizedEnvironment = rawEnvironment.toLowerCase();

/**
 * Determines whether testnet-only resources should be exposed to the app.
 * Enables them for any environment other than production (e.g. localhost, dev, preview).
 */
export const SHOULD_INCLUDE_TESTNET_RESOURCES = normalizedEnvironment !== 'production';

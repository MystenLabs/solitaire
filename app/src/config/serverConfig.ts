// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import { z } from "zod";

/*
 * The schema for the server-side environment variables
 * These variables should be defined in:
 * * the app/.env.development.local file for the local environment
 * * the Vercel's UI for the deployed environment
 * They must not be tracked by Git
 * They are SECRET, and not exposed to the client side
 */

const serverConfigSchema = z.object({
  ENOKI_SECRET_KEY: z.string(),
  ADMIN_SECRET_KEY: z.string(),
});

// Provide fallback values during build time
const serverConfig = serverConfigSchema.safeParse({
  ENOKI_SECRET_KEY: process.env.ENOKI_SECRET_KEY || 'build-time-placeholder',
  ADMIN_SECRET_KEY: process.env.ADMIN_SECRET_KEY || 'build-time-placeholder',
});

if (!serverConfig.success) {
  console.error("Invalid environment variables:", serverConfig.error.format());
  throw new Error("Invalid environment variables");
}

// Runtime validation - throw if we're using placeholder values in production
// But skip validation during build time (when NEXT_PHASE is set)
if (serverConfig.data.ENOKI_SECRET_KEY === 'build-time-placeholder' || 
    serverConfig.data.ADMIN_SECRET_KEY === 'build-time-placeholder') {
  if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PHASE) {
    console.error("Production environment requires valid ENOKI_SECRET_KEY and ADMIN_SECRET_KEY");
    throw new Error("Missing required environment variables in production");
  }
}

export default serverConfig.data;
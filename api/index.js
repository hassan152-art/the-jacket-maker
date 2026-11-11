import app, { ensureStorage } from '../server/app.js';

// Handler for Vercel serverless deployment
export default async function handler(req, res) {
  await ensureStorage();
  return app(req, res);
}

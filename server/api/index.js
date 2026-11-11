import app, { ensureStorage } from '../app.js';

export default async function handler(req, res) {
  await ensureStorage();
  return app(req, res);
}

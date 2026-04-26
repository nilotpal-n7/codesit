import app, { connectDB } from '../server/src/index';
import type { IncomingMessage, ServerResponse } from 'http';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await connectDB();
  return app(req as any, res as any);
}

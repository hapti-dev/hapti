import { createServer } from 'node:http';
import Hapti from 'hapti-sdk';

const secret = process.env.HAPTI_WEBHOOK_SECRET;
const handled = new Set();

createServer(async (req, res) => {
  if (req.method !== 'POST') return res.writeHead(405).end();
  let raw = '';
  for await (const chunk of req) raw += chunk;
  if (!(await Hapti.verifyWebhook(raw, req.headers['hapti-signature'], secret))) return res.writeHead(400).end();
  const event = JSON.parse(raw);
  res.writeHead(200).end();
  if (handled.has(event.id)) return;
  handled.add(event.id);
  if (event.type === 'task.succeeded') console.log('done:', event.data.id, event.data.result?.answer);
  if (event.type === 'task.waiting') console.log('the agent asks:', event.data.pending?.text, event.data.pending?.action_url);
  if (event.type === 'task.failed') console.log('failed:', event.data.id, event.data.status);
}).listen(3000, () => console.log('listening on :3000/'));

import { stripe } from '../../../lib/stripe';

export const config = {
  api: { bodyParser: false },
};

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!stripe) return res.status(500).json({ error: 'Stripe not configured' });

  const sig = req.headers['stripe-signature'];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return res.status(500).json({ error: 'Webhook secret not configured' });

  let event;
  try {
    const rawBody = await readRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err) {
    console.error('[stripe webhook] signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  console.log('[stripe webhook] received:', event.type, event.id);

  // Milestones 2 and 3 handle the actual event types:
  //   checkout.session.completed (featured listing + dealer sub)
  //   customer.subscription.updated / .deleted (dealer sub lifecycle)
  //   invoice.payment_failed (dealer sub dunning)

  return res.status(200).json({ received: true });
}

// Single source of truth for all paid features.
// Amounts are in the smallest currency unit (cents for EUR).

export const CURRENCY = 'eur';

export const FEATURED_LISTING = {
  amount: 999,
  durationDays: 7,
  label: 'Feature for 7 days',
  description: 'Pin this listing to the top of its category for 7 days.',
};

export const DEALER_SUBSCRIPTION = {
  amount: 2999,
  intervalLabel: 'month',
  stripePriceId: process.env.STRIPE_DEALER_PRICE_ID || null,
  label: 'Dealer — €29.99/month',
  description: 'Unlimited featured listings, dealer badge, priority support.',
};

export function formatPrice(amountCents, currency = CURRENCY) {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amountCents / 100);
}

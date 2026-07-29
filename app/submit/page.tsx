import { redirect } from 'next/navigation'

/**
 * The old self-serve fixed-fee listing flow (₹1,000 / ₹3,000 + featured
 * add-on via Razorpay) is retired — enlisting an opportunity now goes
 * through /advertise so pricing can depend on the actual deal instead of
 * a fixed rate card. Redirecting rather than deleting the page keeps
 * every existing /submit link and bookmark landing somewhere useful.
 */
export default function SubmitPage() {
  redirect('/advertise')
}

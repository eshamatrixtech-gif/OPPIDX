import Razorpay from 'razorpay'

/** Number of billing cycles requested per subscription. Razorpay has no
 * literal "until cancelled" option, so we request a long run and rely on
 * the customer (or admin) to cancel via the provider if they ever want to
 * stop — same pattern most Razorpay subscription integrations use. */
export const SUBSCRIPTION_CYCLES = Number(process.env.RAZORPAY_SUBSCRIPTION_CYCLES ?? 100)

/** null when billing isn't configured yet — callers must check for this
 * and fail closed (503), never silently skip payment. */
export const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null

/** Flat fee to submit an opportunity for review — this is a premium,
 * hand-curated board, not a free-for-all bulletin. Paying gets a listing a
 * human review; it never buys approval. */
export const SUBMISSION_FEE_INR = 1000
export const SUBMISSION_FEE_PAISE = SUBMISSION_FEE_INR * 100

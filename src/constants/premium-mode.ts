// Switch between premium calculation methods.
// 'bajaj'  — full CKYC + proposal flow via Bajaj APIs
// 'static' — direct Bharat Bhraman lookup by no_of_days (no CKYC required)
export const PREMIUM_MODE: 'bajaj' | 'static' = 'static';

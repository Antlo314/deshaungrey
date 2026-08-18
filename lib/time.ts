/** Request-scoped clock. Server components render per request, so reading the
 *  time is intentional; this keeps the React purity lint honest about where it happens. */
export const nowMs = () => Date.now();
export const nowDate = () => new Date();

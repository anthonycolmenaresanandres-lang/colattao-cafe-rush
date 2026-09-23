/** A deadline per provider request, with no application-level write retries. */
export function ownerFetch(fetcher: typeof fetch = fetch, deadline: () => AbortSignal = () => AbortSignal.timeout(15_000)): typeof fetch {
  return (input, init) => {
    const incoming = init?.signal ?? (input instanceof Request ? input.signal : undefined);
    const timeout = deadline();
    const signal = incoming ? AbortSignal.any([incoming, timeout]) : timeout;
    return fetcher(input, { ...init, signal, cache: "no-store" });
  };
}

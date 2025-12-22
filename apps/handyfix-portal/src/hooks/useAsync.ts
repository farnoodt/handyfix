import { useCallback, useEffect, useRef, useState } from "react";

export function useAsync<T>(fn: () => Promise<T>, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const cancelledRef = useRef(false);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fn();
      if (!cancelledRef.current) setData(res);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Request failed";
      if (!cancelledRef.current) setError(msg);
    } finally {
      if (!cancelledRef.current) setLoading(false);
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    cancelledRef.current = false;
    void run();
    return () => {
      cancelledRef.current = true;
    };
  }, [run]);

  return { data, setData, error, setError, loading, run };
}

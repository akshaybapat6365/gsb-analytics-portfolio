"use client";

import { useEffect, useMemo, useState } from "react";
import type { z } from "zod";

const cache = new Map<string, unknown>();

type State<T> = {
  data: T | null;
  error: string | null;
  loading: boolean;
};

export function useValidatedJson<TSchema extends z.ZodTypeAny>(
  url: string,
  schema: TSchema,
): State<z.infer<TSchema>> {
  const stableKey = useMemo(() => url, [url]);
  const [state, setState] = useState<State<z.infer<TSchema>>>({
    data: (cache.get(stableKey) as z.infer<TSchema> | undefined) ?? null,
    error: null,
    loading: !cache.has(stableKey),
  });

  useEffect(() => {
    let alive = true;

    async function run() {
      if (cache.has(stableKey)) {
        return;
      }

      try {
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const json = await res.json();
        const parsed = schema.parse(json);
        cache.set(stableKey, parsed);
        if (!alive) return;
        setState({ data: parsed, error: null, loading: false });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        if (!alive) return;
        setState({ data: null, error: message, loading: false });
      }
    }

    void run();
    return () => {
      alive = false;
    };
  }, [schema, stableKey, url]);

  return state;
}


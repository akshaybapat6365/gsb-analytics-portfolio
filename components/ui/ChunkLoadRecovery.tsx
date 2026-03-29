"use client";

import { useEffect } from "react";
import { isRecoverableChunkError } from "@/lib/runtime/chunkLoadRecovery";

const RETRY_KEY = "vb-labs:chunk-recovery";
const RETRY_COOLDOWN_MS = 15_000;

function shouldAttemptRecovery() {
  try {
    const raw = window.sessionStorage.getItem(RETRY_KEY);
    if (!raw) {
      return true;
    }

    const parsed = Number.parseInt(raw, 10);
    if (!Number.isFinite(parsed)) {
      return true;
    }

    return Date.now() - parsed > RETRY_COOLDOWN_MS;
  } catch {
    return true;
  }
}

function markRecoveryAttempt() {
  try {
    window.sessionStorage.setItem(RETRY_KEY, String(Date.now()));
  } catch {
    // Ignore storage failures and still attempt a single reload.
  }
}

function clearExpiredRecoveryAttempt() {
  try {
    const raw = window.sessionStorage.getItem(RETRY_KEY);
    if (!raw) {
      return;
    }

    const parsed = Number.parseInt(raw, 10);
    if (!Number.isFinite(parsed) || Date.now() - parsed > RETRY_COOLDOWN_MS) {
      window.sessionStorage.removeItem(RETRY_KEY);
    }
  } catch {
    // Ignore storage failures.
  }
}

function reloadCurrentRoute() {
  if (!shouldAttemptRecovery()) {
    return;
  }

  markRecoveryAttempt();
  window.location.reload();
}

export function ChunkLoadRecovery() {
  useEffect(() => {
    clearExpiredRecoveryAttempt();

    const handleWindowError = (event: ErrorEvent) => {
      if (isRecoverableChunkError(event.error ?? event.message)) {
        reloadCurrentRoute();
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (isRecoverableChunkError(event.reason)) {
        reloadCurrentRoute();
      }
    };

    window.addEventListener("error", handleWindowError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleWindowError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return null;
}

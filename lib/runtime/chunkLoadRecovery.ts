const CHUNK_ERROR_PATTERNS = [
  /loading chunk \d+ failed/i,
  /chunkloaderror/i,
  /failed to fetch dynamically imported module/i,
  /importing a module script failed/i,
];

export function isRecoverableChunkError(error: unknown): boolean {
  const message = extractErrorMessage(error);

  if (!message) {
    return false;
  }

  return CHUNK_ERROR_PATTERNS.some((pattern) => pattern.test(message));
}

function extractErrorMessage(error: unknown): string {
  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === "object") {
    const maybeMessage = Reflect.get(error, "message");
    if (typeof maybeMessage === "string") {
      return maybeMessage;
    }

    const maybeReason = Reflect.get(error, "reason");
    if (typeof maybeReason === "string") {
      return maybeReason;
    }
    if (maybeReason instanceof Error) {
      return maybeReason.message;
    }
    if (maybeReason && typeof maybeReason === "object") {
      const nestedMessage = Reflect.get(maybeReason, "message");
      if (typeof nestedMessage === "string") {
        return nestedMessage;
      }
    }
  }

  return "";
}

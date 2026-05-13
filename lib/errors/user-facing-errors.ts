import axios from "axios";

type ErrorContext = "auth" | "load" | "mutation";

const DEFAULT_MESSAGES: Record<ErrorContext, string> = {
  auth: "Your session could not be restored. Please try again.",
  load: "We couldn't load this data right now.",
  mutation: "Something went wrong. Please try again.",
};

export function getUserFacingErrorMessage(
  error: unknown,
  context: ErrorContext = "mutation",
  fallback?: string
) {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;

    if (context === "auth") {
      if (status === 401 || status === 403) {
        return "Your session is no longer available. Please sign in again.";
      }

      return fallback || DEFAULT_MESSAGES.auth;
    }

    if (context === "load") {
      if (status === 404) {
        return "We couldn't find this data right now.";
      }

      return fallback || DEFAULT_MESSAGES.load;
    }

    if (status === 401 || status === 403) {
      return "You do not have access to complete this action.";
    }
  }

  return fallback || DEFAULT_MESSAGES[context];
}

export function logErrorContext(scope: string, error: unknown) {
  if (process.env.NODE_ENV !== "development") return;
  console.error(`[${scope}]`, error);
}

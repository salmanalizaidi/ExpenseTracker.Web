/**
 * Typed error thrown by server-side API helpers when the backend returns a
 * non-2xx response or is unreachable.  Carry the HTTP status code so callers
 * (page components, route handlers) can branch on it — e.g. redirect on 401.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

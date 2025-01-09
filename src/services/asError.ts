/**
 * Return the error as-is if it's already an Error it, otherwise convert it into an Error.
 *
 * In 99.9% of cases a catch statement gets an Error but out of safety TypeScript specifies it as an annoying `unknown`
 * and you can't cast it to an Error `catch (err: Error)` results in a "Catch clause variable type annotation must be 'any' or 'unknown' if specified."
 */
export default function asError(err: unknown): Error {
  if (err instanceof Error) {
    return err;
  }
  if (
    typeof err === "object" &&
    err !== null &&
    "message" in err &&
    typeof err.message === "string"
  ) {
    if (
      "name" in err &&
      typeof err.name === "string" &&
      (!("stack" in err) || typeof err.stack === "string")
    ) {
      return err as Error;
    }
    return new Error(err.message);
  }
  if (typeof err === "string") {
    return new Error(err);
  }
  return new TypeError(`'${typeof err}' was used as Error`);
}

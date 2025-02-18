import { ServerActionError, ServerActionResult } from "./action";

// Unwraps the result of a server action to get the data inside it.
// If it happens to be an error, it will throw a ServerActionError.
//
// Especially useful to use with useSWR, it'll trigger a toast on error
// (if correctly setup).
export async function unwrap<T>(result: Promise<ServerActionResult<T>>): Promise<T> {
  const awaited = await result;

  if (!awaited.success) {
    throw new ServerActionError(awaited.message, awaited.code);
  }

  return awaited.data;
}

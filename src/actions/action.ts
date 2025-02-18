/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { AxiosError } from "axios";
import { redirect } from "next/navigation";

export type ServerActionResult<T> =
  | { success: true; data: T }
  | { success: false; message: string; code: string };

export class ServerActionError extends Error {
  public code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "ServerActionError";
    this.code = code;
  }
}

const MAX_DBG_STR_LEN = 100;
const jsonTruncateStr = (_: string, value: any) =>
  typeof value === "string" && value.length > MAX_DBG_STR_LEN
    ? value.slice(0, MAX_DBG_STR_LEN) + "..."
    : value;

// Server action wrapper that handles errors and redirects to login page
// if access token has expired.
export function serverAction<Return, Args extends unknown[] = []>(
  callback: (...args: Args) => Promise<Return>,
  functionCode: string
): (...args: Args) => Promise<ServerActionResult<Return>> {
  return async (...args: Args) => {
    try {
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.log(`~~ 🚀 CALL ${functionCode}`, JSON.stringify(args, null, 2));
      }

      const result = await callback(...args);

      if (
        process.env.NODE_ENV === "development" ||
        process.env.NODE_ENV === "production"
      ) {
        // eslint-disable-next-line no-console
        console.log(
          `~~ 📡 RETURN ${functionCode}`,
          "ARGS:",
          JSON.stringify(args, jsonTruncateStr, 2),
          "RESULT:",
          JSON.stringify(result, jsonTruncateStr, 2)
        );
      }

      return { success: true, data: result };
    } catch (error) {
      if (
        process.env.NODE_ENV === "development" ||
        process.env.NODE_ENV === "test" ||
        process.env.NODE_ENV === "production"
      ) {
        // eslint-disable-next-line no-console
        console.error(
          `~~ ☄️  ERROR ${functionCode}`,
          "ARGS:",
          JSON.stringify(args, jsonTruncateStr, 2),
          "RESULT:",
          error
        );
      }

      if (error instanceof ServerActionError) {
        return { success: false, message: error.message, code: error.code };
      } else if (error instanceof AxiosError) {
        if (error.code === "006") {
          redirect("/auth/login");
        }

        if (error.response) {
          return {
            success: false,
            message: error.response.data.message,
            code: error.response.data.code,
          };
        }
      }

      throw error;
    }
  };
}

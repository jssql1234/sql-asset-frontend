import { ApiError, TimeoutError, type ApiResponse } from "@/types/commonApiRes";
// import { getAuthToken, getDbName, setAuthToken } from "./auth";
// import {
//   generateRefreshAuthToken,
//   refreshAuthnToken,
// } from "@/auth/services/token";
// import { logoutUser } from "./login/logout";

// Add concurrent refresh protection
// let refreshPromise: Promise<string> | null = null;
// let logoutPromise: Promise<void> | null = null;

// const performTokenRefresh = async (): Promise<string> => {
//   if (!refreshPromise) {
//     refreshPromise = (async () => {
//       const dbName = getDbName() ?? "";

//       const tryAuthToken = async (): Promise<string> => {
//         try {
//           const newAuthToken = await generateRefreshAuthToken(dbName);
//           setAuthToken(newAuthToken);
//           return newAuthToken;
//         } catch (e) {
//           if (e instanceof ApiError) throw e;
//           throw new ApiError(`Unknown error refreshing auth token: ${e}`);
//         }
//       };

//       try {
//         // first attempt
//         return await tryAuthToken();
//       } catch (e) {
//         if (e instanceof ApiError && e.status === 401) {
//           // refresh authn token, then retry
//           await refreshAuthnToken();
//           return await tryAuthToken();
//         }
//         throw e;
//       } finally {
//         refreshPromise = null;
//       }
//     })();
//   }
//   return refreshPromise;
// };

// const performLogout = async () => {
//   if (!logoutPromise) {
//     logoutPromise = (async () => {
//       try {
//         await logoutUser();
//       } finally {
//         logoutPromise = null; // reset for future sessions
//       }
//     })();
//   }
//   return logoutPromise;
// };

export const createFetchWithTimeout = (timeoutMs = 60000, withAuth = true) => {
  return async <T>(
    url: string,
    options: RequestInit = {},
    selfReturnToken: string | null = null
  ): Promise<T> => {
    const makeRequest = async (): // refreshedToken: string | null = null
    Promise<T> => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      // For no error purpose
      console.log(selfReturnToken, withAuth);

      // const token =
      //   refreshedToken ?? selfReturnToken ?? (withAuth ? getAuthToken() : null);

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            ...options.headers,
            // ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!response.ok) {
          let errorBody: ApiResponse<T> | string;

          try {
            errorBody = await response.json();
          } catch {
            errorBody = await response.text();
          }

          if (
            typeof errorBody === "object" &&
            errorBody !== null &&
            "code" in errorBody
          ) {
            const apiError = errorBody as ApiResponse<T>;
            throw new ApiError(
              `HTTP ${response.status}: ${apiError.message}`,
              response.status,
              apiError.code,
              apiError.data
            );
          }

          throw new ApiError(
            `HTTP ${response.status}: ${
              typeof errorBody === "string" ? errorBody : "Unknown error"
            } `,
            response.status
          );
        }

        return response.json();
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") {
          throw new TimeoutError(
            `Request timed out after ${timeoutMs / 1000} seconds`
          );
        }
        if (e instanceof ApiError) throw e;
        throw new ApiError(`Unexpected error: ${e}`);
      } finally {
        clearTimeout(timeout);
      }
    };

    const executeWithRetry = async (): Promise<T> => {
      const res = await makeRequest().catch(async (err) => {
        // if (err instanceof ApiError && err.status === 401 && withAuth) {
        //   try {
        //     const newToken = await performTokenRefresh();
        //     return await makeRequest(newToken);
        //   } catch (refreshErr) {
        //     console.error("Failed to refresh token:", refreshErr);
        //     await performLogout();
        //     throw new ApiError("Session expired. Please login again.");
        //   }
        // } else if (err instanceof ApiError && err.status === 401 && !withAuth) {
        //   console.error("Authn Token expired or invalid");
        //   await performLogout();
        //   throw new ApiError("Token expired or invalid. Please login again.");
        // }

        throw err;
      });

      return res;
    };

    return executeWithRetry();
  };
};

export const fetchWithToken = createFetchWithTimeout(60000, true);
export const fetchWithoutToken = createFetchWithTimeout(60000, false);

export const validateApiResponse = <T>(
  response: ApiResponse<T>,
  operation: string
): T => {
  if (response.code !== 0) {
    throw new ApiError<T>(
      `${operation} failed: ${response.message}`,
      undefined,
      response.code,
      response.data
    );
  }
  return response.data;
};

export const createApiClient = (baseUrl: string) => {
  return async <TResponse, TPayload = undefined>(
    endpoint: string,
    options?: {
      method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
      payload?: TPayload;
      needAuthn?: boolean; // not usable
      bearerToken?: string | null; // not usable
    }
  ): Promise<TResponse> => {
    const url = `${baseUrl}${endpoint}`;
    const {
      method = "GET",
      payload = undefined,
      needAuthn = true,
      bearerToken: selfReturnToken = null,
    } = options || {};

    try {
      const requestOptions: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (payload && payload != undefined) {
        requestOptions.body = JSON.stringify(payload);
      }

      return needAuthn
        ? await fetchWithToken<TResponse>(url, requestOptions, selfReturnToken)
        : await fetchWithoutToken<TResponse>(url, requestOptions);
    } catch (e) {
      if (e instanceof ApiError) throw e;
      throw new ApiError(`Unknown error calling ${endpoint}: ${e}`);
    }
  };
};

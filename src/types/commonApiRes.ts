export class ApiError<T = unknown> extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: number,
    public data?: T
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class TimeoutError extends ApiError {
  constructor(message: string = "Request timed out") {
    super(message);
    this.name = "TimeoutError";
  }
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export type Result<T> = { ok: true; value: T } | { ok: false; error: ApiError };

export const ok = <T>(value: T): Result<T> => ({ ok: true, value });
export const err = (error: ApiError): Result<never> => ({ ok: false, error });

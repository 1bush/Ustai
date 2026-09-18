/**
 * Gabime të tipizuara për aplikacionin Ustai.
 * Aplikuar sipas skill-it `error-handling`:
 *  - gabimet janë vlera të klasit të parë me strukturë (code + statusCode)
 *  - mesazhi për përdoruesin ≠ mesazhi për zhvilluesin
 *  - asnjë gabim nuk gëlltitet në heshtje — kapet, hidhet ose loggohet
 */

export type ErrorCode =
  | 'INTERNAL'
  | 'NETWORK'
  | 'VALIDATION'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'RATE_LIMITED'
  | 'AI_FAILED';

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly statusCode: number;
  readonly details?: unknown;

  constructor(message: string, code: ErrorCode = 'INTERNAL', statusCode = 500, details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    // Ruan zinxhirin e prototipit për `instanceof` kur transpilohet në ES5.
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NetworkError extends AppError {
  constructor(message = 'Lidhja me serverin dështoi. Kontrollo internetin.', details?: unknown) {
    super(message, 'NETWORK', 0, details);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION', 422, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Nuk je i autentikuar. Hyr në llogari për të vazhduar.') {
    super(message, 'UNAUTHORIZED', 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Nuk ke leje për të kryer këtë veprim.') {
    super(message, 'FORBIDDEN', 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(`${resource} nuk u gjet${id ? `: ${id}` : '.'}`, 'NOT_FOUND', 404);
  }
}

export class RateLimitError extends AppError {
  constructor(readonly retryAfterMs = 15 * 60 * 1000) {
    super('Shumë përpjekje. Prisni pak dhe provoni përsëri.', 'RATE_LIMITED', 429);
  }
}

export class AIFailedError extends AppError {
  constructor(message = 'Asistenti AI nuk u përgjigj. Provo përsëri.', details?: unknown) {
    super(message, 'AI_FAILED', 502, details);
  }
}

/**
 * Harton kodin e gabimit në një mesazh të kuptueshëm për përdoruesin.
 * Detajet teknike nuk dalin kurrë në ndërfaqe.
 */
const USER_ERROR_MESSAGES: Record<ErrorCode, string> = {
  INTERNAL: 'Diçka shkoi keq nga ana jonë. Provo përsëri më vonë.',
  NETWORK: 'Lidhja me serverin dështoi. Kontrollo internetin dhe provo përsëri.',
  VALIDATION: 'Kontrollo të dhënat e futura dhe provo përsëri.',
  UNAUTHORIZED: 'Hyr në llogari për të vazhduar.',
  FORBIDDEN: 'Nuk ke leje për të kryer këtë veprim.',
  NOT_FOUND: 'Elementi i kërkuar nuk u gjet.',
  RATE_LIMITED: 'Shumë përpjekje. Prisni pak dhe provoni përsëri.',
  AI_FAILED: 'Asistenti AI nuk u përgjigj. Provo përsëri.',
};

/** Kthen mesazhin për përdoruesin për një gabim të panjohur në mënyrë të sigurt. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }
  if (error instanceof Error) {
    // Mesazhi i hardkuar nuk duhet të shfaqet direkt; kthejmë një mesazh të standardizuar.
    console.warn('Gabim i pakategorizuar për përdoruesin:', error.message);
    return USER_ERROR_MESSAGES.INTERNAL;
  }
  return USER_ERROR_MESSAGES.INTERNAL;
}

export { USER_ERROR_MESSAGES };
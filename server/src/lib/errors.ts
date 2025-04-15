export class AppError extends Error {
  public fieldErrors?: Record<string, string>;
  public statusCode?: number;

  constructor(message: string, statusCode?: number);
  constructor(
    message: string,
    fieldErrors?: Record<string, string>,
    statusCode?: number
  );
  constructor(
    message: string,
    fieldErrorsOrStatusCode?: Record<string, string> | number,
    maybeStatusCode?: number
  ) {
    super(message);

    if (typeof fieldErrorsOrStatusCode === "number") {
      this.statusCode = fieldErrorsOrStatusCode ?? 400;
    } else {
      this.fieldErrors = fieldErrorsOrStatusCode;
      this.statusCode = maybeStatusCode ?? 400;
    }

    Object.setPrototypeOf(this, AppError.prototype);
  }
}

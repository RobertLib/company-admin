import { Request, Response, NextFunction } from "express";
import { AppError } from "../lib/errors.js";

interface ListParamsOptions {
  allowedSortFields?: string[];
  filterValidators?: {
    [key: string]: (value: any) => {
      error?: string;
      valid: boolean;
    };
  };
}

export function validateListParams(options: ListParamsOptions = {}) {
  const {
    allowedSortFields = ["id", "createdAt", "updatedAt"],
    filterValidators = {},
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const errors: Record<string, string> = {};

    if (req.query.page) {
      const parsedPage = Number(req.query.page);
      if (isNaN(parsedPage) || parsedPage < 1) {
        errors.page = "Page must be a positive number";
      }
    }

    if (req.query.limit) {
      const parsedLimit = Number(req.query.limit);
      if (isNaN(parsedLimit) || parsedLimit < 1) {
        errors.limit = "Limit must be a positive number";
      }
    }

    if (req.query.sortBy) {
      if (typeof req.query.sortBy !== "string") {
        errors.sortBy = "Sort field must be a string";
      } else if (!allowedSortFields.includes(req.query.sortBy)) {
        errors.sortBy = `Sort field must be one of: ${allowedSortFields.join(
          ", "
        )}`;
      }
    }

    if (req.query.order) {
      if (
        typeof req.query.order !== "string" ||
        !["asc", "desc"].includes(req.query.order)
      ) {
        errors.order = "Order must be either 'asc' or 'desc'";
      }
    }

    if (
      req.query.showDeleted &&
      req.query.showDeleted !== "true" &&
      req.query.showDeleted !== "false"
    ) {
      errors.showDeleted = "ShowDeleted must be either 'true' or 'false'";
    }

    for (const [key, validator] of Object.entries(filterValidators)) {
      if (req.query[key] !== undefined) {
        const result = validator(req.query[key]);
        if (!result.valid) {
          errors[key] = result.error || `Invalid ${key} parameter`;
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      throw new AppError("Invalid list parameters", errors);
    }

    next();
  };
}

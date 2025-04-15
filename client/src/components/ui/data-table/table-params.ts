import { cache } from "react";
import logger from "../../../utils/logger";

export function computeTableParams(searchParams: URLSearchParams) {
  const pageStr = searchParams.get("page");
  const page = pageStr ? parseInt(pageStr, 10) : 1;
  const validPage = isNaN(page) ? 1 : page;
  const limitStr = searchParams.get("limit");
  const limit = limitStr ? parseInt(limitStr, 10) : 20;
  const validLimit = isNaN(limit) ? 20 : limit;

  const sortBy = searchParams.get("sortBy") ?? "id";
  const order = searchParams.get("order") ?? "desc";

  let filters = {} as Record<string, string>;
  try {
    const filtersStr = searchParams.get("filters");
    if (filtersStr && filtersStr.trim() !== "") {
      filters = JSON.parse(filtersStr);
    }
  } catch (error) {
    logger.error("Error parsing filters from URL params:", error);
  }

  const showDeleted = searchParams.get("showDeleted") === "true";

  return {
    page: validPage,
    limit: validLimit,
    sortBy,
    order,
    filters,
    showDeleted,
  };
}

export const getTableParams = cache(computeTableParams);

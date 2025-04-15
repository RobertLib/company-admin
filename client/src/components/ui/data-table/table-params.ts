import { cache } from "react";

export function computeTableParams(searchParams: URLSearchParams) {
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "20", 10);
  const sortBy = searchParams.get("sortBy") ?? "id";
  const order = searchParams.get("order") ?? "desc";
  const filters = JSON.parse(searchParams.get("filters") ?? "{}");
  const showDeleted = searchParams.get("showDeleted") === "true";

  return { page, limit, sortBy, order, filters, showDeleted };
}

export const getTableParams = cache(computeTableParams);

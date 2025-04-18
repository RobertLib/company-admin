import { cache } from "react";

export interface TableParams {
  filters?: string;
  limit?: string;
  page?: string;
  sortKey?: string;
  sortOrder?: string;
}

export function computeTableParams(
  searchParams: TableParams | URLSearchParams,
) {
  if (searchParams instanceof URLSearchParams) {
    const filters = JSON.parse(searchParams.get("filters") ?? "{}");
    const limit = parseInt(searchParams.get("limit") ?? "20", 10);
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const sortKey = searchParams.get("sortKey") ?? "id";
    const sortOrder = searchParams.get("sortOrder") ?? "desc";

    return { filters, limit, page, sortKey, sortOrder };
  }

  const filters = JSON.parse(searchParams.filters ?? "{}");
  const limit = parseInt(searchParams.limit ?? "20", 10);
  const page = parseInt(searchParams.page ?? "1", 10);
  const sortKey = searchParams.sortKey ?? "id";
  const sortOrder = searchParams.sortOrder ?? "desc";

  return { filters, limit, page, sortKey, sortOrder };
}

export const getTableParams = cache(computeTableParams);

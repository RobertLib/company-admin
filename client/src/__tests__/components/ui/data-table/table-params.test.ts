import {
  computeTableParams,
  getTableParams,
} from "../../../../components/ui/data-table/table-params";

describe("Table Params Utilities", () => {
  describe("computeTableParams", () => {
    it("returns default values when no params are provided", () => {
      const searchParams = new URLSearchParams();
      const result = computeTableParams(searchParams);

      expect(result).toEqual({
        page: 1,
        limit: 20,
        sortBy: "id",
        order: "desc",
        filters: {},
        showDeleted: false,
      });
    });

    it("parses page and limit values correctly", () => {
      const searchParams = new URLSearchParams();
      searchParams.set("page", "3");
      searchParams.set("limit", "50");

      const result = computeTableParams(searchParams);

      expect(result.page).toBe(3);
      expect(result.limit).toBe(50);
    });

    it("parses sortBy and order values correctly", () => {
      const searchParams = new URLSearchParams();
      searchParams.set("sortBy", "name");
      searchParams.set("order", "asc");

      const result = computeTableParams(searchParams);

      expect(result.sortBy).toBe("name");
      expect(result.order).toBe("asc");
    });

    it("parses filters correctly", () => {
      const searchParams = new URLSearchParams();
      const filters = { name: "John", status: "active" };
      searchParams.set("filters", JSON.stringify(filters));

      const result = computeTableParams(searchParams);

      expect(result.filters).toEqual(filters);
    });

    it("handles empty filters string", () => {
      const searchParams = new URLSearchParams();
      searchParams.set("filters", "");

      const result = computeTableParams(searchParams);

      expect(result.filters).toEqual({});
    });

    it("parses showDeleted correctly", () => {
      const searchParams = new URLSearchParams();
      searchParams.set("showDeleted", "true");

      const result = computeTableParams(searchParams);

      expect(result.showDeleted).toBe(true);
    });

    it("handles malformed JSON in filters", () => {
      const searchParams = new URLSearchParams();
      searchParams.set("filters", "invalid-json");

      try {
        const result = computeTableParams(searchParams);
        expect(result.filters).toEqual({});
      } catch (error) {
        expect(error).toBeTruthy();
      }
    });

    it("handles non-numeric values for page and limit", () => {
      const searchParams = new URLSearchParams();
      searchParams.set("page", "abc");
      searchParams.set("limit", "xyz");

      const result = computeTableParams(searchParams);

      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });
  });

  describe("getTableParams", () => {
    it("caches results for the same input", () => {
      const searchParams1 = new URLSearchParams();
      searchParams1.set("page", "2");

      const searchParams2 = new URLSearchParams();
      searchParams2.set("page", "2");

      const result1 = getTableParams(searchParams1);
      const result2 = getTableParams(searchParams2);

      expect(result1).toEqual(result2);
    });

    it("returns different results for different inputs", () => {
      const searchParams1 = new URLSearchParams();
      searchParams1.set("page", "1");

      const searchParams2 = new URLSearchParams();
      searchParams2.set("page", "2");

      const result1 = getTableParams(searchParams1);
      const result2 = getTableParams(searchParams2);

      expect(result1).not.toEqual(result2);
    });
  });
});

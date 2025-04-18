import { useSearchParams } from "react-router";
import Pagination from "../pagination";
import Select from "../select";

interface TableFooterProps {
  limit: number;
  page: number;
  total?: number;
}

export function TableFooter({ limit, page, total }: TableFooterProps) {
  const [, setSearchParams] = useSearchParams();

  return (
    <footer className="mt-4 flex items-center justify-end gap-3">
      <Select
        defaultValue={limit}
        dim="sm"
        onChange={({ target }) => {
          setSearchParams((prev) => {
            prev.set("limit", target.value);
            return prev;
          });
        }}
        options={[5, 10, 15, 20, 25, 30, 50, 100].map((value) => ({
          label: value.toString(),
          value,
        }))}
      />

      <Pagination
        limit={limit}
        onChange={(page) => {
          setSearchParams((prev) => {
            prev.set("page", String(page));
            return prev;
          });
        }}
        page={page}
        total={total}
      />
    </footer>
  );
}

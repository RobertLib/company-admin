const locales = "cs-CZ";

export default function formatDate(
  date?: Date | string | null,
  format?: "date" | "time",
) {
  if (!date) {
    return "";
  }

  const parsedDate = typeof date === "string" ? new Date(date) : date;

  if (format === "date") {
    return parsedDate.toLocaleDateString(locales, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  if (format === "time") {
    return parsedDate.toLocaleTimeString(locales, {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return parsedDate.toLocaleString(locales, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

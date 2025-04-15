import { Breadcrumbs, Calendar, Header } from "../../components/ui";
import { getDictionary } from "../../dictionaries";

export default function CalendarPage() {
  const dict = getDictionary();

  return (
    <div className="container mx-auto p-4">
      <Breadcrumbs
        className="mb-2"
        items={[{ href: "/calendar", label: dict.calendar.title }]}
      />

      <Header className="mb-3" title={dict.calendar.title} />

      <Calendar
        events={[
          {
            id: "1",
            title: "Event 1",
            start: new Date(),
            end: new Date(new Date().getTime() + 60 * 60 * 1000),
          },
          {
            id: "2",
            title: "Event 2",
            start: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
            end: new Date(
              new Date().getTime() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000,
            ),
          },
        ]}
      />
    </div>
  );
}

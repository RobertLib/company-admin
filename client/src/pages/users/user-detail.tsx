import {
  Breadcrumbs,
  DescriptionList,
  Header,
  Panel,
} from "../../components/ui";
import { getDictionary } from "../../dictionaries";
import { useParams } from "react-router";
import { User } from "../../types";
import useQuery from "../../hooks/use-query";

export default function UserDetailPage() {
  const dict = getDictionary();

  const { id } = useParams();

  const { data: user } = useQuery<User>(`/users/${id}`);

  return (
    <div className="container mx-auto p-4">
      <Breadcrumbs
        className="mb-2"
        items={[
          { href: "/users", label: dict.users.title },
          { label: user?.name },
        ]}
      />

      <Header back className="mb-3" title={user?.name} />

      <Panel>
        <DescriptionList
          items={[
            { term: dict.user.name, description: user?.name },
            { term: dict.user.email, description: user?.email },
            { term: dict.user.role, description: user?.role },
          ]}
        />
      </Panel>
    </div>
  );
}

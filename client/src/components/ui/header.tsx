import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";
import cn from "../../utils/cn";
import IconButton from "./icon-button";

interface HeaderProps extends React.ComponentProps<"div"> {
  actions?: React.ReactNode;
  back?: boolean;
  title: string;
}

export default function Header({
  actions,
  back,
  className,
  title,
  ...props
}: HeaderProps) {
  const navigate = useNavigate();

  return (
    <div
      {...props}
      className={cn("flex items-center justify-between", className)}
    >
      <div className="flex items-center gap-2.5">
        {back && (
          <IconButton aria-label="Back" onClick={() => navigate(-1)}>
            <ArrowLeft size={24} />
          </IconButton>
        )}
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>
      {actions}
    </div>
  );
}

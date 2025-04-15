interface AccordionProps extends React.ComponentProps<"details"> {
  summary: string;
}

export default function Accordion({
  children,
  summary,
  ...props
}: AccordionProps) {
  return (
    <details {...props}>
      <summary>{summary}</summary>
      {children}
    </details>
  );
}

export default function FormError({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (!children) return null;

  return (
    <span className="text-danger-500 animate-fade-in text-sm">{children}</span>
  );
}

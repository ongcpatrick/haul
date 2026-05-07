interface SectionHeadingProps {
  children: React.ReactNode;
}

export function SectionHeading({ children }: SectionHeadingProps) {
  return (
    <h3 className="font-semibold text-[#1a1a1a] mb-3 text-[15px] tracking-tight">
      {children}
    </h3>
  );
}

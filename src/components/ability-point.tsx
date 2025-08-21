export default function AbilityPoint({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-start gap-2">
      <div className="size-[8px] bg-[#C0C0C0]" />
      <div className="text-sm font-bold uppercase text-white">{title}</div>
    </div>
  );
}

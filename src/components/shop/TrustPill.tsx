type Props = {
  icon: React.ReactNode;
  title: string;
  sub?: string;
};

/** Shared trust-signal chip — Home's horizontal strip and the PDP mini-row both draw from this content family. */
export function TrustPill({ icon, title, sub }: Props) {
  return (
    <div className="flex flex-none items-center gap-2.5 rounded-[11px] border border-greige/16 bg-[rgba(20,20,23,.7)] px-3.5 py-2.5">
      <span className="inline-flex text-champagne">{icon}</span>
      <div className="leading-[1.25]">
        <div className="font-body text-[11.5px] font-medium whitespace-nowrap text-ivory">{title}</div>
        {sub && <div className="font-body text-[10px] whitespace-nowrap text-ivory/50">{sub}</div>}
      </div>
    </div>
  );
}

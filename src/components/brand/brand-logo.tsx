import { APP_NAME, LOGO_IMAGE } from "@/lib/constants";

export function BrandLogo({
  size = 88,
  showName = false,
}: {
  size?: number;
  showName?: boolean;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LOGO_IMAGE}
        alt={APP_NAME}
        width={size}
        height={size}
        className="block shrink-0 rounded-full object-contain ring-1 ring-accent/40"
        style={{ width: size, height: size }}
      />
      {showName ? (
        <p className="font-display mt-3 text-xs font-semibold uppercase tracking-[0.22em] text-accent">
          {APP_NAME}
        </p>
      ) : null}
    </div>
  );
}

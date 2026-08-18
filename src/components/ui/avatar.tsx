import { displayName, resolveProfileImage } from "@/lib/profile-image";

type Props = {
  user: {
    firstName?: string | null;
    lastName?: string | null;
    name?: string | null;
    profileImage?: string | null;
    googleImage?: string | null;
    image?: string | null;
  };
  size?: number;
  className?: string;
};

export function Avatar({ user, size = 40, className = "" }: Props) {
  const src = resolveProfileImage(user);
  const alt = displayName(user);

  return (
    // Avatars come from local assets, Google or Blob; next/image is not required here.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full object-cover bg-card ring-1 ring-accent/30 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

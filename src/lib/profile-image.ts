import { DEFAULT_PROFILE_IMAGE } from "@/lib/constants";

type ImageSource = {
  profileImage?: string | null;
  googleImage?: string | null;
  image?: string | null;
};

export function resolveProfileImage(user: ImageSource | null | undefined): string {
  return (
    user?.profileImage ||
    user?.googleImage ||
    user?.image ||
    DEFAULT_PROFILE_IMAGE
  );
}

export function displayName(user: { firstName?: string | null; lastName?: string | null; name?: string | null }) {
  const full = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  if (full) return full;
  return user.name?.trim() || "Participante";
}

export function splitFullName(fullName?: string | null): { firstName: string; lastName: string } {
  const parts = (fullName ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "Participante", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

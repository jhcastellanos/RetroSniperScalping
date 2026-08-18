import { requireUser } from "@/lib/session";
import { ProfileCard } from "@/components/profile/profile-card";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <ProfileCard
      user={{
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profileImage: user.profileImage,
        googleImage: user.googleImage,
        image: user.image,
      }}
    />
  );
}

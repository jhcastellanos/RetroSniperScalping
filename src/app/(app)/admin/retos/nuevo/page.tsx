import { ChallengeForm } from "@/components/admin/challenge-form";

export default function NewChallengePage() {
  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-semibold">Nuevo reto</h1>
      <ChallengeForm />
    </div>
  );
}

import { loginWithGoogle } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export function GoogleButton({ label = "Continuar con Google" }: { label?: string }) {
  return (
    <form action={loginWithGoogle}>
      <Button type="submit" variant="secondary">
        <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-black text-slate-900">
          G
        </span>
        {label}
      </Button>
    </form>
  );
}

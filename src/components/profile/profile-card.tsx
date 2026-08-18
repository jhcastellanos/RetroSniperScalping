"use client";

import { useActionState, useRef, useState } from "react";
import { clearCustomPhoto, updateProfile, uploadProfilePhoto } from "@/actions/profile";
import { logout } from "@/actions/auth";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { compressProfilePhoto } from "@/lib/compress-image";

type UserView = {
  firstName: string;
  lastName: string;
  email: string;
  profileImage: string | null;
  googleImage: string | null;
  image: string | null;
};

export function ProfileCard({ user }: { user: UserView }) {
  const [editing, setEditing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [state, action, pending] = useActionState(updateProfile, {} as { error?: string; success?: boolean });

  return (
    <div className="space-y-4">
      <Card className="flex flex-col items-center p-6 text-center">
        <Avatar
          user={{ ...user, profileImage: preview ?? user.profileImage }}
          size={112}
        />
        <h1 className="mt-4 text-2xl font-semibold">
          {user.firstName} {user.lastName}
        </h1>
        <p className="text-sm text-muted">{user.email}</p>
        <div className="mt-5 grid w-full gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              setPhotoError(null);
              const compressed = await compressProfilePhoto(file);
              setPreview(URL.createObjectURL(compressed));
              const formData = new FormData();
              formData.append("photo", compressed);
              const result = await uploadProfilePhoto(formData);
              if (result.error) setPhotoError(result.error);
              else setPhotoError(null);
            }}
          />
          <Button type="button" variant="secondary" onClick={() => fileRef.current?.click()}>
            Cambiar foto
          </Button>
          {user.profileImage ? (
            <Button
              type="button"
              variant="ghost"
              onClick={async () => {
                await clearCustomPhoto();
                setPreview(null);
              }}
            >
              Quitar foto personalizada
            </Button>
          ) : null}
          {photoError ? <p className="text-sm text-negative">{photoError}</p> : null}
        </div>
      </Card>

      {editing ? (
        <Card className="space-y-4 p-5">
          <form action={action} className="space-y-4">
            <Input name="firstName" label="Nombre" defaultValue={user.firstName} required />
            <Input name="lastName" label="Apellido" defaultValue={user.lastName} required />
            <Input name="email" label="Correo" value={user.email} disabled />
            {state.error ? <p className="text-sm text-negative">{state.error}</p> : null}
            <Button type="submit" disabled={pending}>
              {pending ? "Guardando..." : "Guardar perfil"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
              Cancelar
            </Button>
          </form>
        </Card>
      ) : (
        <Button type="button" variant="secondary" onClick={() => setEditing(true)}>
          Editar perfil
        </Button>
      )}

      <Card className="space-y-3 p-5">
        <h2 className="text-lg font-semibold">Apariencia</h2>
        <p className="text-sm text-muted">
          Oscuro usa el navy y el oro del logo. Claro usa fondo blanco y letras en el azul oscuro.
        </p>
        <ThemeToggle />
      </Card>

      <form action={logout}>
        <Button type="submit" variant="ghost">
          Cerrar sesión
        </Button>
      </form>
    </div>
  );
}

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";
import { env, isGoogleAuthConfigured } from "@/lib/env";
import { loginSchema } from "@/lib/validations";
import { splitFullName } from "@/lib/profile-image";

const googleProvider = isGoogleAuthConfigured()
  ? [
      Google({
        clientId: env.googleClientId,
        clientSecret: env.googleClientSecret,
        allowDangerousEmailAccountLinking: true,
      }),
    ]
  : [];

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    ...googleProvider,
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });
        if (!user?.passwordHash) return null;

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`.trim(),
          image: user.profileImage ?? user.googleImage ?? user.image,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          profileImage: user.profileImage,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role ?? "USER";
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.profileImage = user.profileImage;
      }

      if ((trigger === "signIn" || trigger === "signUp" || !token.role) && token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: {
            role: true,
            firstName: true,
            lastName: true,
            profileImage: true,
            googleImage: true,
            image: true,
            name: true,
          },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.firstName = dbUser.firstName;
          token.lastName = dbUser.lastName;
          token.profileImage = dbUser.profileImage ?? dbUser.googleImage ?? dbUser.image;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role ?? "USER";
        session.user.firstName = token.firstName ?? "";
        session.user.lastName = token.lastName ?? "";
        session.user.profileImage = token.profileImage ?? null;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.id) return;
      const existing = await prisma.user.findUnique({ where: { id: user.id } });
      if (!existing) return;

      const names = splitFullName(user.name ?? existing.name);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          firstName: existing.firstName || names.firstName,
          lastName: existing.lastName || names.lastName,
          googleImage: user.image ?? existing.googleImage,
          profileImage: existing.profileImage,
          image: user.image ?? existing.image,
        },
      });
    },
    async linkAccount({ user, profile }) {
      if (!user.id) return;
      const image = (profile as { picture?: string; image?: string } | undefined)?.picture
        ?? (profile as { image?: string } | undefined)?.image
        ?? user.image;
      if (!image) return;
      const existing = await prisma.user.findUnique({ where: { id: user.id } });
      if (!existing) return;
      await prisma.user.update({
        where: { id: user.id },
        data: {
          googleImage: image,
          image: existing.image ?? image,
        },
      });
    },
  },
});

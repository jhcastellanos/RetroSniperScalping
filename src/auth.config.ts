import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/iniciar-sesion",
    newUser: "/crear-cuenta",
  },
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = Boolean(auth?.user);
      const { pathname } = request.nextUrl;
      const isAuthRoute =
        pathname.startsWith("/iniciar-sesion") || pathname.startsWith("/crear-cuenta");
      const isPublicAsset =
        pathname.startsWith("/images") ||
        pathname.startsWith("/icons") ||
        pathname.startsWith("/uploads") ||
        pathname === "/manifest.webmanifest" ||
        pathname === "/sw.js";

      if (isPublicAsset) return true;
      if (isAuthRoute) {
        if (isLoggedIn) return Response.redirect(new URL("/", request.nextUrl));
        return true;
      }
      return isLoggedIn;
    },
  },
} satisfies NextAuthConfig;

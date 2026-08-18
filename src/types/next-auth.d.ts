import { Role } from "@prisma/client";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: Role;
      profileImage: string | null;
      name?: string | null;
      image?: string | null;
    };
  }

  interface User {
    firstName?: string;
    lastName?: string;
    role?: Role;
    profileImage?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
    firstName?: string;
    lastName?: string;
    profileImage?: string | null;
  }
}

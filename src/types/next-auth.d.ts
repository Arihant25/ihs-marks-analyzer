import "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      rollNumber?: string;
    };
  }

  interface User {
    rollNumber?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    rollNumber?: string;
  }
}

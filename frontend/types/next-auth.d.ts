import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    backendJwt: string;
    githubLogin: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    backendJwt?: string;
    githubLogin?: string;
  }
}

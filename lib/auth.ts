import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import type { Adapter } from "next-auth/adapters";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      httpOptions: {
        timeout: 10000,
      },
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.modify",
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        return user;
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      return true;
    },
    async jwt({ token, user, account }) {
      console.log("JWT Callback Triggered:", { tokenId: token?.id, userId: user?.id, accountProvider: account?.provider });
      if (account && account.provider === "google") {
        console.log("Connecting Google Account in JWT...");
        // We are connecting a Google account!
        const cookieStore = await cookies();
        const linkUserId = cookieStore.get("link_account_user_id")?.value;
        const targetUserId = linkUserId || (token.id as string) || (user?.id as string);
        console.log("Target User ID for Google Account:", targetUserId);
        if (targetUserId) {
          try {
            const existingAccount = await prisma.account.findFirst({
              where: { provider: "google", providerAccountId: account.providerAccountId }
            });
            if (existingAccount) {
              await prisma.account.update({
                where: { id: existingAccount.id },
                data: {
                  access_token: account.access_token,
                  refresh_token: account.refresh_token || undefined,
                  expires_at: account.expires_at,
                  scope: account.scope,
                  userId: targetUserId
                }
              });
            } else {
              await prisma.account.create({
                data: {
                  userId: targetUserId,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  access_token: account.access_token,
                  refresh_token: account.refresh_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                  session_state: account.session_state as string | null,
                }
              });
            }
          } catch (error) {
            console.error("Failed to link account in jwt callback:", error);
          }
        }
      }

      if (user) {
        const cookieStore = await cookies();
        const linkUserId = cookieStore.get("link_account_user_id")?.value;

        // Only update token.id to the OAuth user if we are NOT linking an account
        if (linkUserId && account?.provider === "google") {
          token.id = linkUserId;
        } else if (!token.id) {
          token.id = user.id;
        }
        
        const staff = await prisma.staff.findUnique({
          where: { accountId: token.id as string },
          include: { role: true }
        });

        if (staff) {
          token.tenantId = staff.userId;
          token.staffId = staff.id;
          token.role = staff.role;
        } else {
          token.tenantId = token.id;
          token.role = { name: "ADMIN", permissions: ["ALL"] };
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.tenantId = token.tenantId as string;
        session.user.staffId = token.staffId as string | undefined;
        session.user.role = token.role as any;
      }
      return session;
    },
  },
};

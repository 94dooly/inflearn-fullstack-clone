import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import { comparePassword } from "./lib/password-utils";

export const { handlers, auth, signIn, signOut } = NextAuth({
  useSecureCookies: process.env.NODE_ENV === "production",
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  secret: process.env.AUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "이메일",
          type: "email",
          placeholder: "이메일을 입력해주세요.",
        },
        password: {
          label: "비밀번호",
          type: "password",
          placeholder: "비밀번호를 입력해주세요.",
        },
      },
      async authorize(credentials) {
        // 1. 모든 값들이 정상적으로 들어왔는가?
        if (!credentials || !credentials.email || !credentials.password) {
          throw new Error("이메일과 비밀번호를 입력해주세요.");
        }

        // 2. DB에서 유저를 찾기
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string,
          },
        });

        if (!user) {
          throw new Error("존재하지 않는 이메일입니다.");
        }

        // 3. 비밀번호 일치 여부 확인
        const passwordsMatch = comparePassword(
          credentials.password as string,
          user.hashedPassword as string
        );

        if (!passwordsMatch) {
          throw new Error("비밀번호가 일치하지 않습니다.");
        }

        return user;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {},
  callbacks: {},
});

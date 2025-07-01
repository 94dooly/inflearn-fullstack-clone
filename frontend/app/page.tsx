import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (!session) {
    redirect("/signin");
  }

  return (
    <div>
      <p>현재 로그인한 유저 보여주기</p>
      <p>이메일 = {session?.user?.email}</p>
      <form
        action={async () => {
          "use server";
          await signOut();
        }}
      >
        <button type="submit">로그아웃</button>
      </form>
    </div>
  );
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import HomePage from "@/components/HomePage";

const Home = async () => {
  const session = await getServerSession(authOptions);
  if (!session || !session.uid) {
    redirect("/logowanie");
  }

  return (
    <div className="page w-screen">
      <HomePage />
    </div>
  );
};

export default Home;

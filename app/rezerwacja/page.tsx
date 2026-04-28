import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import ReservationPage from "@/components/ReservationPage";

const Home = async () => {
  const session = await getServerSession(authOptions);
  if (!session || !session.uid) {
    redirect("/logowanie");
  }

  return (
    <div className="page w-screen">
      <ReservationPage />
    </div>
  );
};

export default Home;

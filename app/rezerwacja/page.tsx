import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import ReservationPage from "@/components/ReservationPage";

const Home = async () => {
  const session = await getServerSession(authOptions);
  const allowedUID = process.env.ADMIN_ID;
  const isAdmin = session && session.uid === allowedUID;
  if (!session || !session.uid) {
    redirect("/logowanie");
  }
  if (isAdmin) {
    redirect("/");
  }

  return (
    <div className="page w-screen">
      <ReservationPage />
    </div>
  );
};

export default Home;

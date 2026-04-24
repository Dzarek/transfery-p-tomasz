import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import TransfersPage from "@/components/TransfersPage";

const Transfers = async () => {
  const session = await getServerSession(authOptions);
  if (!session || !session.uid) {
    redirect("/logowanie");
  }

  return (
    <div className="page w-screen">
      <TransfersPage />
    </div>
  );
};

export default Transfers;

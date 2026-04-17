"use client";
import { logout } from "@/lib/user.actions";
import toast from "react-hot-toast";
import { signOut } from "next-auth/react";
import { useGlobalContext } from "./authContext";
import { useSession } from "next-auth/react";
import FirstLoading from "./FirstLoading";
import { redirect } from "next/navigation";

const Navbar = () => {
  const { setIsLogin } = useGlobalContext();
  const { status } = useSession();

  const handleLogout = async () => {
    await logout();
    await signOut({ callbackUrl: "/" });
    setIsLogin(false);
    toast("Poprawnie wylogowano", {
      icon: "👋",
      style: {
        borderRadius: "10px",
        background: "#000",
        color: "#fff",
      },
    });
  };
  if (status === "loading") {
    return <FirstLoading />;
  }
  if (status === "unauthenticated") {
    redirect("/logowanie");
  }
  return (
    <div>
      <button className="bg-amber-900 p-10" onClick={() => handleLogout()}>
        logout
      </button>
    </div>
  );
};

export default Navbar;

"use client";

import { useState, useEffect, useContext, createContext } from "react";
import { auth } from "@/firebase/clientApp";
import { onAuthStateChanged } from "firebase/auth";
import { SessionProvider } from "next-auth/react";
import { subscribePush } from "@/notification/Notification";

const defaultValues: ContextTypes = {
  activeUser: null,
  name: "",
  isLogin: false,
  loading: true,
  email: "",
  modalName: false,
  setIsLogin: () => false,
  setName: () => "",
  setModalName: () => false,
  setLoading: () => true,
};

const AppContext = createContext<ContextTypes>(defaultValues);

const AppProvider = ({
  children,
  isAdmin,
}: {
  children: React.ReactNode;
  isAdmin: boolean;
}) => {
  const [activeUser, setActiveUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [modalName, setModalName] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setActiveUser(user);
        setIsLogin(true);
        if (user.displayName) {
          setName(user.displayName);
        }
        if (user.email) {
          setEmail(user.email);
        }
        if (user.displayName === null) {
          setModalName(true);
        }
      } else {
        setActiveUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // NOTIFICATION

  useEffect(() => {
    if (!activeUser?.uid) return;

    subscribePush(activeUser.uid, isAdmin);
  }, [activeUser, isAdmin]);

  // END NOTIFICATION

  return (
    <SessionProvider>
      <AppContext.Provider
        value={{
          activeUser,
          name,
          isLogin,
          loading,
          email,
          modalName,
          setIsLogin,
          setName,
          setModalName,
          setLoading,
        }}
      >
        {children}
      </AppContext.Provider>
    </SessionProvider>
  );
};

export const useGlobalContext = () => {
  return useContext(AppContext);
};

export { AppContext, AppProvider };

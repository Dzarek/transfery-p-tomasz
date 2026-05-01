"use client";

import { auth, db } from "@/firebase/clientApp";
import { getDoc, setDoc, doc } from "firebase/firestore";
import {
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  updateEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendEmailVerification,
} from "firebase/auth";
import toast from "react-hot-toast";
import { unsubscribePush } from "@/notification/Notification";

export const login = async (email: string, password: string) => {
  logout();
  const userCred = await signInWithEmailAndPassword(auth, email, password);
  const getData = doc(db, `usersList/${userCred.user.uid}`);
  const data2 = await getDoc(getData);
  if (data2.data()) {
    const item = data2.data();
    if (item!.activeAccount === false) {
      await logout();
      toast("Konto zostało usunięte!", {
        icon: "✖",
        style: {
          borderRadius: "10px",
          background: "#280505",
          color: "#fff",
        },
      });
      throw new Error("ACCOUNT_DISABLED");
    }
  }
  return await userCred.user.getIdToken();
};

export const logout = async () => {
  try {
    await unsubscribePush();
    await signOut(auth);
  } catch (error) {
    console.error("Błąd podczas wylogowywania", error);
  }
};

export const updateName = async (newName: string) => {
  await updateProfile(auth.currentUser!, {
    displayName: newName,
  });
  const userRef = doc(db, "usersList", auth.currentUser!.uid);
  setDoc(
    userRef,
    {
      userName: newName,
    },
    {
      merge: true,
    },
  );
  toast("Nick został zmieniony!", {
    icon: "✔",
    style: {
      borderRadius: "10px",
      background: "#052814",
      color: "#fff",
    },
  });
};

export const checkPassword = async (password: string, email: string) => {
  try {
    const credential = EmailAuthProvider.credential(
      auth.currentUser!.email!,
      password,
    );

    await reauthenticateWithCredential(auth.currentUser!, credential);
    await updateProfileEmail(email);
  } catch {
    toast("Nieprawidłowe hasło!", {
      icon: "✖",
      style: {
        borderRadius: "10px",
        background: "#280505",
        color: "#fff",
      },
    });
  }
};
// };

export const updateProfileEmail = async (newEmail: string) => {
  await updateEmail(auth.currentUser!, newEmail)
    .then(() => {
      // console.log("Email updated successfully!");
      sendEmailVerification(auth.currentUser!);
      toast("Adres email został zmieniony!", {
        icon: "✔",
        style: {
          borderRadius: "10px",
          background: "#052814",
          color: "#fff",
        },
      });
    })
    .catch((error) => {
      if (error.code === "auth/email-already-in-use") {
        toast("Ten adres email jest już używany przez innego użytkownika!", {
          icon: "✖",
          style: {
            borderRadius: "10px",
            background: "#280505",
            color: "#fff",
          },
        });
      } else {
        // console.error("Error updating email:", error);
        toast("Coś poszło nie tak!", {
          icon: "✖",
          style: {
            borderRadius: "10px",
            background: "#280505",
            color: "#fff",
          },
        });
      }
    });
  const userRef = doc(db, "usersList", auth.currentUser!.uid);
  setDoc(
    userRef,
    {
      email: newEmail,
    },
    {
      merge: true,
    },
  );
};

export const updateUser = async (newName: string) => {
  await updateName(newName);
  if (auth.currentUser!.email) {
    changePassword();
  }
};

export const changePassword = async () => {
  await sendPasswordResetEmail(auth, auth.currentUser!.email!)
    .then(() => {
      // Password reset email sent!
      // ..
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      // ..
    });
};
export const changePasswordWhenLogin = async (email: string) => {
  await sendPasswordResetEmail(auth, email)
    .then(() => {
      // Password reset email sent!
      // ..
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      // ..
    });
};

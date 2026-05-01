"use client";

import React, { useState, useEffect, useContext, useMemo } from "react";
import moment from "moment/min/moment-with-locales";
import { db, auth } from "../firebase/clientApp";
import {
  collection,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  doc,
  deleteDoc,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  updateProfile,
  getAuth,
  sendPasswordResetEmail,
  User as FirebaseUser,
} from "firebase/auth";
import * as XLSX from "xlsx";
import { sendConfirmationCancel } from "../lib/api";
import { logout } from "@/lib/user.actions";
import { signOut } from "next-auth/react";
import { Transfer } from "./TransfersList";
import toast from "react-hot-toast";

// --- TYPY I INTERFEJSY ---

export interface MoneyData {
  minPeople: number;
  maxPeople: number;
  price: number;
  provision: number;
  nightProvision: number;
}

export interface TransferData {
  id: string;
  userID: string;
  status: string;
  date: string; // format YYYY-MM-DD
  time: string; // format HH:mm
  nameOfGuest: string;
  direction: string;
  flight: string;
  people: number;
  phone: string;
  price: number;
  provision: number;
  details: string;
  createdDate: number;
  specialTransfer?: boolean;
}

export interface UserData {
  id: string;
  userName: string;
  activeAccount: boolean;
  money: MoneyData[];
  itemsArray?: TransferData[];
}

export interface BackupData {
  id: string;
  name: string;
  money: MoneyData[];
  itemsArray: TransferData[];
}

// Skrócony interfejs dla opcji eksportowanych z kontekstu
export interface AppContextType {
  isAdmin: boolean;
  allUsersList: UserData[];
  next5transfers: TransferData[];
  transfers: TransferData[];
  name: string | null;
  currentUser: FirebaseUser | null;
  confirmDelete: boolean;
  currentMonthYear: string;
  prevMonthYear: string;
  modalName: boolean;
  activeHotel: any; // Jeśli masz typ dla hotelu, zamień `any`
  loading: boolean;
  moneyData: MoneyData[];
  monthProvision: number;
  monthAdminEarn: number;
  monthAdminEarnAll: number;
  monthProvisionAll: number;
  prevMonthProvision: number;
  prevMonthAdminEarn: number;
  prevMonthAdminEarnAll: number;
  prevMonthProvisionAll: number;
  file: BackupData[] | null;
  lastAddedTransfers: TransferData[];
  setMoneyData: React.Dispatch<React.SetStateAction<MoneyData[]>>;
  setTransfers: React.Dispatch<React.SetStateAction<TransferData[]>>;
  postProducts: (
    id: string,
    userID: string,
    status: string,
    date: string,
    time: string,
    nameOfGuest: string,
    direction: string,
    people: number,
    details: string,
    flight: string,
    phone: string,
    price: number,
    provision: number,
    createdDate: number,
    specialTransfer?: boolean,
  ) => Promise<void>;
  setConfirmDelete: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedTransfer: React.Dispatch<React.SetStateAction<Transfer | null>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  handleStatus: () => Promise<void>;
  setActiveHotel: React.Dispatch<React.SetStateAction<any>>;
  setName: React.Dispatch<React.SetStateAction<string | null>>;
  setUserID: React.Dispatch<React.SetStateAction<string>>;
  updateUser: (newName: string) => Promise<void>;
  updateName: (newName: string) => Promise<void>;
  changePassword: () => Promise<void>;
  changePasswordWhenLogin: (email: string) => Promise<void>;
  updateHotelPrice: () => void;
  createNewUser: (
    email: string,
    password: string,
    newName: string,
  ) => Promise<void>;
  disableUser: () => Promise<void>;
  getAllUsers: () => Promise<void>;
  exportData: () => void;
  uploadData: () => Promise<void>;
  setFile: React.Dispatch<React.SetStateAction<BackupData[] | null>>;
  deleteData: () => Promise<void>;
}

// --- INICJALIZACJA KONTEKSTU ---

const AppContext2 = React.createContext<AppContextType | undefined>(undefined);

moment.locale("pl");
const currentMonthYear = moment().format("MMMM YYYY");
const prevMonthYear = moment().subtract(1, "month").format("MMMM YYYY");

const money: MoneyData[] = [
  { minPeople: 1, maxPeople: 3, price: 130, provision: 35, nightProvision: 10 },
  { minPeople: 4, maxPeople: 8, price: 160, provision: 50, nightProvision: 20 },
];

export const AppProvider2: React.FC<{
  children: React.ReactNode;
  isAdmin: boolean;
}> = ({ children, isAdmin }) => {
  // STATE
  const [transfers, setTransfers] = useState<TransferData[]>([]);
  const [allUsersList, setAllUsersList] = useState<UserData[]>([]);
  const [allUsersTransfers, setAllUsersTransfers] = useState<TransferData[]>(
    [],
  );
  const [moneyData, setMoneyData] = useState<MoneyData[]>(money);

  const [userID, setUserID] = useState<string>("0");
  const [name, setName] = useState<string | null>("");
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [modalName, setModalName] = useState<boolean>(false);
  const [activeHotel, setActiveHotel] = useState<any>(null);
  const [file, setFile] = useState<BackupData[] | null>(null);
  const [downloadData, setDownloadData] = useState<BackupData[] | null>(null);

  const authInstance = getAuth();

  const activeTransfers = useMemo(
    () => transfers.filter((t) => t.status !== "cancel"),
    [transfers],
  );

  // Dla Admina
  const { next5transfers, lastAddedTransfers } = useMemo(() => {
    const now = moment();
    const tomorrowEnd = moment().add(1, "day").endOf("day");

    if (!isAdmin) {
      const next5 = activeTransfers
        .filter((item) => {
          const [h, m] = item.time.split(":").map(Number);
          const dateTime = moment(item.date).add(h, "hours").add(m, "minutes");

          return dateTime.isAfter(now);
        })
        .slice(0, 5);

      return { next5transfers: next5, lastAddedTransfers: [] };
    }

    const sorted = [...allUsersTransfers].sort((a, b) => {
      const [hA, mA] = a.time.split(":").map(Number);
      const [hB, mB] = b.time.split(":").map(Number);

      const dateA = moment(a.date).add(hA, "hours").add(mA, "minutes");
      const dateB = moment(b.date).add(hB, "hours").add(mB, "minutes");

      return dateA.valueOf() - dateB.valueOf();
    });

    const homePage = sorted.filter((item) => {
      const [h, m] = item.time.split(":").map(Number);
      const dateTime = moment(item.date).add(h, "hours").add(m, "minutes");

      return dateTime.isAfter(now);
    });

    const adminNext5 = homePage
      .filter((item) => {
        const [h, m] = item.time.split(":").map(Number);
        const dateTime = moment(item.date).add(h, "hours").add(m, "minutes");

        return dateTime.isBefore(tomorrowEnd);
      })
      .filter((item) => item.status !== "cancel");

    const lastAdded = homePage.filter(
      (item) =>
        item.createdDate > moment().subtract(1, "days").valueOf() &&
        item.status !== "cancel",
    );

    return { next5transfers: adminNext5, lastAddedTransfers: lastAdded };
  }, [activeTransfers, allUsersTransfers, isAdmin]);

  // Kalkulacje finansowe - User
  const {
    monthProvision,
    monthAdminEarn,
    prevMonthProvision,
    prevMonthAdminEarn,
  } = useMemo(() => {
    let mProv = 0,
      mEarn = 0,
      pProv = 0,
      pEarn = 0;
    const okTransfers = activeTransfers.filter((t) => t.status === "ok");

    okTransfers.forEach((item) => {
      const dateStr = moment(item.date).format("MMMM YYYY");
      if (dateStr === currentMonthYear) {
        mProv += item.provision;
        mEarn += item.price - item.provision;
      } else if (dateStr === prevMonthYear) {
        pProv += item.provision;
        pEarn += item.price - item.provision;
      }
    });

    return {
      monthProvision: mProv,
      monthAdminEarn: mEarn,
      prevMonthProvision: pProv,
      prevMonthAdminEarn: pEarn,
    };
  }, [activeTransfers]);

  // Kalkulacje finansowe - All Users (Admin)
  const {
    monthProvisionAll,
    monthAdminEarnAll,
    prevMonthProvisionAll,
    prevMonthAdminEarnAll,
  } = useMemo(() => {
    let mProvAll = 0,
      mEarnAll = 0,
      pProvAll = 0,
      pEarnAll = 0;
    const okTransfers = allUsersTransfers.filter((t) => t.status === "ok");

    okTransfers.forEach((item) => {
      const dateStr = moment(item.date).format("MMMM YYYY");
      if (dateStr === currentMonthYear) {
        mProvAll += item.provision;
        mEarnAll += item.price - item.provision;
      } else if (dateStr === prevMonthYear) {
        pProvAll += item.provision;
        pEarnAll += item.price - item.provision;
      }
    });

    return {
      monthProvisionAll: mProvAll,
      monthAdminEarnAll: mEarnAll,
      prevMonthProvisionAll: pProvAll,
      prevMonthAdminEarnAll: pEarnAll,
    };
  }, [allUsersTransfers]);

  // --- AUTH METHODS ---

  const handleLogout = async () => {
    await logout();
    await signOut({ callbackUrl: "/logowanie" });
  };

  const createNewUser = async (
    email: string,
    password: string,
    newName: string,
  ) => {
    await createUserWithEmailAndPassword(auth, email, password);
    if (!authInstance.currentUser) return;
    const userRef = doc(db, "usersList", authInstance.currentUser.uid);
    await setDoc(
      userRef,
      { userName: newName, activeAccount: true, money: money },
      { merge: true },
    );
    handleLogout();
  };

  const getAllUsers = async () => {
    const allUsersCollectionRef = collection(db, "usersList");
    const data = await getDocs(allUsersCollectionRef);
    let items = data.docs
      .filter((d) => d.id !== "0")
      .map((d) => ({ ...d.data(), id: d.id }) as UserData);

    items = items.filter((el) => el.activeAccount === true);

    setAllUsersList(items);

    const backupArray: BackupData[] = [];
    const bigItemsMap = new Map<string, TransferData>();

    // Optymalizacja: Zbieramy referencje nasłuchiwaczy aby móc je później odłączyć
    const unsubscribes: Unsubscribe[] = [];

    items.forEach((el) => {
      const collectionData = collection(db, `usersList/${el.id}/transfers`);
      const unsub = onSnapshot(collectionData, (snapshot) => {
        const itemsAllUsers = snapshot.docs.map(
          (d) => ({ ...d.data(), id: d.id }) as TransferData,
        );

        itemsAllUsers.forEach((item) => {
          bigItemsMap.set(item.id, item); // Unikalne dzięki Map
        });

        // Ustawianie Backup Data
        const existingBackupIndex = backupArray.findIndex(
          (b) => b.id === el.id,
        );
        const backupObj: BackupData = {
          id: el.id,
          name: el.userName,
          money: el.money,
          itemsArray: itemsAllUsers,
        };

        if (existingBackupIndex >= 0) {
          backupArray[existingBackupIndex] = backupObj;
        } else {
          backupArray.push(backupObj);
        }

        setDownloadData([...backupArray]);
        setAllUsersTransfers(Array.from(bigItemsMap.values()));
      });
      unsubscribes.push(unsub);
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        setUserID(user.uid);
        setName(user.displayName);

        if (isAdmin) {
          await getAllUsers();
        }

        const getData = doc(db, `usersList/${user.uid}`);
        await getDoc(getData);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAdmin]);

  // --- USER METHODS ---

  const updateUser = async (newName: string) => {
    if (authInstance.currentUser?.displayName === null) {
      await updateName(newName);
      await changePassword();
    }
    setModalName(false);
  };

  const updateName = async (newName: string) => {
    if (!authInstance.currentUser) return;

    try {
      await updateProfile(authInstance.currentUser, {
        displayName: newName,
      });

      setName(newName);

      const userRef = doc(db, "usersList", authInstance.currentUser.uid);
      await setDoc(userRef, { userName: newName }, { merge: true });

      toast("Nazwa użytkownika zmieniona", {
        icon: "✓",
        style: { borderRadius: "10px", background: "#052810", color: "#fff" },
      });
    } catch (error) {
      console.error(error);
      toast("Błąd podczas zmiany nazwy", {
        icon: "✖",
        style: { borderRadius: "10px", background: "#281105", color: "#fff" },
      });
    }
  };

  const changePassword = async () => {
    if (!authInstance.currentUser?.email) return;

    try {
      await sendPasswordResetEmail(
        authInstance,
        authInstance.currentUser.email,
      );

      toast("Wysłano email do zmiany hasła", {
        icon: "✓",
        style: { borderRadius: "10px", background: "#052810", color: "#fff" },
      });
    } catch (error) {
      console.error(error);
      toast("Nie udało się wysłać emaila", {
        icon: "✖",
        style: { borderRadius: "10px", background: "#281105", color: "#fff" },
      });
    }
  };

  const changePasswordWhenLogin = async (email: string) => {
    await sendPasswordResetEmail(authInstance, email).catch(console.error);
  };

  const disableUser = async () => {
    const userRef = doc(db, "usersList", userID);
    try {
      await setDoc(userRef, { activeAccount: false }, { merge: true });
      toast("Użytkownik zablokowany", {
        icon: "✓",
        style: { borderRadius: "10px", background: "#052810", color: "#fff" },
      });
    } catch (error) {
      console.error(error);
      toast("Nie udało się zablokować użytkownika", {
        icon: "✖",
        style: { borderRadius: "10px", background: "#281105", color: "#fff" },
      });
    }
  };

  // --- FETCH DATA ---

  const getProducts = async () => {
    if (userID === "0") return;

    const collectionRef = collection(db, `usersList/${userID}/transfers`);
    const getMoneyData = doc(db, `usersList/${userID}`);

    try {
      const data2 = await getDoc(getMoneyData);
      const item = data2.data();
      setMoneyData(item?.money ? item.money : money);

      return onSnapshot(collectionRef, (snapshot) => {
        const fetchedItems = snapshot.docs.map(
          (d) => ({ ...d.data(), id: d.id }) as TransferData,
        );

        fetchedItems.sort((a, b) => {
          const msA =
            Number(a.time.split(":")[0]) * 3600000 +
            Number(a.time.split(":")[1]) * 60000;
          const msB =
            Number(b.time.split(":")[0]) * 3600000 +
            Number(b.time.split(":")[1]) * 60000;
          return (
            new Date(a.date).getTime() +
            msA -
            (new Date(b.date).getTime() + msB)
          );
        });

        setTransfers(fetchedItems);
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    // 1. Zmienna trzymająca funkcję czyszczącą
    let unsubscribe: Unsubscribe | undefined;

    // 2. Tworzymy funkcję pomocniczą wewnątrz, aby obsłużyć asynchroniczność
    const setupSubscription = async () => {
      if (currentUser && userID !== "0") {
        // Wywołujemy getProducts i przypisujemy zwrócony onSnapshot do zmiennej
        const unsub = await getProducts();
        unsubscribe = unsub;
      }
    };

    setupSubscription();

    // 3. Funkcja czyszcząca
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentUser, userID]); // Reaguj tylko na zmianę usera

  // DELETE TRANSFERS AFTER 60 DAYS - wywoływane efektem, ale tylko kiedy rośnie wielkość transferów
  useEffect(() => {
    const olderThan60days = transfers.filter((item) => {
      return item.date <= moment().subtract(60, "days").format("YYYY-MM-DD");
    });

    if (olderThan60days.length > 0) {
      olderThan60days.forEach((item) => {
        const productDoc = doc(db, `usersList/${userID}/transfers`, item.id);
        deleteDoc(productDoc);
      });
    }
  }, [transfers.length, userID]);

  const updateHotelPrice = () => {
    if (isAdmin) {
      const userRef = doc(db, "usersList", userID);
      try {
        setDoc(userRef, { money: moneyData }, { merge: true });
        toast("Zmieniono stawki", {
          icon: "✓",
          style: { borderRadius: "10px", background: "#052810", color: "#fff" },
        });
      } catch (error) {
        console.error(error);
        toast("Nie udało się zmienić stawek", {
          icon: "✖",
          style: { borderRadius: "10px", background: "#281105", color: "#fff" },
        });
      }
    }
  };

  // --- ACTIONS ---

  const postProducts = async (
    id: string,
    userID: string,
    status: string,
    date: string,
    time: string,
    nameOfGuest: string,
    direction: string,
    people: number,
    details: string,
    flight: string,
    phone: string,
    price: number,
    provision: number,
    createdDate: number,
    specialTransfer?: boolean,
  ) => {
    const ref = doc(collection(db, `usersList/${userID}/transfers`));
    await setDoc(ref, {
      id,
      userID,
      status,
      date,
      time,
      nameOfGuest,
      direction,
      people,
      details,
      flight,
      phone,
      price,
      provision,
      createdDate,
      specialTransfer,
    });
  };

  const handleStatus = async () => {
    if (!confirmDelete || !selectedTransfer) return;

    const deletedItem = selectedTransfer;

    let newStatus = deletedItem.status;
    let newPrice = deletedItem.price;
    let newProvision = deletedItem.provision;

    if (!isAdmin) {
      newStatus = "cancel";
      newPrice = 0;
      newProvision = 0;
    } else {
      newStatus = "ok";
    }

    try {
      await putEdit(
        deletedItem.id,
        deletedItem.userID,
        newStatus,
        newPrice,
        newProvision,
        moment().valueOf(),
      );

      if (isAdmin) {
        toast("Potwierdzono transfer", {
          icon: "✓",
          style: {
            borderRadius: "10px",
            background: "#052810",
            color: "#fff",
          },
        });
      } else {
        toast("Anulowano transfer", {
          icon: "✖",
          style: {
            borderRadius: "10px",
            background: "#281105",
            color: "#fff",
          },
        });

        const convertDate = moment(deletedItem.date).format("L");

        await sendConfirmationCancel({
          name,
          convertDate,
          dataNameOfGuest: deletedItem.nameOfGuest,
        });

        await handleSub(
          name || "",
          deletedItem.date,
          deletedItem.time,
          deletedItem.id,
        );
      }

      setConfirmDelete(false);
      setSelectedTransfer(null);
    } catch (error) {
      console.error(error);

      toast("Błąd! Nie udało się zapisać zmian.", {
        icon: "❗",
        style: {
          borderRadius: "10px",
          background: "#330000",
          color: "#fff",
        },
      });
    }
  };

  const putEdit = async (
    editID: string,
    editUserID: string,
    status: string,
    price: number,
    provision: number,
    createdDate: number,
  ) => {
    const productDoc = doc(db, `usersList/${editUserID}/transfers`, editID);
    await updateDoc(productDoc, { status, price, provision, createdDate });
  };

  // --- EXPORT / IMPORT EXCEL ---

  const exportData = () => {
    if (!isAdmin || !downloadData) return;

    try {
      const wb = XLSX.utils.book_new();

      downloadData.forEach((item) => {
        const { name, itemsArray } = item;

        if (!itemsArray?.length) return;

        const sorted = [...itemsArray].sort((a, b) => {
          const getMs = (t?: string) => {
            if (!t) return 0;
            const [h = 0, m = 0] = t.split(":").map(Number);
            return h * 3600000 + m * 60000;
          };

          return (
            new Date(a.date).getTime() +
            getMs(a.time) -
            (new Date(b.date).getTime() + getMs(b.time))
          );
        });

        const safeName = name.replace(/[\\/?*\[\]]/g, "").slice(0, 31);

        XLSX.utils.book_append_sheet(
          wb,
          XLSX.utils.json_to_sheet(sorted),
          safeName,
        );
      });

      XLSX.writeFile(wb, "Transfery.xlsx");

      //  JSON backup
      const blob = new Blob([JSON.stringify(downloadData)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "TransferyBackUp.json";
      link.click();

      URL.revokeObjectURL(url); //  cleanup

      toast("Pobrano kopię zapasową", {
        icon: "✓",
        style: {
          borderRadius: "10px",
          background: "#052810",
          color: "#fff",
        },
      });
    } catch (err) {
      console.error(err);

      toast("Błąd eksportu danych!", {
        icon: "❗",
        style: {
          borderRadius: "10px",
          background: "#330000",
          color: "#fff",
        },
      });
    }
  };

  const deleteData = async () => {
    if (!file) return;
    file.forEach((el) => {
      allUsersTransfers.forEach(async (item) => {
        const docRef = doc(db, `usersList/${el.id}/transfers`, item.id);
        await deleteDoc(docRef);
      });
    });
    getAllUsers();
  };

  const uploadData = async () => {
    if (!file) return;

    for (const el of file) {
      const userRef = doc(db, "usersList", el.id);

      await setDoc(userRef, {
        activeAccount: true,
        userName: el.name,
        money: el.money,
      });

      for (const item of el.itemsArray) {
        const backupRef = doc(collection(db, `usersList/${el.id}/transfers`));

        await setDoc(backupRef, {
          id: item.id,
          userID: el.id,
          status: item.status,
          date: item.date,
          time: item.time,
          nameOfGuest: item.nameOfGuest,
          direction: item.direction,
          people: item.people,
          details: item.details,
          flight: item.flight,
          phone: item.phone,
          price: item.price,
          provision: item.provision,
          createdDate: item.createdDate || Date.now(),
          specialTransfer: item.specialTransfer || false,
        });
      }
    }

    await getAllUsers();
  };

  // --- NOTIFICATIONS ---

  const handleSub = async (
    hotelNameStr: string,
    date: string,
    time: string,
    id: string,
  ) => {
    const hotelName = hotelNameStr.replace(" - ", "").toUpperCase();
    const title = `${hotelName} anulował transfer`;
    const body = `DATA: ${date}, GODZINA: ${time}`;
    const tag = id;
    const recipeID = "";
    await fetch("/api/push", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "notify",
        type: "recipe",
        title,
        body,
        tag,
        recipeID,
      }),
    });
  };

  return (
    <AppContext2.Provider
      value={{
        isAdmin,
        allUsersList,
        next5transfers,
        transfers,
        name,
        currentUser,
        confirmDelete,
        currentMonthYear,
        prevMonthYear,
        modalName,
        activeHotel,
        loading,
        moneyData,
        monthProvision,
        monthAdminEarn,
        monthAdminEarnAll,
        monthProvisionAll,
        prevMonthProvision,
        prevMonthAdminEarn,
        prevMonthAdminEarnAll,
        prevMonthProvisionAll,
        file,
        lastAddedTransfers,
        setMoneyData,
        setTransfers,
        postProducts,
        setConfirmDelete,
        setSelectedTransfer,
        setLoading,
        handleStatus,
        setActiveHotel,
        setName,
        setUserID,
        updateUser,
        updateName,
        changePassword,
        changePasswordWhenLogin,
        updateHotelPrice,
        createNewUser,
        disableUser,
        getAllUsers,
        exportData,
        uploadData,
        setFile,
        deleteData,
      }}
    >
      {children}
    </AppContext2.Provider>
  );
};

export const useGlobalContext = () => {
  const context = useContext(AppContext2);
  if (context === undefined) {
    throw new Error("useGlobalContext must be used within an AppProvider");
  }
  return context;
};

export { AppContext2 };

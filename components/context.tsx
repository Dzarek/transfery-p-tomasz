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
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  getAuth,
  sendPasswordResetEmail,
  User as FirebaseUser,
} from "firebase/auth";
import * as XLSX from "xlsx";
import { sendConfirmationCancel } from "../lib/api";
// import { subscribe } from "./Notification";
import { useRouter } from "next/navigation";

// --- TYPY I INTERFEJSY ---

export interface MoneyData {
  minPeople: number;
  maxPeople: number;
  price: number;
  provision: number;
}

export interface TransferData {
  id: string;
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
  setDeleteId: React.Dispatch<React.SetStateAction<string | null>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  handleStatus: () => Promise<void>;
  setActiveHotel: React.Dispatch<React.SetStateAction<any>>;
  setName: React.Dispatch<React.SetStateAction<string | null>>;
  setUserID: React.Dispatch<React.SetStateAction<string>>;
  // logout: () => Promise<void>;
  // login: (email: string, password: string) => Promise<void>;
  updateUser: (newName: string) => Promise<void>;
  updateName: (newName: string) => Promise<void>;
  changePassword: () => Promise<void>;
  changePasswordWhenLogin: (email: string) => Promise<void>;
  updateHotelPrice: () => void;
  // createNewUser: (
  //   email: string,
  //   password: string,
  //   newName: string,
  // ) => Promise<void>;
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
  { minPeople: 1, maxPeople: 3, price: 130, provision: 35 },
  { minPeople: 4, maxPeople: 8, price: 160, provision: 50 },
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
  // const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalName, setModalName] = useState<boolean>(false);
  const [activeHotel, setActiveHotel] = useState<any>(null);
  const [file, setFile] = useState<BackupData[] | null>(null);
  const [downloadData, setDownloadData] = useState<BackupData[] | null>(null);

  const router = useRouter();
  const authInstance = getAuth();

  // --- ZOPTYMALIZOWANE DANE POCHODNE (useMemo) ---
  // Wcześniej było to zarządzane osobnymi useEffect i useState. Teraz liczy się samo, bez re-renderowania.

  const activeTransfers = useMemo(
    () => transfers.filter((t) => t.status !== "cancel"),
    [transfers],
  );
  // const isAdmin = currentUser?.uid === process.env.NEXT_PUBLIC_ADMIN_ID;

  // 2. Oddzielny efekt, który TYLKO reaguje na zmianę uprawnień i pobiera dane

  // Dla Admina
  const { next5transfers, lastAddedTransfers } = useMemo(() => {
    if (!isAdmin) {
      // Dla zwykłego użytkownika: Najbliższe 5 transferów
      const next5 = activeTransfers
        .filter((item) => {
          const ms =
            Number(item.time.split(":")[0]) * 3600000 +
            Number(item.time.split(":")[1]) * 60000;
          return moment(item.date).valueOf() + ms > moment().valueOf();
        })
        .slice(0, 5);
      return { next5transfers: next5, lastAddedTransfers: [] };
    } else {
      // Dla Admina z tablicy wszystkich transferów
      const sorted = [...allUsersTransfers].sort((a, b) => {
        const msA =
          Number(a.time.split(":")[0]) * 3600000 +
          Number(a.time.split(":")[1]) * 60000;
        const msB =
          Number(b.time.split(":")[0]) * 3600000 +
          Number(b.time.split(":")[1]) * 60000;
        return (
          new Date(a.date).getTime() + msA - (new Date(b.date).getTime() + msB)
        );
      });

      const homePage = sorted.filter((item) => {
        const ms =
          Number(item.time.split(":")[0]) * 3600000 +
          Number(item.time.split(":")[1]) * 60000;
        return moment(item.date).valueOf() + ms > moment().valueOf();
      });

      const adminNext5 = homePage
        .filter((item) => {
          const ms =
            Number(item.time.split(":")[0]) * 3600000 +
            Number(item.time.split(":")[1]) * 60000;
          return (
            moment(item.date).valueOf() + ms < moment().add(1, "days").valueOf()
          );
        })
        .filter((item) => item.status !== "cancel");

      const lastAdded = homePage.filter(
        (item) =>
          item.createdDate > moment().subtract(1, "days").valueOf() &&
          item.status !== "cancel",
      );

      return { next5transfers: adminNext5, lastAddedTransfers: lastAdded };
    }
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

  // const createNewUser = async (
  //   email: string,
  //   password: string,
  //   newName: string,
  // ) => {
  //   await createUserWithEmailAndPassword(auth, email, password);
  //   if (!authInstance.currentUser) return;
  //   const userRef = doc(db, "usersList", authInstance.currentUser.uid);
  //   await setDoc(
  //     userRef,
  //     { userName: newName, activeAccount: true, money: money },
  //     { merge: true },
  //   );
  //   logout();
  // };

  // const login = async (email: string, password: string) => {
  //   await logout();
  //   await signInWithEmailAndPassword(auth, email, password);
  //   if (authInstance.currentUser) {
  //     const getData = doc(db, `usersList/${authInstance.currentUser.uid}`);
  //     const data2 = await getDoc(getData);
  //     const item = data2.data();
  //     if (item && item.activeAccount === false) {
  //       await logout();
  //       alert("Konto zostało usunięte!");
  //     }
  //     if (authInstance.currentUser.displayName === null) {
  //       setModalName(true);
  //     }
  //   }
  //   router.push("/");
  // };

  // const logout = async () => {
  //   setLoading(true);
  //   await signOut(auth);
  //   setName("");
  //   setUserID("0");
  //   // setIsAdmin(false);
  //   setActiveHotel(false);
  //   setTransfers([]);
  //   setAllUsersList([]);
  //   setAllUsersTransfers([]);
  //   setCurrentUser(null);
  //   router.push("/login");
  // };

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
    // Nie ustawiamy już synchronicznie setLoading(true), bo domyślnie w useState jest true.

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setUserID(user.uid);
        setName(user.displayName);
        if (user.uid === process.env.NEXT_PUBLIC_ADMIN_ID) {
          // isAdmin nie musi być stanem, może być zmienną pochodną
          // Wywołujemy pobieranie danych jako reakcję na zdarzenie (zalogowanie)
          getAllUsers();
        }
        const getData = doc(db, `usersList/${user.uid}`);
        const data2 = await getDoc(getData);

        // if (data2.data()?.activeAccount === false) {
        //   logout();
        //   alert("Konto zostało usunięte!");
        // }
      }

      // Asynchroniczna akcja (sprawdzenie logowania) się zakończyła.
      // Teraz bezpiecznie zdejmujemy loader.
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

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
    await updateProfile(authInstance.currentUser, { displayName: newName });
    setName(newName);
    const userRef = doc(db, "usersList", authInstance.currentUser.uid);
    await setDoc(userRef, { userName: newName }, { merge: true });
  };

  const changePassword = async () => {
    if (authInstance.currentUser?.email) {
      await sendPasswordResetEmail(
        authInstance,
        authInstance.currentUser.email,
      ).catch(console.error);
    }
  };

  const changePasswordWhenLogin = async (email: string) => {
    await sendPasswordResetEmail(authInstance, email).catch(console.error);
  };

  const disableUser = async () => {
    const userRef = doc(db, "usersList", userID);
    await setDoc(userRef, { activeAccount: false }, { merge: true });
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

      // Usunięto wyciek pamięci zwracając nasłuch
      return onSnapshot(collectionRef, (snapshot) => {
        const fetchedItems = snapshot.docs.map(
          (d) => ({ ...d.data(), id: d.id }) as TransferData,
        );

        // Sortowanie przeniesione bezpośrednio tutaj po pobraniu!
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
      setDoc(userRef, { money: moneyData }, { merge: true });
    }
  };

  // --- ACTIONS ---

  const postProducts = async (
    id: string,
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
    if (confirmDelete && deleteId) {
      const deletedItem = transfers.find((item) => item.id === deleteId);
      if (!deletedItem) return;

      let newStatus = deletedItem.status;
      let newPrice = deletedItem.price;
      let newProvision = deletedItem.provision;

      if (isAdmin) {
        newStatus = "ok";
      } else {
        newStatus = "cancel";
        newPrice = 0;
        newProvision = 0;
        const convertDate = moment(deletedItem.date).format("L");
        sendConfirmationCancel({
          name,
          convertDate,
          dataNameOfGuest: deletedItem.nameOfGuest,
        });
        handleSub(
          name || "",
          deletedItem.date,
          deletedItem.time,
          deletedItem.id,
        );
      }

      await putEdit(
        deleteId,
        newStatus,
        newPrice,
        newProvision,
        moment().valueOf(),
      );
      setConfirmDelete(false);
      setDeleteId(null);
    }
  };

  const putEdit = async (
    editID: string,
    status: string,
    price: number,
    provision: number,
    createdDate: number,
  ) => {
    const productDoc = doc(db, `usersList/${userID}/transfers`, editID);
    await updateDoc(productDoc, { status, price, provision, createdDate });
  };

  // --- EXPORT / IMPORT EXCEL ---

  const exportData = () => {
    if (isAdmin && downloadData) {
      const wb = XLSX.utils.book_new();
      downloadData.forEach((item) => {
        const { name, itemsArray } = item;
        if (itemsArray.length > 0) {
          const sorted = [...itemsArray].sort((a, b) => {
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

          const sheet1 = XLSX.utils.book_append_sheet(
            wb,
            XLSX.utils.json_to_sheet(sorted),
            name,
          );
        }
      });
      XLSX.writeFile(wb, "Transfery.xlsx");

      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(downloadData))}`;
      const link = document.createElement("a");
      link.href = jsonString;
      link.download = "TransferyBackUp.json";
      link.click();
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
    file.forEach(async (el) => {
      const userRef = doc(db, "usersList", el.id);
      await setDoc(userRef, {
        activeAccount: true,
        userName: el.name,
        money: el.money,
      });
      el.itemsArray.forEach(async (item) => {
        const backupRef = doc(collection(db, `usersList/${el.id}/transfers`));
        await setDoc(backupRef, {
          id: item.id,
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
        });
      });
    });
    getAllUsers();
  };

  // --- NOTIFICATIONS ---

  const handleSub = async (
    hotelNameStr: string,
    date: string,
    time: string,
    id: string,
  ) => {
    const hotelName = hotelNameStr.replace(" - ", "").toUpperCase();
    // await subscribe(`${hotelName} anulował transfer`, `DATA: ${date}, GODZINA: ${time}`, id, isAdmin);
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
        setDeleteId,
        setLoading,
        handleStatus,
        setActiveHotel,
        setName,
        setUserID,
        // logout,
        // login,
        updateUser,
        updateName,
        changePassword,
        changePasswordWhenLogin,
        updateHotelPrice,
        // createNewUser,
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

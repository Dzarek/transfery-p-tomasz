"use client";

import { useEffect } from "react";
import { useGlobalContext } from "./context";
import Aos from "aos";
import "aos/dist/aos.css";
import { MdOutlineClose } from "react-icons/md";

type Props = {
  setOpenImportModal: (val: boolean) => void;
};

const ImportModal = ({ setOpenImportModal }: Props) => {
  const { uploadData, file, setFile, deleteData } = useGlobalContext();

  // 🔹 czytanie JSON
  const readJsonFile = (file: File): Promise<any> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          if (e.target?.result) {
            const parsed = JSON.parse(e.target.result as string);
            resolve(parsed);
          }
        } catch (err) {
          reject("Nieprawidłowy JSON");
        }
      };

      reader.onerror = reject;
      reader.readAsText(file);
    });

  const handleChangeFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    try {
      const parsedData = await readJsonFile(selectedFile);
      setFile(parsedData);
    } catch {
      alert("Błąd wczytywania pliku JSON!");
    }
  };

  const handleSubmitImport = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!file) return;

    deleteData();
    uploadData();
    setOpenImportModal(false);

    alert("Baza danych została uaktualniona!");
  };

  useEffect(() => {
    Aos.init({ duration: 1000, offset: -100 });
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 text-white">
      <div
        data-aos="zoom-in"
        className="relative w-[90vw] md:w-[50vw] min-h-[50vh] md:min-h-[50vh] bg-[var(--customDarkRed)] border-4 border-[var(--secondaryColor2)] rounded p-8"
      >
        {/* CLOSE */}
        <MdOutlineClose
          onClick={() => setOpenImportModal(false)}
          className="absolute top-4 right-4 md:top-6 md:right-6 text-4xl text-[var(--secondaryColor2)] cursor-pointer hover:rotate-180 transition"
        />

        {/* TITLE */}
        <h3 className="text-center uppercase text-[var(--secondaryColor2)] text-2xl md:text-3xl tracking-widest mt-16 mb-10">
          Import bazy danych
        </h3>

        {/* FORM */}
        <form
          onSubmit={handleSubmitImport}
          className="flex flex-col items-center gap-4"
        >
          <label className="text-center">
            Wybierz plik z kopią zapasową w formacie JSON.
          </label>

          <input
            type="file"
            onChange={handleChangeFile}
            required
            accept=".json,application/json"
            className="bg-white text-black px-3 py-2 text-center font-semibold rounded"
          />

          <button
            type="submit"
            className="mt-6 px-6 py-2 bg-white text-black rounded font-semibold hover:bg-[var(--secondaryColor)] hover:text-white transition"
          >
            Potwierdź
          </button>
        </form>

        {/* WARNING */}
        <p className="text-center mt-10 font-medium">
          UWAGA !!! <br />
          Potwierdzając import nowej bazy danych, aktualne listy transferów
          zostaną zastąpione nowymi!
        </p>
      </div>
    </div>
  );
};

export default ImportModal;

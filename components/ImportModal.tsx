"use client";

import { useEffect } from "react";
import styled from "styled-components";
import { useGlobalContext } from "./context";
import Aos from "aos";
import "aos/dist/aos.css";
import { MdOutlineClose } from "react-icons/md";

type Props = {
  setOpenImportModal: (val: boolean) => void;
};

const ImportModal = ({ setOpenImportModal }: Props) => {
  const { uploadData, file, setFile, deleteData } = useGlobalContext();

  const readJsonFile = (file: File): Promise<any> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          if (e.target?.result) {
            resolve(JSON.parse(e.target.result as string));
          }
        } catch {
          reject("Invalid JSON");
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
    <Wrapper>
      <Modal data-aos="zoom-in">
        <CloseIcon onClick={() => setOpenImportModal(false)} />

        <Title>Import bazy danych</Title>

        <Form onSubmit={handleSubmitImport}>
          <label>Wybierz plik z kopią zapasową w formacie JSON.</label>

          <input
            type="file"
            id="upload"
            name="upload"
            onChange={handleChangeFile}
            required
            accept=".json,application/json"
          />

          <button type="submit">Potwierdź</button>
        </Form>

        <Warning>
          UWAGA !!! <br />
          Potwierdzając import nowej bazy danych, aktualne listy transferów
          zostaną zastąpione nowymi!
        </Warning>
      </Modal>
    </Wrapper>
  );
};

export default ImportModal;

//
// 🔽 STYLED COMPONENTS
//

const Wrapper = styled.div`
  position: fixed;
  inset: 0;
  z-index: 99999999;
  display: flex;
  align-items: center;
  justify-content: center;

  background: rgba(0, 0, 0, 0.8);
  color: white;
`;

const Modal = styled.div`
  position: relative;
  width: 90vw;
  min-height: 50vh;
  /* z-index: 99999999999; */
  background: var(--customDarkRed);
  border: 4px solid var(--secondaryColor2);
  border-radius: 5px;
  padding: 30px 30px;
  /* z-index: 999999; */
  @media (min-width: 768px) {
    width: 50vw;
  }
`;

const CloseIcon = styled(MdOutlineClose)`
  position: absolute;
  top: 20px;
  right: 20px;

  font-size: 2.5rem;
  color: var(--secondaryColor2);
  cursor: pointer;
  transition: 0.4s;

  &:hover {
    transform: rotate(180deg);
  }

  @media (min-width: 768px) {
    top: 25px;
    right: 25px;
  }
`;

const Title = styled.h3`
  text-align: center;
  text-transform: uppercase;
  color: var(--secondaryColor2);

  font-size: 1.5rem;
  letter-spacing: 2px;

  margin-top: 20px;
  margin-bottom: 40px;

  @media (min-width: 768px) {
    font-size: 2rem;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;

  margin-top: 40px;

  label {
    text-align: center;
  }

  input {
    font-family: var(--textFont);
    font-weight: 600;
    text-transform: lowercase;
    padding: 5px 10px;
    background: white;
    color: #222;
    text-align: center;
  }

  button {
    background-color: white;
    color: #111;
    padding: 10px 20px;
    border: none;
    cursor: pointer;
    border-radius: 5px;
    font-size: 1rem;
    margin: 5vh auto 0;
    transition: 0.4s;
    font-weight: 600;

    &:hover {
      background: var(--secondaryColor);
      color: white;
    }
  }
`;

const Warning = styled.p`
  text-align: center;
  font-weight: 500;
  margin-top: 40px;

  @media (max-width: 768px) {
    margin-top: 60px;
  }
`;

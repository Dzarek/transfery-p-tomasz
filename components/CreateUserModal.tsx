"use client";

import styled from "styled-components";
import { useState, useEffect } from "react";
import { useGlobalContext } from "@/components/context";
import { IoAddCircle } from "react-icons/io5";
import { MdOutlineClose } from "react-icons/md";
import Aos from "aos";
import "aos/dist/aos.css";

type Props = {
  setOpenCreateUserModal: (val: boolean) => void;
};

const CreateUserModal = ({ setOpenCreateUserModal }: Props) => {
  const [newName, setNewName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorLogin, setErrorLogin] = useState<string>("");

  const { createNewUser } = useGlobalContext();

  useEffect(() => {
    Aos.init({ duration: 1000, offset: -100 });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!newName || !email || !password) {
      setErrorLogin("Proszę uzupełnić wszystkie pola!");
      return;
    }

    if (password.length < 6) {
      setErrorLogin("Hasło musi zawierać min 6 znaków!");
      return;
    }

    try {
      await createNewUser(email, password, newName);
      setErrorLogin("");
      setOpenCreateUserModal(false);
    } catch (err) {
      console.error(err);
      setErrorLogin("Ups... coś poszło nie tak!");
    }
  };

  return (
    <Wrapper>
      <div className="bigContainer" data-aos="zoom-in">
        <MdOutlineClose
          className="closeIcon"
          onClick={() => setOpenCreateUserModal(false)}
        />

        <h3>Dodaj nowy hotel</h3>

        {errorLogin && <h4 className="errorInfo">{errorLogin}</h4>}

        <section>
          <img src="/images/addUser.png" alt="add user" />

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Nazwa Hotelu"
              onChange={(e) => setNewName(e.target.value)}
              value={newName}
              required
            />

            <input
              type="email"
              placeholder="Adres Email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              required
            />

            <input
              type="password"
              placeholder="Hasło"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
              minLength={6}
            />

            <button type="submit">
              <IoAddCircle />
            </button>

            <p>Dodając nowy hotel wymagane będzie ponowne zalogowanie!</p>
          </form>
        </section>
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: transparent;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  .bigContainer {
    width: 60vw;
    min-height: 50vh;
    background: #111;
    border: 4px solid var(--secondaryColor);
    border-radius: 5px;
    color: white;
    padding: 20px;
    @media screen and (max-width: 900px) {
      position: absolute;
      width: 100vw;
      min-height: 100vh;
      top: 0;
      left: 0;
    }
  }
  .closeIcon {
    position: absolute;
    top: 5%;
    right: 5%;
    font-size: 2.5rem;
    color: var(--secondaryColor);
    transition: 0.4s;
    cursor: pointer;
    &:hover {
      transform: rotate(180deg);
    }
    @media screen and (max-width: 1200px) {
      top: 2%;
    }
  }
  h3 {
    text-transform: uppercase;
    text-align: center;
    color: var(--secondaryColor);
    font-size: 2rem;
    margin-top: 7vh;
    margin-bottom: 7vh;
    letter-spacing: 2px;
    @media screen and (max-width: 1200px) {
      margin-top: 10vh;
    }
  }
  section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    img {
      width: 50%;
    }
    @media screen and (max-width: 900px) {
      flex-direction: column;
      img {
        width: 80%;
      }
    }
  }
  form {
    margin: 3vh auto 5vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 40%;
    @media screen and (max-width: 800px) {
      width: 90%;
    }
    input {
      font-size: 1rem;
      width: 100%;
      margin: 1vh auto;
      padding: 10px 20px;
      border: 1px solid #111;
      border-radius: 5px;
      font-weight: 500;
      font-family: var(--textFont);
      background-color: white;
      color: #111;
    }
    button {
      margin: 4vh auto 4vh;
      color: var(--secondaryColor);
      border: none;
      font-size: 3rem;
      cursor: pointer;
      transition: 0.4s;
      background-color: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      svg {
      }
      &:hover {
        transform: scale(1.2);
      }
    }
    p {
      text-align: center;
    }
  }
  .errorInfo {
    text-align: center;
  }
`;

export default CreateUserModal;

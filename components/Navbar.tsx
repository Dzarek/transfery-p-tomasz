"use client";
import { logout } from "@/lib/user.actions";
import toast from "react-hot-toast";
import { signOut } from "next-auth/react";
import { useGlobalContext as useGlobalContextAuth } from "./authContext";
import { useSession } from "next-auth/react";
import styled from "styled-components";
import { useGlobalContext } from "./context";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import Aos from "aos";
import "aos/dist/aos.css";
import {
  FaUserCircle,
  FaUserMinus,
  FaDownload,
  FaUpload,
} from "react-icons/fa";
import { GiReceiveMoney, GiMoneyStack } from "react-icons/gi";
import {
  MdAddBox,
  MdList,
  MdOutlineSettings,
  MdOutlineClose,
} from "react-icons/md";
import { IoMdArrowDropdownCircle, IoMdArrowDropupCircle } from "react-icons/io";
import { GiHomeGarage } from "react-icons/gi";
import MoneySumCharts from "./MoneySumCharts";
import ImportModal from "./ImportModal";
import Instruction from "../instruction/Instruction";
import FirstLoading from "./FirstLoading";

const Navbar = () => {
  const { setIsLogin } = useGlobalContextAuth();
  const { status } = useSession();
  const {
    currentMonthYear,
    prevMonthYear,
    name,
    modalName,
    updateUser,
    updateName,
    changePassword,
    isAdmin,
    monthProvision,
    monthAdminEarnAll,
    monthProvisionAll,
    prevMonthProvision,
    prevMonthAdminEarnAll,
    prevMonthProvisionAll,
    exportData,
  } = useGlobalContext();
  const [openSettings, setOpenSettings] = useState(false);
  const [openMoneyCharts, setOpenMoneyCharts] = useState(false);
  const [activeMonth, setActiveMonth] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [newName, setNewName] = useState("");
  const [openImportModal, setOpenImportModal] = useState(false);
  const [showInstruction, setShowInstruction] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    Aos.init({ duration: 1000, offset: -100 });
  }, []);

  const handleChangeMonth = () => {
    setActiveMonth(!activeMonth);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (newName && newName !== "") {
      updateUser(newName);
      setErrorMsg("");
    } else {
      setErrorMsg("Proszę uzupełnić pole nazwa hotelu!");
    }
  };
  const handleUpdateName = async (e: any) => {
    e.preventDefault();
    updateName(newName);
    setOpenSettings(false);
  };

  const handleChangePassword = async () => {
    changePassword();
    setOpenSettings(false);
  };

  const handleLogout = async () => {
    await logout();
    await signOut({ callbackUrl: "/logowanie" });
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

  if (status !== "authenticated") {
    return <h2 className="w-1/2 m-10 text-2xl">Nie jesteś zalogowany</h2>;
  }
  return (
    <div>
      {!showInstruction ? (
        <button
          className="showInstructionBtn"
          onClick={() => setShowInstruction(true)}
        >
          Instrukcja
        </button>
      ) : (
        <Instruction setShowInstruction={setShowInstruction} />
      )}
      <Wrapper
        style={{
          borderBottom: pathname !== "/reservation" ? "4px solid #b99e81" : "",
        }}
        className={pathname !== "/rezerwacja" ? "4px solid #b99e81" : ""}
      >
        <nav>
          {pathname !== "/" && (
            <Link href="/" className={isAdmin ? "adminNav" : ""}>
              <GiHomeGarage />
              <p className="aMobile">strona główna</p>
            </Link>
          )}
          {pathname !== "/rezerwacja" && !isAdmin && (
            <Link href="/rezerwacja">
              <MdAddBox />
              <p className="aMobile">dodaj transfer</p>
            </Link>
          )}
          {pathname !== "/transfery" && (
            <Link href="/transfery" className={isAdmin ? "adminNav" : ""}>
              <MdList />
              <p className="aMobile">
                {isAdmin ? "lista hoteli i ich transferów" : "lista transferów"}
              </p>
            </Link>
          )}
          {isAdmin && (
            <a className="adminNav2" onClick={() => setOpenMoneyCharts(true)}>
              <GiMoneyStack />
              <p className="aMobile">zyski i prowizje</p>
            </a>
          )}
        </nav>
        <header>
          <h2 style={{ color: "#b6926c" }}>PAN TOMASZ</h2>
          {/* <img src={logoCompany} alt="" /> */}
          <h1>-</h1>
          <h2>transfery lotniskowe</h2>
        </header>

        <div className={isAdmin ? "login loginAdmin" : "login"}>
          <span>
            <FaUserCircle /> {name}
          </span>
          <MdOutlineSettings
            className="iconOut"
            onClick={() => setOpenSettings(true)}
          />
          <FaUserMinus className="iconOut" onClick={() => handleLogout()} />
        </div>

        {isAdmin && (
          <>
            <div className="earn">
              <div className="smallContainer">
                {activeMonth ? (
                  <h4>
                    prowizja hoteli {currentMonthYear.toUpperCase()} ={" "}
                    <span>{monthProvisionAll} PLN</span>
                  </h4>
                ) : (
                  <h4>
                    prowizja hoteli {prevMonthYear.toUpperCase()} ={" "}
                    <span>{prevMonthProvisionAll} PLN</span>
                  </h4>
                )}
              </div>
            </div>
            <div className="earnAdmin">
              <div className="smallContainer">
                {activeMonth ? (
                  <h4>
                    cały zysk {currentMonthYear.toUpperCase()} ={" "}
                    <span>{monthAdminEarnAll} PLN</span>
                  </h4>
                ) : (
                  <h4>
                    cały zysk {prevMonthYear.toUpperCase()} ={" "}
                    <span>{prevMonthAdminEarnAll} PLN</span>
                  </h4>
                )}
              </div>
            </div>
          </>
        )}
        {!isAdmin && (
          <>
            <div className="earn">
              <h4>
                <span>
                  {activeMonth ? (
                    <>
                      <IoMdArrowDropupCircle onClick={handleChangeMonth} />
                    </>
                  ) : (
                    <>
                      <IoMdArrowDropdownCircle onClick={handleChangeMonth} />
                    </>
                  )}
                </span>
                Prowizja za{" "}
                {activeMonth
                  ? currentMonthYear.toUpperCase()
                  : prevMonthYear.toUpperCase()}{" "}
                ={" "}
                <span>
                  {activeMonth ? monthProvision : prevMonthProvision} PLN
                </span>
              </h4>
            </div>
            <div className="earnMobileUser">
              <h4>
                <span>
                  {activeMonth ? (
                    <>
                      {currentMonthYear.toUpperCase()}
                      <IoMdArrowDropupCircle onClick={handleChangeMonth} />
                    </>
                  ) : (
                    <>
                      {prevMonthYear.toUpperCase()}
                      <IoMdArrowDropdownCircle onClick={handleChangeMonth} />
                    </>
                  )}
                </span>
                <GiReceiveMoney /> ={" "}
                <span>
                  {activeMonth ? monthProvision : prevMonthProvision} PLN
                </span>
              </h4>
            </div>
          </>
        )}
        {isAdmin && openMoneyCharts && (
          <MoneySumCharts setOpenMoneyCharts={setOpenMoneyCharts} />
        )}
      </Wrapper>
      {modalName && (
        <Wrapper2>
          <form onSubmit={(e) => handleSubmit(e)}>
            <h3>
              Witaj w aplikacji do rezerwowania transferów lotniskowych
              stworzonej dla hoteli!
            </h3>
            <label htmlFor="name">Wprowadź nazwę Hotelu</label>
            {errorMsg && <h4 className="errorInfo">{errorMsg}</h4>}
            <input
              id="name"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="nazwa hotelu"
              required
              minLength={3}
            />
            <p>
              Na adres email zostanie przesłany link do zmiany hasła. <br />{" "}
              (sprawdź również spam)
            </p>
            <button type="submit">Potwierdź</button>
          </form>
        </Wrapper2>
      )}
      {openSettings && (
        <Wrapper3 data-aos="fade-down">
          <button onClick={() => setOpenSettings(false)} className="closeBtn">
            <MdOutlineClose />
          </button>
          {isAdmin ? (
            <section className="dataManage">
              <h3>kopia zapasowa</h3>
              <div>
                <article>
                  <p>exportuj dane</p>
                  <FaDownload
                    className="iconOut iconDownload"
                    onClick={exportData}
                  />
                </article>
                <article>
                  <p>importuj dane</p>
                  <FaUpload
                    className="iconOut iconDownload"
                    onClick={() => setOpenImportModal(true)}
                  />
                </article>
              </div>
            </section>
          ) : (
            <section>
              <h3>zmiana nazwy</h3>
              <form onSubmit={(e) => handleUpdateName(e)}>
                <div>
                  <label htmlFor="name">Wprowadź nową nazwę użytkownika.</label>
                  <input
                    id="name"
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="nowa nazwa"
                    required
                    minLength={3}
                  />
                </div>
                <button type="submit">Potwierdź</button>
              </form>
            </section>
          )}
          <section>
            <h3>zmiana hasła</h3>
            <p>
              Na adres email zostanie przesłany link do zmiany hasła. <br />{" "}
              (sprawdź również spam)
            </p>
            <button type="button" onClick={handleChangePassword}>
              Wyślij link
            </button>
          </section>
        </Wrapper3>
      )}

      {openImportModal && (
        <ImportModal setOpenImportModal={setOpenImportModal} />
      )}
    </div>
  );
};

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 20vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
  background-color: #fff;
  color: #222;
  @media screen and (max-width: 900px) {
    height: 30vh;
    height: 30dvh;
  }
  nav {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    flex-direction: column;
    a {
      position: absolute;
      top: 4vh;
      left: 3vw;
      color: #222;
      text-transform: uppercase;
      text-decoration: none;
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      font-size: 1.1rem;
      transition: 0.4s;
      @media screen and (max-width: 1440px) {
        font-size: 1rem;
      }
      @media screen and (max-width: 900px) {
        top: 1vh;
        left: auto;
        right: 5vw;
        animation: navAnim 3s linear infinite alternate;
      }

      svg {
        color: var(--secondaryColor);
        font-size: 2.2rem;
        margin-right: 1vw;
        @media screen and (max-width: 1440px) {
          font-size: 1.5rem;
        }
        @media screen and (max-width: 900px) {
          font-size: 2.3rem;
        }
      }
    }
    a:hover {
      letter-spacing: 1px;
    }
    @keyframes navAnim {
      0% {
        opacity: 1;
      }
      70% {
        opacity: 1;
      }
      100% {
        opacity: 0.5;
      }
    }
    a:nth-of-type(2) {
      top: 60%;
      @media screen and (max-width: 900px) {
        top: 30%;
        left: auto;
        right: 5vw;
      }
    }
    .adminNav {
      top: 60%;
      @media screen and (max-width: 900px) {
        top: auto;
        bottom: 2vh;
        left: 0vw;
        right: auto;
        width: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border-right: 1px solid #222;
      }
    }
    .adminNav2 {
      cursor: pointer;
    }
    .adminNav2:nth-of-type(2) {
      top: 2vh;
      left: auto;
      right: 3vw;
      @media screen and (max-width: 900px) {
        top: auto;
        bottom: 2vh;
        left: auto;
        right: 0vw;
        width: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border-left: 1px solid #222;
      }
    }
    .aMobile {
      @media screen and (max-width: 900px) {
        display: none;
      }
      @media screen and (min-width: 901px) {
        display: block;
      }
    }
  }
  .login {
    position: absolute;
    top: 3vh;
    right: 3vw;
    display: flex;
    justify-content: center;
    align-items: center;
    @media screen and (max-width: 900px) {
      top: 2vh;
      left: 5vw;
      right: auto;
    }
    span {
      font-size: 1.1rem;
      font-weight: 500;
      display: flex;
      justify-content: center;
      align-items: center;
      border-right: 2px solid #222;
      padding-right: 1vw;
      @media screen and (max-width: 1440px) {
        font-size: 1rem;
      }
      @media screen and (max-width: 900px) {
        padding-right: 3vw;
      }
      svg {
        margin-right: 10px;
        font-size: 1.5rem;
        color: var(--secondaryColor);
        @media screen and (max-width: 1440px) {
          font-size: 1.3rem;
        }
      }
    }
    .iconOut {
      font-size: 1.5rem;
      margin-left: 2vw;
      color: var(--secondaryColor);
      cursor: pointer;
      transition: 0.4s;
      @media screen and (max-width: 1440px) {
        font-size: 1.3rem;
      }
      @media screen and (max-width: 900px) {
        margin-left: 5vw;
      }
    }
    .iconOut:hover {
      transform: scale(1.2);
    }
    .iconDownload {
      font-size: 1.3rem;
      @media screen and (max-width: 1440px) {
        font-size: 1.1rem;
      }
    }
  }
  .loginAdmin {
    position: absolute;
    top: 3vh;
    left: 3vw;
    right: auto;
    background-color: whitesmoke;
    padding: 5px 10px;
    @media screen and (max-width: 900px) {
      top: 2vh;
      left: 5vw;
      right: auto;
    }
  }
  header {
    text-transform: uppercase;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    @media screen and (max-width: 1100px) {
      flex-direction: column;
    }
    img {
      width: 10vw;
      @media screen and (max-width: 900px) {
        width: 30vw;
      }
    }
    h1 {
      margin: 0 1vw;
      font-weight: 500;
      @media screen and (max-width: 1100px) {
        display: none;
      }
    }
    h2 {
      font-size: 1.5rem;
      font-weight: 500;
      letter-spacing: 2px;
      @media screen and (max-width: 1440px) {
        font-size: 1.35rem;
      }
      @media screen and (max-width: 1200px) {
        font-size: 1.2rem;
        letter-spacing: 0px;
      }
      @media screen and (max-width: 900px) {
        font-size: 1rem;
        width: 60vw;
      }
    }
  }
  .earn {
    position: absolute;
    top: 65%;
    right: 3vw;
    @media screen and (max-width: 900px) {
      display: none;
    }
    h4 {
      font-weight: 500;
      font-size: 0.95rem;
      display: flex;
      align-items: center;
      @media screen and (max-width: 1440px) {
        font-size: 1rem;
      }

      span {
        font-weight: 700;
        color: var(--secondaryColor);
        display: flex;
        align-items: center;
        margin-right: 5px;
        margin-left: 5px;
        svg {
          font-size: 1.4rem;
        }
      }
    }
  }
  .earnAdmin {
    position: absolute;
    top: 45%;
    right: 3vw;
    @media screen and (max-width: 900px) {
      display: none;
    }
    h4 {
      font-weight: 500;
      font-size: 0.95rem;
      @media screen and (max-width: 1440px) {
        font-size: 1rem;
      }

      span {
        font-weight: 700;
        color: var(--secondaryColor);
      }
    }
  }
  .earnMobile {
    position: absolute;
    top: 80%;
    right: 10vw;
    h4 {
      font-weight: 500;
      font-size: 1.3rem;
      display: flex;
      align-items: center;
      justify-content: center;
      span {
        font-weight: 700;
        color: var(--secondaryColor);
        font-size: 1rem;
        margin-left: 5px;
      }
      svg {
        margin-right: 5px;
      }
    }
    @media screen and (min-width: 901px) {
      display: none;
    }
  }
  .earnMobileUser {
    position: absolute;
    top: 80%;
    left: 50%;
    transform: translateX(-50%);
    width: 100vw;
    h4 {
      font-weight: 500;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      justify-content: center;
      span {
        font-weight: 600;
        color: var(--secondaryColor);
        font-size: 0.9rem;
        margin-left: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        svg {
          margin-left: 5px;
          font-size: 1.2rem;
        }
        :nth-of-type(1) {
          margin-right: 10vw;
        }
      }
      svg {
        margin-right: 5px;
      }
    }
    @media screen and (min-width: 901px) {
      display: none;
    }
  }
  .earnAdminMobile {
    position: absolute;
    top: 80%;
    left: 10vw;
    h4 {
      font-weight: 500;
      font-size: 1.3rem;
      display: flex;
      align-items: center;
      justify-content: center;

      span {
        font-weight: 700;
        color: var(--secondaryColor);
        font-size: 1rem;
        margin-left: 5px;
      }
      svg {
        margin-right: 5px;
      }
    }
    @media screen and (min-width: 901px) {
      display: none;
    }
  }
  .changeMonthBtn {
    background: transparent;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    font-weight: 600;
    font-family: var(--textFont);
    position: absolute;
    top: 3vh;
    right: 3vw;

    svg {
      cursor: pointer;
      margin-left: 10px;
      transition: 0.4s;
      font-size: 1.4rem;
      color: var(--secondaryColor);
    }
    svg:hover {
      transform: scale(1.1);
    }
    @media screen and (max-width: 1100px) {
      display: none;
    }
  }
`;

const Wrapper2 = styled.div`
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.9);
  z-index: 999999;
  form {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    width: 40vw;
    min-height: 60vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
    padding: 2vw 2vw;
    color: #222;
    text-align: center;
    @media screen and (max-width: 900px) {
      width: 90vw;
      padding: 10vw 5vw;
    }
    h3 {
      color: var(--secondaryColor);
      font-weight: 600;
      font-size: 1.4rem;
    }
    label {
      margin: 3vh auto 1vh;
      font-size: 1.1rem;
      text-transform: lowercase;
    }
    input {
      font-size: 1.1rem;
      width: 70%;
      margin: 1vh auto 2vh;
      padding: 5px 20px;
      border: 2px solid var(--secondaryColor);
      border-radius: 5px;
      font-weight: 500;
      font-family: var(--textFont);
      text-align: center;
    }
    button {
      margin: 2vh auto 0vh;
      padding: 10px 30px;
      color: #000;
      border-radius: 10px;
      border: none;
      font-size: 1rem;
      font-weight: 500;
      font-family: var(--textFont);
      cursor: pointer;
      transition: 0.4s;
      background-color: #eee;
    }
    button:hover {
      background-color: var(--secondaryColor);
      color: white;
    }
  }
  .errorInfo {
    text-align: center;
    color: darkred;
  }
`;

const Wrapper3 = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-around;
  width: 100vw;
  height: 25vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999999;
  background-color: #fff;
  color: #222;
  transition: 1s;
  padding: 2vh 0;
  border-bottom: 4px solid var(--secondaryColor);
  @media screen and (max-width: 900px) {
    height: 100vh;
    flex-direction: column;
  }
  .closeBtn {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: transparent;
    font-size: 3rem;
    color: var(--secondaryColor);
    cursor: pointer;
    transition: 0.4s;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .closeBtn:hover {
    transform: translate(-50%, -50%) rotate(180deg);
  }
  section {
    width: 40%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    @media screen and (max-width: 900px) {
      min-height: 30%;
      height: auto;
      width: 90%;
      margin: 0 auto;
    }
    form {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    div {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 2vh;
      @media screen and (max-width: 900px) {
        flex-direction: column;
      }
    }
    text-align: center;
    h3 {
      text-transform: uppercase;
      color: var(--secondaryColor);
    }
    button {
      margin: 2vh auto 0vh;
      padding: 7px 15px;
      color: #000;
      border-radius: 10px;
      border: none;
      font-size: 0.9rem;
      font-weight: 500;
      font-family: var(--textFont);
      cursor: pointer;
      transition: 0.4s;
      background-color: #eee;
    }
    button:hover {
      background-color: var(--secondaryColor);
      color: white;
    }
    input {
      font-size: 1rem;
      margin-left: 1vw;
      padding: 5px 10px;
      border: 1px solid var(--secondaryColor);
      border-radius: 5px;
      font-weight: 500;
      font-family: var(--textFont);
      text-align: center;
      @media screen and (max-width: 900px) {
        margin-left: 0;
        margin-top: 3vh;
      }
    }
  }
  .dataManage {
    @media screen and (max-width: 900px) {
      width: 100vw;
    }
    div {
      @media screen and (max-width: 900px) {
        flex-direction: row;
        margin-top: -5vh;
        width: 100%;
      }
    }
    article {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin: 0 3vw;
      @media screen and (max-width: 900px) {
        margin: 0;
        width: 50%;
        :nth-of-type(1) {
          border-right: 1px solid #444;
        }
        :nth-of-type(2) {
          border-left: 1px solid #444;
        }
      }
    }
    .iconDownload {
      margin-top: 3vh;
      font-size: 1.6rem;
      color: var(--secondaryColor);
      cursor: pointer;
      transition: 0.4s;
    }
    .iconDownload:hover {
      transform: scale(1.2);
    }
  }
  .notificationBell {
    position: absolute;
    top: 10%;
    left: 1%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    @media screen and (max-width: 900px) {
      top: 8%;
      left: 3%;
      align-items: flex-start;
      justify-content: flex-start;
    }
    svg {
      margin-bottom: 3px;
      font-size: 1.6rem;
      color: var(--secondaryColor);
      cursor: pointer;
      transition: 0.4s;
    }
    svg:hover {
      transform: scale(1.2);
    }
    p {
      font-size: 0.7rem;
      text-align: center;
      margin-top: 0;
      @media screen and (max-width: 900px) {
        display: none;
      }
    }
  }
`;

export default Navbar;

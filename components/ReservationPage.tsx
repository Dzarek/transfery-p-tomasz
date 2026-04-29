"use client";

import styled from "styled-components";
import { useEffect, useState } from "react";
import { useGlobalContext } from "@/components/context";
import moment from "moment/min/moment-with-locales";
import { v4 as uuidv4 } from "uuid";
import { IoAddCircle, IoCheckmark } from "react-icons/io5";
import { FaLock, FaLockOpen } from "react-icons/fa";
// import { sendConfirmation } from "@/lib/api";
import { GiCarWheel } from "react-icons/gi";
import toast from "react-hot-toast";
import { sendConfirmation } from "@/lib/api";

const minDate = moment().format("YYYY-MM-DD");
const maxDate = moment().add(90, "days").format("YYYY-MM-DD");
const minTime = new Date().toLocaleTimeString().slice(0, 5);

const ReservationPage = () => {
  const {
    transfers,
    setTransfers,
    postProducts,
    isAdmin,
    name,
    moneyData,
    currentUser,
  } = useGlobalContext();

  // 🔹 STATE
  const [date, setDate] = useState(minDate);
  const [time, setTime] = useState("");
  const [nameOfGuest, setNameOfGuest] = useState("");
  const [direction, setDirection] = useState("---");
  const [people, setPeople] = useState("");
  const [flight, setFlight] = useState("");
  const [phone, setPhone] = useState("");
  const [details, setDetails] = useState("");
  const [price, setPrice] = useState(0);
  const [provision, setProvision] = useState(0);

  const [sendForm, setSendForm] = useState(false);
  const [specialTransfer, setSpecialTransfer] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔹 AUTO PRICE
  useEffect(() => {
    if (!people) {
      setPrice(0);
      setProvision(0);
      return;
    }

    const found = moneyData?.find(
      (item) =>
        Number(people) >= item.minPeople && Number(people) <= item.maxPeople,
    );

    if (found) {
      setPrice(found.price);
      setProvision(found.provision);
    }
  }, [people, moneyData]);

  // 🔹 DIRECTIONS
  const directions = [
    "---",
    `${name} - Kraków Airport`,
    `Kraków Airport - ${name}`,
  ];

  // 🔹 RESET
  const resetForm = () => {
    setDate(minDate);
    setTime("");
    setNameOfGuest("");
    setDirection("---");
    setPeople("");
    setFlight("");
    setPhone("");
    setDetails("");
    setPrice(0);
    setProvision(0);
    setSpecialTransfer(false);
  };

  const handleEmailConfirm = async () => {
    const convertDate = moment(date).format("L");
    const data = { name, convertDate };
    await sendConfirmation(data);
  };

  // 🔹 SUBMIT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (direction === "---") {
      toast("Wybierz kierunek!", { icon: "❗" });
      return;
    }

    if (!time) {
      toast("Wybierz godzinę!", { icon: "❗" });
      return;
    }

    setLoading(true);

    const id = uuidv4();
    const createdDate = moment().valueOf();

    const newTransfer = {
      id,
      status: "pending",
      date,
      time,
      nameOfGuest,
      direction,
      people: Number(people),
      details,
      flight,
      phone,
      price,
      provision,
      createdDate,
      specialTransfer,
    };

    try {
      setTransfers((prev) => [...prev, newTransfer]);

      await postProducts(
        id,
        "pending",
        date,
        time,
        nameOfGuest,
        direction,
        Number(people),
        details,
        flight,
        phone,
        price,
        provision,
        createdDate,
        specialTransfer,
      );

      await handleEmailConfirm();

      setSendForm(true);

      setTimeout(() => {
        resetForm();
        setSendForm(false);
      }, 1500);
    } catch (err) {
      toast("Błąd zapisu transferu", { icon: "❌" });
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser || isAdmin) return null;

  return (
    <Wrapper>
      <div className="imgContainer">
        <h2>
          Rezerwacja <br /> <p>(max 90 dni do przodu)</p>
        </h2>

        <img
          src="/images/car2.png"
          alt=""
          className={sendForm ? "carRide" : "carBack"}
        />
      </div>

      {sendForm ? (
        <h3 className="sendFormInfo">
          Transfer został dodany <br />
          <IoCheckmark />
        </h3>
      ) : loading ? (
        <div className="savingReservation">
          <GiCarWheel />
          <h3>Dodawanie transferu...</h3>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className={specialTransfer ? "specialForm" : ""}
        >
          {/* DATA + TIME */}
          <div>
            <section>
              <label>Data:</label>
              <input
                type="date"
                value={date}
                min={minDate}
                max={maxDate}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </section>

            <section>
              <label>Godzina:</label>
              <input
                type="time"
                value={time}
                min={date === minDate ? minTime : undefined}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </section>
          </div>

          {/* NAME */}
          <section>
            <label>Imię i nazwisko:</label>
            <input
              value={nameOfGuest}
              onChange={(e) => setNameOfGuest(e.target.value)}
              required
            />
          </section>

          {/* DIRECTION */}
          <section>
            <label>Kierunek:</label>
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
              required
            >
              {directions.map((d, i) => (
                <option key={i}>{d}</option>
              ))}
            </select>
          </section>

          {/* DETAILS */}
          <div>
            <section>
              <label>Liczba osób:</label>
              <input
                type="number"
                min={1}
                max={specialTransfer ? 99 : 8}
                value={people}
                onChange={(e) => setPeople(e.target.value)}
                required
              />
              <p>(max {specialTransfer ? "99" : "8"})</p>
            </section>

            <section>
              <label>Numer lotu:</label>
              <input
                value={flight}
                required={direction === `Kraków Airport - ${name}`}
                type="text"
                onChange={(e) => setFlight(e.target.value)}
              />
            </section>

            <section>
              <label>Telefon:</label>
              <input
                type="number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </section>
          </div>

          <section>
            <label>Uwagi:</label>
            <input
              type="text"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </section>

          {/* PRICE */}
          <div>
            <section className={specialTransfer ? "specialPrice" : "price"}>
              <label>Cena:</label>
              {specialTransfer ? (
                <>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                  />
                  <p> PLN</p>
                  <FaLockOpen />
                </>
              ) : (
                <>
                  <h4>{price} PLN</h4>
                  <FaLock />
                </>
              )}
            </section>

            <section className={specialTransfer ? "specialPrice" : "price"}>
              <label>Prowizja:</label>
              {specialTransfer ? (
                <>
                  <input
                    type="number"
                    value={provision}
                    onChange={(e) => setProvision(Number(e.target.value))}
                  />
                  <p> PLN</p>
                  <FaLockOpen className="ml-10" />
                </>
              ) : (
                <>
                  <h4>{provision} PLN</h4>
                  <FaLock />
                </>
              )}
            </section>
          </div>

          <button className="reservebutton">
            <IoAddCircle />
          </button>
        </form>
      )}

      {/* SWITCH */}
      {!loading && (
        <button
          className="specialTransfer"
          onClick={() => setSpecialTransfer((prev) => !prev)}
        >
          {specialTransfer
            ? "zmień na transfer zwykły"
            : "zmień na transfer specjalny"}
        </button>
      )}
      {specialTransfer && (
        <p className="specialInfo">
          Dodając transfer specjalny możesz ustalić własne ceny, prowizje oraz
          liczbę osób. Przed rezerwacją porozmawiaj ze swoim opiekunem.{" "}
        </p>
      )}
    </Wrapper>
  );
};
const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100vw;
  padding-top: 20vh;
  background: #111;
  min-height: 74vh;
  color: #111;
  position: relative;
  @media screen and (max-width: 900px) {
    flex-direction: column;
  }
  h2 {
    text-transform: uppercase;
    color: var(--secondaryColor);
    align-self: center;
    margin-bottom: 4vh;
    font-size: 1.8rem;
    font-weight: 600;
    letter-spacing: 3px;
    text-align: center;
    p {
      margin-top: 2vh;
      color: white;
      font-size: 1.1rem;
      text-transform: lowercase;
      @media screen and (max-width: 900px) {
        font-size: 1rem;
      }
    }
  }
  .imgContainer {
    height: 100%;
    min-height: 74vh;
    width: 40vw;
    background-color: #111;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    @media screen and (max-width: 900px) {
      width: 90vw;
    }
    img {
      margin-left: 2vw;
      width: 100%;
    }
    .carRide {
      animation: carMove2 1s ease 1 forwards;
    }
    .carBack {
      animation: carMove 1s ease 1 forwards;
    }
    @keyframes carMove {
      0% {
        opacity: 0;
        transform: translateX(-100px);
      }
      100% {
        opacity: 1;
        transform: translateX(0);
      }
    }
    @keyframes carMove2 {
      0% {
        opacity: 1;
        transform: translateX(0);
      }
      90% {
        opacity: 0;
      }
      100% {
        opacity: 0;
        transform: translateX(20vw);
      }
    }
  }

  form {
    width: 50vw;
    margin-right: 5vw;
    display: flex;
    flex-direction: column;
    @media screen and (max-width: 900px) {
      width: 90vw;
      margin: 0 auto 10vh;
    }
    div {
      display: flex;
      width: 100%;
      justify-content: space-between;
      align-items: center;
      section {
        width: 49%;
        p {
          font-weight: 500;
          margin-left: 10px;
        }
      }
      &:nth-of-type(2) {
        section {
          input {
            width: 20%;
          }
          &:nth-of-type(1) {
            width: 26%;
          }
          &:nth-of-type(2) {
            width: 32%;
          }
          &:nth-of-type(3) {
            width: 38%;
          }
        }
      }
      @media screen and (max-width: 2000px) {
        flex-wrap: wrap;
        section {
          width: 49%;
        }
        &:nth-of-type(2) {
          section {
            width: 49%;

            &:nth-of-type(1) {
              width: 49%;
            }
            &:nth-of-type(2) {
              width: 49%;
            }
            &:nth-of-type(3) {
              width: 100%;
            }
          }
        }
      }
      @media screen and (max-width: 900px) {
        flex-direction: column;
        section {
          width: 100%;
        }
        &:nth-of-type(2) {
          section {
            input {
              width: 100%;
            }
            &:nth-of-type(1) {
              width: 100%;
            }
            &:nth-of-type(2) {
              width: 100%;
            }
            &:nth-of-type(3) {
              width: 100%;
            }
          }
        }
      }
    }
    section {
      background: #fff;
      margin-bottom: 1.5vh;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      border-radius: 5px;
      padding: 5px 10px;

      @media screen and (max-width: 900px) {
        flex-direction: column;
        justify-content: center;
      }
      label {
        font-size: 1rem;
        font-weight: 500;
        margin-right: 20px;
        @media screen and (max-width: 900px) {
          margin-right: 0px;
        }
      }
      input,
      select {
        width: 50%;
        font-size: 1rem;
        font-family: var(--textFont);
        font-weight: 600;
        text-transform: uppercase;
        padding: 3px 10px;
        flex-grow: 1;
        border: 2px solid var(--secondaryColor);
        border-radius: 5px;
        text-align: center;
        @media screen and (max-width: 900px) {
          width: 100%;
        }
      }
    }
    .price {
      background-color: var(--secondaryColor);
      text-align: center;
      justify-content: center;
      position: relative;
      padding: 9px 10px;

      label,
      h4 {
        font-weight: 600;
        font-size: 1rem;
      }
      svg {
        position: absolute;
        top: 50%;
        right: 10%;
        transform: translateY(-50%);
        font-size: 1rem;
      }
    }
  }
  .reservebutton {
    background: transparent;
    color: #fff;
    font-size: 3rem;
    border: none;
    cursor: pointer;
    transition: 0.4s;
    margin-top: 4vh;
    align-self: center;
    display: flex;
    align-items: center;
    justify-content: center;
    &:hover {
      transform: scale(1.2);
      color: var(--secondaryColor);
    }
  }

  .sendFormInfo {
    color: white;
    font-size: 1.8rem;
    text-transform: uppercase;
    text-align: center;
    width: 50vw;
    margin-right: 5vw;
    position: relative;
    svg {
      display: none;
    }
    @media screen and (max-width: 900px) {
      width: 100vw;
      height: 100vh;
      position: fixed;
      top: 0;
      left: 0;
      background: #111;
      font-size: 1.4rem;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
      z-index: 999999999999999999;
      svg {
        margin-top: 5vh;
        display: block;
        color: var(--secondaryColor);
        font-size: 4rem;
        animation: svgShow 1s ease 1 forwards;
      }
      @keyframes svgShow {
        0% {
          opacity: 0;
        }
        100% {
          opacity: 1;
        }
      }
    }
  }
  .specialForm {
    input,
    select {
      border-color: var(--specialTransfser);
    }
    div {
      flex-wrap: wrap;
      .specialPrice {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        @media screen and (max-width: 900px) {
          flex-direction: row;
          flex-wrap: wrap;
          label {
            width: 100%;
            text-align: center;
          }
        }

        input {
          flex-grow: 1;
          width: 40%;

          @media screen and (max-width: 900px) {
            width: 80%;
          }
        }
        svg {
          font-size: 1.2rem;
          margin: 0 20px;
          @media screen and (max-width: 1300px) {
            display: none;
          }
        }
      }
      section {
        width: 49%;
        @media screen and (max-width: 900px) {
          width: 100%;
        }
      }
      &:nth-of-type(2) {
        section {
          width: 49%;

          &:nth-of-type(1) {
            width: 49%;
          }
          &:nth-of-type(2) {
            width: 49%;
          }
          &:nth-of-type(3) {
            width: 100%;
          }
          @media screen and (max-width: 900px) {
            width: 100%;
            &:nth-of-type(1) {
              width: 100%;
            }
            &:nth-of-type(2) {
              width: 100%;
            }
            &:nth-of-type(3) {
              width: 100%;
            }
          }
        }
      }
    }
  }
  .specialTransfer {
    position: absolute;
    right: 5vw;
    bottom: 2vh;
    background: #50708ccb;
    color: #fff;
    padding: 10px 20px;
    border-radius: 5px;
    border: none;
    cursor: pointer;
    font-weight: 500;
    font-family: var(--textFont);
    opacity: 0.8;
    transition: 0.5s;
    font-size: 0.8rem;
    &:hover {
      opacity: 1;
    }
  }
  .specialInfo {
    position: absolute;
    left: 3%;
    width: 40vw;
    bottom: 2vh;
    color: #fff;
    font-size: 0.9rem;
    @media screen and (max-width: 900px) {
      position: static;
      width: 90vw;
      margin: -2vh auto 14vh;
      text-align: center;
    }
  }
  .savingReservation {
    width: 50vw;
    margin-right: 5vw;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-transform: lowercase;
    @media screen and (max-width: 900px) {
      width: 90vw;
      margin: 0 auto 10vh;
    }
    h3 {
      font-size: 1.2rem;
      color: white;
      margin-top: 20px;
      font-weight: 500;
    }
    svg {
      font-size: 5rem;
      color: var(--secondaryColor);
      animation: loaderRotate 1.5s linear infinite;
    }
  }
`;

export default ReservationPage;

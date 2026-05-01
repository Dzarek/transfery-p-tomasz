"use client";

import styled from "styled-components";
import { useGlobalContext } from "./context";
import Link from "next/link";
import Loading from "./Loading";
import { useState } from "react";
import { FaCar, FaInfoCircle } from "react-icons/fa";
import { useSession } from "next-auth/react";
import TransfersList from "./TransfersList";

const bg3 = "/images/img2.jpg";
const bgM = "/images/bgM.jpg";

const homeVideo = "/images/homeVideo2.mp4";

export default function HomePage() {
  const { next5transfers, loading, lastAddedTransfers } = useGlobalContext();
  const [lastAddedList, setLastAddedList] = useState(false);
  const { data: session, status } = useSession();

  if (status !== "authenticated") {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center text-black">
        <h2 className="text-2xl">Odmowa dostępu!</h2>
        <Link
          href="/logowanie"
          className="mt-5 p-10 rounded-md bg-red-900 text-white"
        >
          {" "}
          zaloguj się
        </Link>
      </div>
    );
  }

  return (
    <Wrapper className="homepageBg">
      {/* Background video */}
      <video
        src={homeVideo}
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        className="w-full h-full object-cover object-[40%_0%] absolute inset-0"
      />

      {session.isAdmin ? (
        <div className="containerAdmin">
          <div className="titleContainer">
            <h3
              onClick={() => setLastAddedList(false)}
              className={lastAddedList ? "noActive" : ""}
            >
              <FaCar />
              transfery na najbliższe 24 godziny{" "}
              <span>({next5transfers.length})</span>
            </h3>
            <h3
              onClick={() => setLastAddedList(true)}
              className={lastAddedList ? "" : "noActive"}
            >
              <FaCar />
              ostatnio dodane transfery{" "}
              <span>({lastAddedTransfers.length})</span>
            </h3>
          </div>
          {lastAddedList ? (
            <>
              {lastAddedTransfers.length < 1 && loading ? (
                <Loading />
              ) : (
                <>
                  {lastAddedTransfers.length > 0 ? (
                    <TransfersList transfers={lastAddedTransfers} />
                  ) : (
                    <p className="noTransfersInfo">
                      <FaInfoCircle /> przez ostatnie 24h nie dodano żadnych
                      nowych transferów
                    </p>
                  )}
                </>
              )}
            </>
          ) : (
            <>
              {next5transfers.length < 1 && loading ? (
                <Loading />
              ) : (
                <>
                  {next5transfers.length > 0 ? (
                    <TransfersList transfers={next5transfers} />
                  ) : (
                    <p className="noTransfersInfo">
                      <FaInfoCircle /> w najbliższych 24h nie ma żadnych
                      transferów do zrealizowania
                    </p>
                  )}
                </>
              )}
            </>
          )}
          <Link href="/transfery">
            <button className="allTransfers">zobacz wszystkie transfery</button>
          </Link>
        </div>
      ) : (
        <div className="containerU">
          <div className="titleContainer">
            <h3>5 najbliższych transferów</h3>
          </div>
          {next5transfers.length < 1 && loading ? (
            <Loading />
          ) : (
            <>
              {next5transfers.length > 0 ? (
                <TransfersList transfers={next5transfers} />
              ) : (
                <p className="noTransfersInfo">
                  <FaInfoCircle /> w najbliższym czasie nie ma żadnych
                  transferów
                </p>
              )}
            </>
          )}
          <Link href="/transfery">
            <button className="allTransfers">zobacz wszystkie transfery</button>
          </Link>
        </div>
      )}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  color: #222;
  padding-top: 20vh;
  min-height: 74vh;
  width: 100vw;
  position: relative;
  /* background-image: url(${bg3}); */
  background-size: cover;
  background-attachment: fixed;
  background-repeat: no-repeat;
  background-position: center;
  display: flex;
  justify-content: center;
  align-items: center;
  @media screen and (max-width: 900px) {
    padding-top: 30vh;
    padding-top: 30dvh;
    min-height: 74dvh;
    /* background-position: 48% center; */
    /* background-image: url(${bgM}); */
  }
  .notiBtn {
    position: fixed;
    top: 10vh;
    left: 10vw;
    z-index: 99999999999999999;
    font-size: 2rem;
  }
  .containerAdmin {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    z-index: 1;
    height: 100%;
    min-height: 74vh;
    width: 100%;
    padding: 10vh 3vw 3vh;
    background-color: rgba(0, 0, 0, 0.5);
    .titleContainer {
      width: 90%;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      align-items: center;
      margin-bottom: 3vh;
      @media screen and (max-width: 900px) {
        flex-direction: row;
        justify-content: space-between;
        width: 98%;
      }
    }
    h3 {
      color: #fff;
      text-transform: uppercase;
      font-size: 1.6rem;
      font-weight: 700;
      letter-spacing: 3px;
      text-align: center;
      width: auto;
      margin-bottom: 2vh;
      display: flex;
      align-items: center;
      text-shadow: 4px 4px 4px #000;
      span {
        font-size: 1rem;
        margin-left: 10px;
      }
      svg {
        color: var(--secondaryColor2);
        margin-right: 20px;
        animation: rideCar 0.6s linear infinite alternate;
        font-size: 1.6rem;
      }
      @keyframes rideCar {
        0% {
          transform: translateY(-2px);
        }
        100% {
          transform: translateY(2px);
        }
      }
      @media screen and (max-width: 900px) {
        background: #111;
        width: 48%;
        height: 30vh;
        padding: 5px;
        flex-direction: column;
        justify-content: space-around;
        font-size: 0.8rem;
        border-radius: 5px;
        span {
          font-size: 0.8rem;
        }
        svg {
          /* display: none; */
          margin-right: 0px;
        }
      }
    }
    .noActive {
      opacity: 0.5;
      font-size: 1.2rem;
      cursor: pointer;
      transition: 0.5s;
      border-bottom: 2px solid transparent;
      svg {
        opacity: 0;
      }
      span {
        font-size: 1rem;
      }

      @media screen and (max-width: 900px) {
        font-size: 0.8rem;
        opacity: 0.6;
        span {
          font-size: 0.8rem;
        }
      }
    }
    .noActive:hover {
      border-bottom: 2px solid var(--secondaryColor);
      opacity: 0.8;
    }
  }
  .containerU {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    z-index: 1;
    height: 100%;
    min-height: 74vh;
    width: 100%;
    padding: 10vh 3vw 3vh;
    background-color: rgba(0, 0, 0, 0.5);
    .titleContainer {
      width: 90%;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      align-items: center;
      margin-bottom: 3vh;
    }
    h3 {
      color: #fff;
      text-transform: uppercase;
      font-size: 1.6rem;
      font-weight: 700;
      letter-spacing: 3px;
      text-align: center;
      width: auto;
      margin-bottom: 2vh;
      display: flex;
      align-items: center;
      text-shadow: 4px 4px 4px #000;
      svg {
        color: var(--secondaryColor2);
        margin-right: 20px;
        animation: rideCar 0.6s linear infinite alternate;
        font-size: 1.6rem;
      }
      @keyframes rideCar {
        0% {
          transform: translateY(-2px);
        }
        100% {
          transform: translateY(2px);
        }
      }
      @media screen and (max-width: 900px) {
        font-size: 1.2rem;
        svg {
          display: none;
        }
      }
    }
    .noActive {
      opacity: 0.5;
      font-size: 1.2rem;
      cursor: pointer;
      transition: 0.5s;
      border-bottom: 2px solid transparent;
      svg {
        display: none;
      }
      @media screen and (max-width: 900px) {
        font-size: 0.9rem;
      }
    }
    .noActive:hover {
      border-bottom: 2px solid var(--secondaryColor);
      opacity: 0.8;
    }
  }
  .noTransfersInfo {
    color: white;
    margin: 7vh auto 10vh;
    font-size: 1.1rem;
    max-width: 80vw;
    text-align: center;
    background: rgba(0, 0, 0, 0.7);
    padding: 10px 20px;
    border-radius: 5px;
    display: flex;
    align-items: center;
    svg {
      color: var(--secondaryColor2);
      margin-right: 10px;
    }
    @media screen and (max-width: 900px) {
      font-size: 1rem;
      flex-direction: column;
      background: rgba(255, 255, 255, 0.9);
      color: #111;
      svg {
        margin-right: 0px;
        margin-bottom: 10px;
        font-size: 1.5rem;
        color: var(--secondaryColor);
      }
    }
  }
  .allTransfers {
    background: #fff;
    color: #222;
    font-size: 1rem;
    padding: 10px 20px;
    border: 2px solid #fff;
    border-radius: 5px;
    font-weight: 600;
    cursor: pointer;
    transition: 0.4s;
    margin: 5vh auto 5vh;

    @media screen and (max-width: 900px) {
      font-weight: 600;
      font-size: 0.9rem;
    }
  }
  .allTransfers:hover {
    background: #000;
    color: #fff;
    border: 2px solid #fff;
  }
`;

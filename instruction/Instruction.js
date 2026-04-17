import styled from "styled-components";
import { MdOutlineClose } from "react-icons/md";
import { useGlobalContext } from "../components/context";
import { useState } from "react";

const hotelMenu = [
  {
    id: 1,
    name: "menu",
    video: "/instructionVideo/user/menuUser.mp4",
  },
  {
    id: 2,
    name: "strona główna",
    video: "/instructionVideo/user/mainPageUser.mp4",
  },
  {
    id: 3,
    name: "dodaj transfer",
    video: "/instructionVideo/user/addTransferUser.mp4",
  },
  {
    id: 4,
    name: "lista transferów",
    video: "/instructionVideo/user/transferListUser.mp4",
  },
];
const adminMenu = [
  {
    id: 1,
    name: "menu",
    video: "/instructionVideo/admin/menuAdmin.mp4",
  },
  {
    id: 2,
    name: "strona główna",
    video: "/instructionVideo/admin/mainPageAdmin.mp4",
  },
  {
    id: 3,
    name: "zyski i prowizje",
    video: "/instructionVideo/admin/moneyAdmin.mp4",
  },
  {
    id: 4,
    name: "ustawienia",
    video: "/instructionVideo/admin/settingsAdmin.mp4",
  },
  {
    id: 5,
    name: "lista transferów",
    video: "/instructionVideo/admin/transfersAdmin.mp4",
  },
  {
    id: 6,
    name: "zarządzanie hotelem",
    video: "/instructionVideo/admin/hotelsettingsAdmin.mp4",
  },
];

const Instruction = ({ setShowInstruction }) => {
  const { isAdmin } = useGlobalContext();
  const [activeTip, setActiveTip] = useState(
    isAdmin ? adminMenu[0] : hotelMenu[0]
  );

  return (
    <Wrapper>
      <div className="bigContainer">
        <MdOutlineClose
          className="closeIcon"
          onClick={() => setShowInstruction(false)}
        />
        <h1>
          Instrukcja użytkowania aplikacji
          <br /> dla {isAdmin ? "ADMINISTRATORA" : "HOTELU"}
        </h1>
        {isAdmin ? (
          <div className="instructionWrapper">
            <ul>
              <p>Wybierz kategorię:</p>
              {adminMenu.map((item) => {
                return (
                  <li
                    key={item.id}
                    onClick={() => setActiveTip(item)}
                    className={activeTip === item ? "activeTip" : ""}
                  >
                    {item.name}
                  </li>
                );
              })}
            </ul>
            <video
              src={activeTip.video}
              controls
              playsInline
              type="video/mp4"
              className="video"
            ></video>
          </div>
        ) : (
          <div className="instructionWrapper">
            <ul>
              <p>Wybierz kategorię:</p>
              {hotelMenu.map((item) => {
                return (
                  <li
                    key={item.id}
                    onClick={() => setActiveTip(item)}
                    className={activeTip === item ? "activeTip" : ""}
                  >
                    {item.name}
                  </li>
                );
              })}
            </ul>
            <video
              src={activeTip.video}
              controls
              playsInline
              type="video/mp4"
              className="video"
            ></video>
          </div>
        )}
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  z-index: 10000000000000000000000000;
  position: fixed;
  top: 0;
  left: 0;
  /* transform: translate(-50%, -50%); */
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  background: rgba(0, 0, 0, 0.8);
  color: #222;
  display: flex;
  align-items: center;
  justify-content: center;
  /* overflow-x: hidden; */
  .bigContainer {
    width: 80vw;
    height: 80vh;
    padding: 20px;
    background: white;
    border: 5px solid var(--secondaryColor);
    border-radius: 5px;
    position: relative;
    @media screen and (max-width: 1000px) {
      width: 100%;
      min-height: 100%;
      top: 0;
      left: 0;
      overflow-y: auto;
      padding: 0;
    }
  }
  .closeIcon {
    position: absolute;
    top: 5vh;
    top: 5dvh;
    right: 5vw;
    font-size: 2.5rem;
    color: var(--secondaryColor);
    transition: 0.4s;
    cursor: pointer;
    :hover {
      transform: rotate(180deg);
    }
    @media screen and (max-width: 1200px) {
      top: 3vh;
      top: 3dvh;
    }
  }
  h1 {
    text-transform: uppercase;
    text-align: center;
    color: var(--secondaryColor);
    font-size: 1.6rem;
    margin-top: 5vh;
    margin-bottom: 10vh;
    letter-spacing: 2px;
    @media screen and (max-width: 1200px) {
      font-size: 1.2rem;
      width: 85vw;
      margin: 10vh auto 5vh;
    }
  }
  .instructionWrapper {
    width: 90%;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    overflow-x: hidden;
    .video {
      width: 65%;
      border: 1px solid #aaa;
      border-radius: 5px;
    }
    ul {
      width: 28%;
      padding: 2vh 0;
      border-right: 2px solid #222;
      p {
        margin-bottom: 5vh;
      }

      li {
        margin-top: 2vh;
        margin-bottom: 2vh;
        font-size: 1.1rem;
        cursor: pointer;
        transition: 0.4s;
        width: 100%;
        :hover {
          color: var(--secondaryColor);
        }
      }
      .activeTip {
        color: var(--secondaryColor);
        font-weight: 600;
        margin-left: 20%;
      }
    }
    @media screen and (max-width: 1300px) {
      width: 95%;
      ul {
        li {
          font-size: 0.95rem;
        }
        .activeTip {
          margin-left: 10%;
        }
      }
    }
    @media screen and (max-width: 1000px) {
      flex-direction: column;
      ul {
        li {
          font-size: 1.1rem;
        }
        .activeTip {
          margin-left: 20%;
        }
      }
      .video {
        height: auto;
        width: 100%;
        margin-top: 5vh;
      }
      ul {
        width: 80%;
        border-right: none;
        p {
          text-align: center;
        }
      }
    }
  }
`;

export default Instruction;

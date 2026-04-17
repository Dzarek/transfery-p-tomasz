import styled from "styled-components";
import { RiAdminFill, RiAdminLine } from "react-icons/ri";
import { MdOutlineClose } from "react-icons/md";
import { useState } from "react";

const LoginInstruction = ({ setEmail, setPassword }) => {
  const [showModal, setShowModal] = useState(false);

  const handleAutoComplete = (login, password) => {
    setEmail(login);
    setPassword(password);
    setShowModal(false);
  };

  const logins = [
    {
      id: 1,
      icon: <RiAdminFill />,
      name: "Administrator",
      login: "admin@admin.com",
      password: "admin0",
    },
    {
      id: 2,
      icon: <RiAdminLine />,
      name: "Użytkownik 1",
      login: "test1@test.com",
      password: "test01",
    },
    {
      id: 3,
      icon: <RiAdminLine />,
      name: "Użytkownik 2",
      login: "test2@test.com",
      password: "test02",
    },
    {
      id: 4,
      icon: <RiAdminLine />,
      name: "Użytkownik 3",
      login: "test3@test.com",
      password: "test03",
    },
  ];

  return (
    <>
      {!showModal && (
        <WrapperBtn onClick={() => setShowModal(true)}>
          zobacz dane logowania
        </WrapperBtn>
      )}
      <Wrapper>
        <div className={showModal ? "smallWrapper showModal" : "smallWrapper"}>
          <MdOutlineClose
            onClick={() => setShowModal(false)}
            className="closeBtn"
          />
          <h2>
            Dane logowania <br /> dla wersji demo
          </h2>
          <div className="content">
            {logins.map((item) => {
              const { id, icon, name, login, password } = item;
              return (
                <section key={id}>
                  <h4>
                    {icon}
                    {name}
                    <button onClick={() => handleAutoComplete(login, password)}>
                      Wybierz
                    </button>
                  </h4>
                  <ul>
                    <li>
                      Login: <span>{login}</span>
                    </li>
                    <li>
                      Hasło: <span>{password}</span>
                    </li>
                  </ul>
                </section>
              );
            })}
          </div>
        </div>
      </Wrapper>
    </>
  );
};

const WrapperBtn = styled.button`
  @media screen and (min-width: 1001px) {
    display: none;
  }
  display: block;
  position: absolute;
  top: 2vh;
  left: 2vw;
  top: 2dvh;
  background: #ddd;
  color: #222;
  padding: 5px 10px;
  font-family: var(--textFont);
  z-index: 1;
  border: none;
  border-radius: 5px;
  font-weight: 500;
`;

const Wrapper = styled.div`
  .smallWrapper {
    width: 20vw;
    height: 100vh;
    background: var(--secondaryColor);
    color: #222;
    position: fixed;
    top: 50%;
    left: 0%;
    transform: translateY(-50%);
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
    @media screen and (max-width: 1400px) {
      width: 25vw;
    }
    @media screen and (max-width: 1000px) {
      width: 95vw;
      height: 95vh;
      height: 95dvh;
      left: 50%;
      transform: translate(-50%, -200%);
      border-radius: 10px;
      transition: 0.5s;
    }
    .closeBtn {
      position: absolute;
      top: 1%;
      left: 50%;
      transform: translateX(-50%);
      font-size: 2.5rem;
      color: #fff;
      transition: 0.4s;
      cursor: pointer;
      :hover {
        transform: translateX(-50%) rotate(180deg);
      }
      @media screen and (max-width: 1200px) {
        top: 2%;
      }
      @media screen and (min-width: 1001px) {
        display: none;
      }
    }
    h2 {
      text-align: center;
      font-size: 1.4rem;
      text-transform: uppercase;
      font-weight: 600;
      padding: 0 2vw;
      color: #fff;
      margin-top: 5vh;
      @media screen and (max-width: 1000px) {
        margin-top: 7vh;
        margin-bottom: -3vh;
        font-size: 1.2rem;
      }
    }

    section {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: space-between;
      width: 100%;
      margin-top: 4vh;
      @media screen and (max-width: 1000px) {
        margin-top: 2vh;
      }
      h4 {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
        button {
          margin-left: 15px;
          border: none;
          border-radius: 5px;
          font-family: var(--textFont);
          font-weight: 500;
          padding: 5px;
          cursor: pointer;
          transition: 0.4s;
          :hover {
            color: white;
            background: #333;
          }
        }
        svg {
          color: #fff;
          font-size: 2rem;
          margin-right: 10px;
        }
      }
      ul {
        list-style: none;
        font-weight: 500;
        li {
          span {
            color: #fff;
          }
        }
      }
    }
  }
  .showModal {
    @media screen and (max-width: 1000px) {
      transition: 0.5s;
      transform: translate(-50%, -50%);
    }
  }
`;

export default LoginInstruction;

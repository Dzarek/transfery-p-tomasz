import styled from "styled-components";
import { useGlobalContext } from "./context";

const DeleteModal = () => {
  const { handleStatus, setConfirmDelete, isAdmin } = useGlobalContext();
  return (
    <Wrapper>
      <section>
        <h4>
          {isAdmin
            ? "Czy na pewno chcesz potwierdzić ten transfer?"
            : "Czy na pewno chcesz usunąć ten transfer?"}
        </h4>
        <div className="btnContainer">
          <button onClick={() => setConfirmDelete(false)}>NIE</button>
          <button
            onClick={handleStatus}
            style={{ background: isAdmin ? "#598c50" : "#481a11" }}
          >
            TAK
          </button>
        </div>
      </section>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.95);
  z-index: 9;
  section {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 30vw;
    background: #fff;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    @media screen and (max-width: 900px) {
      width: 90vw;
    }
    h4 {
      font-size: 1.5rem;
      color: #222;
      text-align: center;
      font-weight: 600;
    }
    .btnContainer {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 5vh;
      button {
        margin: 0 2vw;
        cursor: pointer;
        font-size: 1.4rem;
        font-weight: 600;
        text-transform: uppercase;
        padding: 5px 10px;
        min-width: 100px;
        border-radius: 5px;
        border: none;
        font-family: var(--textFont);
        color: white;
        transition: 0.4s;
        &:nth-of-type(1) {
          background: var(--statusPending);
        }
        &:hover {
          transform: scale(1.05);
        }
      }
    }
  }
`;

export default DeleteModal;

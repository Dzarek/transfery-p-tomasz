import styled from "styled-components";

const FirstLoading = () => {
  return (
    <Wrapper>
      <video
        src="/images/carVideo2.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="videoContainer"
      ></video>
      <h2>Wczytywanie...</h2>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #000;
  position: fixed;
  z-index: 99999;
  .videoContainer {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 720px;
    transform: translate(-50%, -50%);
    object-fit: cover;
    filter: sepia(0.6) brightness(1);
    @media screen and (max-width: 900px) {
      width: 100%;
      top: 45%;
    }
  }

  h2 {
    font-size: 1.8rem;
    letter-spacing: 2px;
    font-weight: 600;
    color: #b99e81;
    text-transform: uppercase;
    position: absolute;
    top: 75%;
    left: 50%;
    transform: translateX(-50%);
    @media screen and (max-width: 900px) {
      top: 65%;
      font-size: 1.4rem;
    }
  }
`;

export default FirstLoading;

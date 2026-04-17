import { GiCarWheel } from "react-icons/gi";

const Loading = () => {
  return (
    <div className="loader">
      <GiCarWheel />
      <h6 className="loaderTitle">WCZYTYWANIE...</h6>
    </div>
  );
};

export default Loading;

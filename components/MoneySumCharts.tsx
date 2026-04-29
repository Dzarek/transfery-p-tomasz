"use client";
import styled from "styled-components";
import { useState, useMemo } from "react";
import { useGlobalContext } from "./context";
import { MdOutlineClose } from "react-icons/md";
import { IoMdArrowDropdownCircle, IoMdArrowDropupCircle } from "react-icons/io";
import { Pie } from "react-chartjs-2";
import Chart from "chart.js/auto";
import { CategoryScale } from "chart.js";

Chart.register(CategoryScale);

type Props = {
  setOpenMoneyCharts: (val: boolean) => void;
};

type User = {
  id: string;
  userName: string;
};

const MoneySumCharts = ({ setOpenMoneyCharts }: Props) => {
  const {
    allUsersList,
    setUserID,
    currentMonthYear,
    prevMonthYear,
    monthProvision,
    monthAdminEarn,
    monthAdminEarnAll,
    monthProvisionAll,
    prevMonthProvision,
    prevMonthAdminEarn,
    prevMonthAdminEarnAll,
    prevMonthProvisionAll,
  } = useGlobalContext();

  const [activeMonth, setActiveMonth] = useState(true);
  const [userSelect, setUserSelect] = useState<string>("---");

  // 🔹 aktualne dane zależne od miesiąca
  const dataSource = useMemo(() => {
    return activeMonth
      ? {
          total: monthAdminEarnAll,
          provisionAll: monthProvisionAll,
          userEarn: monthAdminEarn,
          userProvision: monthProvision,
          label: currentMonthYear,
        }
      : {
          total: prevMonthAdminEarnAll,
          provisionAll: prevMonthProvisionAll,
          userEarn: prevMonthAdminEarn,
          userProvision: prevMonthProvision,
          label: prevMonthYear,
        };
  }, [
    activeMonth,
    monthAdminEarnAll,
    monthProvisionAll,
    monthAdminEarn,
    monthProvision,
    prevMonthAdminEarnAll,
    prevMonthProvisionAll,
    prevMonthAdminEarn,
    prevMonthProvision,
    currentMonthYear,
    prevMonthYear,
  ]);

  // 🔹 dane do wykresu
  const chartData = useMemo(() => {
    if (userSelect === "---") return null;

    return {
      labels: ["Reszta Hoteli", userSelect],
      datasets: [
        {
          label: "Zysk",
          data: [dataSource.total - dataSource.userEarn, dataSource.userEarn],
          backgroundColor: ["rgb(255, 250, 233)", "#b99e81"],
          borderColor: "black",
          borderWidth: 2,
        },
      ],
    };
  }, [dataSource, userSelect]);

  // 🔹 select users
  const usersOptions: User[] = useMemo(
    () => [{ id: "0", userName: "---" }, ...allUsersList],
    [allUsersList],
  );

  const handleChangeMonth = () => {
    setActiveMonth((prev) => !prev);
  };

  const handleActiveHotel = (value: string) => {
    setUserSelect(value);

    if (value === "---") {
      setUserID("0");
      return;
    }

    const found = allUsersList.find((u: User) => u.userName === value);
    if (found) setUserID(found.id);
  };

  return (
    <Wrapper>
      <CloseIcon onClick={() => setOpenMoneyCharts(false)} />

      <Container>
        <Title>Zestawienie Zarobków</Title>
        <MonthBtn>
          {dataSource.label.toUpperCase()}
          {activeMonth ? (
            <IoMdArrowDropupCircle onClick={() => setActiveMonth(false)} />
          ) : (
            <IoMdArrowDropdownCircle onClick={() => setActiveMonth(true)} />
          )}
        </MonthBtn>

        <Summary>
          <h4>
            cały zysk = <span>{dataSource.total} PLN</span>
          </h4>
          <h4>
            prowizja hoteli = <span>{dataSource.provisionAll} PLN</span>
          </h4>
        </Summary>

        <Main>
          <Left>
            <label>Wybierz Hotel:</label>

            <select
              value={userSelect}
              onChange={(e) => handleActiveHotel(e.target.value)}
            >
              {usersOptions.map((u) => (
                <option key={u.id} value={u.userName}>
                  {u.userName}
                </option>
              ))}
            </select>

            {userSelect !== "---" && (
              <article>
                <p>
                  prowizja hotelu = <span>{dataSource.userProvision} PLN</span>
                </p>
                <p>
                  zysk z hotelu = <span>{dataSource.userEarn} PLN</span>
                </p>
              </article>
            )}
          </Left>

          {userSelect !== "---" ? (
            <ChartWrapper>
              <h4>
                zarobek <span>{userSelect}</span> do całości
              </h4>
              <Pie data={chartData!} />
            </ChartWrapper>
          ) : (
            <img src="/images/chartsImg.png" alt="" />
          )}
        </Main>
      </Container>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: white;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow-y: auto;
  border: 4px solid var(--secondaryColor);
`;

const Container = styled.div`
  position: relative;
  width: 100%;
  min-height: 100vh;
  height: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 5vh 0 10vh;
`;

const CloseIcon = styled(MdOutlineClose)`
  position: absolute;
  top: 5%;
  right: 5%;
  font-size: 2.5rem;
  color: var(--secondaryColor);
  cursor: pointer;
  transition: 0.4s;
  z-index: 99999;
  &:hover {
    transform: rotate(180deg);
  }
`;

const Title = styled.h3`
  text-transform: uppercase;
  color: var(--secondaryColor);
  font-size: 1.8rem;
  margin-bottom: 8vh;
  margin-top: 5vh;
  letter-spacing: 2px;
`;

const MonthBtn = styled.button`
  display: flex;
  align-items: center;
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 5vh;
  background: transparent;
  border: none;
  cursor: pointer;

  svg {
    margin-left: 10px;
    font-size: 1.8rem;
    color: var(--secondaryColor);
    transition: 0.3s;

    &:hover {
      transform: scale(1.1);
    }
  }
`;

const Summary = styled.section`
  width: 100%;
  background: #222;
  color: white;
  padding: 20px 10px;
  margin-bottom: 5vh;
  text-align: center;

  h4 {
    margin-bottom: 1vh;
    font-size: 1.2rem;
  }

  span {
    color: var(--secondaryColor);
    font-weight: bold;
  }
`;

const Main = styled.div`
  width: 80%;
  display: flex;
  justify-content: space-around;
  align-items: center;

  img {
    width: 40%;
  }

  @media (max-width: 900px) {
    flex-direction: column;

    img {
      width: 70%;
    }
  }
`;

const Left = styled.div`
  width: 45%;
  display: flex;
  flex-direction: column;
  align-items: center;

  label {
    font-size: 1.2rem;
    font-weight: 500;
  }

  select {
    width: 80%;
    margin: 2vh 0 4vh;
    padding: 7px;
    font-size: 1.1rem;
    font-weight: 600;
    text-align: center;
    border: 2px solid var(--secondaryColor);
    border-radius: 5px;
    background: var(--secondaryColorLight2);
  }

  article {
    text-align: center;

    p {
      margin-top: 1vh;
      font-size: 1.2rem;
    }

    span {
      color: var(--secondaryColor);
      font-weight: bold;
    }
  }

  @media (max-width: 900px) {
    width: 100%;
  }
`;

const ChartWrapper = styled.div`
  width: 35%;
  margin: 5vh auto;
  text-align: center;

  h4 {
    margin-bottom: 2vh;
    font-size: 1.2rem;
    font-weight: 700;
    text-transform: uppercase;
  }

  span {
    color: var(--secondaryColor);
  }

  @media (max-width: 900px) {
    width: 80%;
  }
`;

export default MoneySumCharts;

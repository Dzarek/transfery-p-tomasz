"use client";

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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white border-4 border-[var(--secondaryColor)] overflow-y-auto">
      <div className="w-full min-h-screen flex flex-col items-center py-10 px-4 relative">
        {/* CLOSE */}
        <MdOutlineClose
          className="absolute top-4 right-6 text-4xl text-[var(--secondaryColor)] cursor-pointer hover:rotate-180 transition"
          onClick={() => setOpenMoneyCharts(false)}
        />

        {/* TITLE */}
        <h3 className="text-2xl md:text-3xl uppercase text-[var(--secondaryColor)] tracking-widest mt-16 mb-10 text-center">
          Zestawienie Zarobków
        </h3>

        {/* MONTH SWITCH */}
        <button className="flex items-center text-lg md:text-2xl font-semibold mb-8">
          {dataSource.label.toUpperCase()}
          {activeMonth ? (
            <IoMdArrowDropupCircle
              className="ml-2 text-2xl text-[var(--secondaryColor)] cursor-pointer"
              onClick={handleChangeMonth}
            />
          ) : (
            <IoMdArrowDropdownCircle
              className="ml-2 text-2xl text-[var(--secondaryColor)] cursor-pointer"
              onClick={handleChangeMonth}
            />
          )}
        </button>

        {/* SUMMARY */}
        <section className="w-full bg-[#222] text-white text-center py-4 mb-10">
          <h4>
            cały zysk ={" "}
            <span className="text-[var(--secondaryColor)] font-bold">
              {dataSource.total} PLN
            </span>
          </h4>
          <h4>
            prowizja hoteli ={" "}
            <span className="text-[var(--secondaryColor)] font-bold">
              {dataSource.provisionAll} PLN
            </span>
          </h4>
        </section>

        <div className="flex flex-col md:flex-row w-full max-w-6xl items-center justify-around gap-10">
          {/* LEFT */}
          <div className="flex flex-col items-center w-full md:w-1/2">
            <label className="text-lg font-medium">Wybierz Hotel:</label>

            <select
              value={userSelect}
              onChange={(e) => handleActiveHotel(e.target.value)}
              className="w-4/5 mt-4 mb-6 p-2 border-2 border-[var(--secondaryColor)] rounded text-center font-semibold uppercase"
            >
              {usersOptions.map((u) => (
                <option key={u.id} value={u.userName}>
                  {u.userName}
                </option>
              ))}
            </select>

            {userSelect !== "---" && (
              <div className="text-center space-y-2">
                <p>
                  prowizja hotelu ={" "}
                  <span className="text-[var(--secondaryColor)] font-bold">
                    {dataSource.userProvision} PLN
                  </span>
                </p>
                <p>
                  zysk z hotelu ={" "}
                  <span className="text-[var(--secondaryColor)] font-bold">
                    {dataSource.userEarn} PLN
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="w-full md:w-1/2 flex justify-center">
            {chartData ? (
              <div className="w-[80%] md:w-[60%]">
                <h4 className="text-center font-bold mb-4 uppercase">
                  zarobek <span>{userSelect}</span> do całości
                </h4>
                <Pie data={chartData} />
              </div>
            ) : (
              <img
                src="/images/chartsImg.png"
                alt="charts"
                className="w-2/3 md:w-1/2"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoneySumCharts;

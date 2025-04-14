import React from "react";
import "./Kava_Awards.css";

const KavaHistory = () => {
  const winnersData = [
    {
      year: 2017,
      winner: "Amit Sharma",
      matches: 50,
      kavas: 30,
      percent: "60%",
      img: "/img/amit-sharma.png",
    },
    {
      year: 2018,
      winner: "Rohan Verma",
      matches: 48,
      kavas: 28,
      percent: "58%",
      img: "/img/rohan-verma.png",
    },
    {
      year: 2019,
      winner: "Siddharth Rao",
      matches: 52,
      kavas: 32,
      percent: "61.5%",
      img: "/img/siddharth-rao.png",
    },
    {
      year: 2020,
      winner: "Priya Kumar",
      matches: 45,
      kavas: 27,
      percent: "60%",
      img: "/img/priya-kumar.png",
    },
    {
      year: 2021,
      winner: "Aryan Kapoor",
      matches: 50,
      kavas: 31,
      percent: "62%",
      img: "/img/aryan-kapoor.png",
    },
    {
      year: 2022,
      winner: "Neha Patil",
      matches: 49,
      kavas: 29,
      percent: "59%",
      img: "/img/neha-patil.png",
    },
    {
      year: 2023,
      winner: "Rajesh Iyer",
      matches: 51,
      kavas: 33,
      percent: "64.7%",
      img: "/img/rajesh-iyer.png",
    },
    {
      year: 2024,
      winner: "John Doe",
      matches: 53,
      kavas: 34,
      percent: "64.1%",
      img: "/img/john-doe.png",
    },
  ];

  return (
    <div className="kava-history-section">
    <h1>🏅 History of Kava Awards (2017-2024)</h1>
    <div className="history-container">
        {winnersData.map((item, index) => (
          <div key={index} className="history-card">
            <img src={item.img} alt={item.winner} className="player-img" />
            <div className="history-info">
              <p className="year">
                <strong>{item.year}</strong>
              </p>
              <p className="winner-name">{item.winner}</p>
              <p className="stats">
                Matches: <strong>{item.matches}</strong> | Kavas:{" "}
                <strong>{item.kavas}</strong> | Win %:{" "}
                <strong>{item.percent}</strong>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KavaHistory;

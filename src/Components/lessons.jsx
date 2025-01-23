import React from "react";

const Lessons = () =>{

    const lessons = [
        {
          title: "Crypto Unlocked: Navigating the World of Digital Assets",
          link: "/crypto-investing",
        },
        {
          title: "Gold: A Timeless Investment for Financial Security",
          link: "https://www.investopedia.com/articles/economics/09/why-gold-matters.asp",
        },
        {
          title: "Stock Market 101: From Basics to Building a Winning Portfolio",
          link: "/stock-market-101",
        },
        {
          title: "The Power of Mutual Funds: Simplified Investing for Everyone",
          link: "/mutual-funds",
        },
        {
          title: "Real Estate: Turning Property into Profit",
          link: "/real-estate",
        },
        {
          title: "Fixed Deposits and Bonds: Low-Risk Options for Steady Returns",
          link: "/fixed-deposits",
        },
        {
          title: "Index Funds: A Passive Path to Wealth",
          link: "/index-funds",
        },
        {
          title: "Retirement Planning: Building Your Financial Freedom Fund",
          link: "/retirement-planning",
        },
        {
          title: "The Art of Diversification: Balancing Risk and Reward",
          link: "/diversification",
        },
      ];

    return(
        <>
        <div className="w-[82%] ml-[20%] bg-gradient-to-b from-[#172554] to-[#bae6fd] p-8 ">

            <h1 className="text-[4vh] text-white font-bold">Finance Lessons</h1>

            <div className="flex flex-wrap justify-center">
      {lessons.map((lesson, index) => (
        <a
          key={index}
          href={lesson.link}
          target="blank"
          rel="noopener noreferrer"
          className="bg-white w-[20%] p-10 m-10 rounded-lg hover:bg-blue-400 drop-shadow-sm transition-all duration-300 text-center"
        >
          <h1 className="text-lg font-semibold">{lesson.title}</h1>
        </a>
      ))}
    </div>

        </div>

      
        </>
    )


}

export default Lessons;


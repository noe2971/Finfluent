import React from "react";

const Lessons = () =>{

    const lessons = [
        {
          title: "Crypto Unlocked: Navigating the World of Digital Assets",
          link: "https://www.simplilearn.com/tutorials/blockchain-tutorial/what-is-cryptocurrency",
        },
        {
          title: "Gold: A Timeless Investment for Financial Security",
          link: "https://www.investopedia.com/articles/economics/09/why-gold-matters.asp",
        },
        {
          title: "Stock Market 101: From Basics to Building a Winning Portfolio",
          link: "https://zerodha.com/varsity/module/introduction-to-stock-markets/",
        },
        {
          title: "The Power of Mutual Funds: Simplified Investing for Everyone",
          link: "https://www.investopedia.com/terms/m/mutualfund.asp",
        },
        {
          title: "Real Estate: Turning Property into Profit",
          link: "https://www.investopedia.com/articles/mortgages-real-estate/11/make-money-in-real-estate.asp",
        },
        {
          title: "Fixed Deposits and Bonds: Low-Risk Options for Steady Returns",
          link: "https://www.bajajfinserv.in/investments/fixed-deposits-vs-investment-bonds",
        },
        {
          title: "Index Funds: A Passive Path to Wealth",
          link: "https://www.bankoncube.com/post/passive-income-through-index-funds-tracking-market-performance",
        },
        {
          title: "Retirement Planning: Building Your Financial Freedom Fund",
          link: "https://www.livemint.com/money/personal-finance/retirement-planning-how-to-build-a-strong-financial-foundation-early-mutual-funds-sips-11736752076873.html",
        },
        {
          title: "The Art of Diversification: Balancing Risk and Reward",
          link: "https://www.goldstonefinancialgroup.com/the-art-of-investment-planning-balancing-risk-and-reward/",
        },
      ];

    return(
        <>
        <div className="min-h-screen w-[82%] ml-[20%] bg-gradient-to-b from-[#172554] to-[#bae6fd] p-8 ">

            <h1 className="text-[4vh] text-center text-white font-bold">Finance Lessons</h1>

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


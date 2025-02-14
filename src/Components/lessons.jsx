import React, { useState, useEffect } from 'react';
import { BookOpen, GraduationCap, Award } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const Lessons = () => {
  // Listen for the current user via Firebase Auth.
  const [user, setUser] = useState(null);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);
  const userId = user?.uid;

  // Store completed lesson IDs (using the lesson index as an identifier).
  const [completedLessonIds, setCompletedLessonIds] = useState([]);

  // Define the lessons array.
  const lessons = [
    {
      title: 'Introduction to Investing',
      description: 'Learn the basics of investing and how to get started.',
      duration: '5-10 mins',
      level: 'Beginner',
      link: "https://www.investopedia.com/articles/basics/11/3-s-simple-investing.asp",
    },
    {
      title: 'Stock Market Basics',
      description: 'Learn the basics of Stocks and how to best invest.',
      duration: '3-5 mins',
      level: 'Beginner',
      link: "https://dfi.wa.gov/financial-education/information/basics-investing-stocks",
    },
    {
      title: 'Fixed Deposits and Bonds',
      description: 'Understand the basics of bonds and how they are a low risk investment option.',
      duration: '3-5 mins',
      level: 'Beginner',
      link: "https://www.bajajfinserv.in/investments/fixed-deposits-vs-investment-bonds",
    },
    {
      title: 'Index Funds: A Passive Path to Wealth',
      description: 'Understanding what index funds are, how they work, and their benefits.',
      duration: '3-5 mins',
      level: 'Beginner',
      link: "https://www.bankoncube.com/post/passive-income-through-index-funds-tracking-market-performance",
    },
    {
      title: 'Gold: A Timeless Investment for Financial Security',
      description: 'Learning how to invest in gold and why it is a good investment.',
      duration: '5-10 mins',
      level: 'Intermediate',
      link: "https://www.investopedia.com/articles/economics/09/why-gold-matters.asp",
    },
    {
      title: 'Crypto Unlocked: Navigating the World of Digital Assets',
      description: 'Understanding what crypto is, how it works, and its benefits.',
      duration: '10-15 mins',
      level: 'Intermediate',
      link: "https://www.simplilearn.com/tutorials/blockchain-tutorial/what-is-cryptocurrency",
    },
    {
      title: 'Retirement Planning: Building Your Financial Freedom Fund',
      description: 'How to be ready for retirement and be prepared for the future.',
      duration: '5-10 mins',
      level: 'Intermediate',
      link: "https://www.livemint.com/money/personal-finance/retirement-planning-how-to-build-a-strong-financial-foundation-early-mutual-funds-sips-11736752076873.html",
    },
    {
      title: 'The Power of Mutual Funds: Simplified Investing for Everyone',
      description: 'Learning about types of mutual funds, how they work, and how to invest in them.',
      duration: '10-15 mins',
      level: 'Intermediate',
      link: "https://www.investopedia.com/terms/m/mutualfund.asp",
    },
    {
      title: 'The Art of Diversification: Balancing Risk and Reward',
      description: 'How to spread out investments to reduce risk and potentially increase profits.',
      duration: '5-10 mins',
      level: 'Intermediate',
      link: "https://www.goldstonefinancialgroup.com/the-art-of-investment-planning-balancing-risk-and-reward/",
    },
    {
      title: 'Real Estate: Turning Property into Profit',
      description: 'Understanding how investing in real estate works and how it can create passive income.',
      duration: '5-10 mins',
      level: 'Advanced',
      link: "https://www.investopedia.com/articles/mortgages-real-estate/11/make-money-in-real-estate.asp",
    },
    {
      title: 'Stocks - Everything You Need to Know',
      description: 'From basics to advanced, learn about stocks, key terms, and factors influencing their prices.',
      duration: '45-60 mins',
      level: 'Advanced',
      link: "https://zerodha.com/varsity/module/introduction-to-stock-markets/",
    },
  ];

  // Toggle a lesson's completion status.
  const toggleLessonCompletion = async (lessonIndex) => {
    let newCompletedLessonIds;
    if (completedLessonIds.includes(lessonIndex)) {
      // If already completed, remove it.
      newCompletedLessonIds = completedLessonIds.filter(id => id !== lessonIndex);
    } else {
      // Otherwise, mark it as completed.
      newCompletedLessonIds = [...completedLessonIds, lessonIndex];
    }
    setCompletedLessonIds(newCompletedLessonIds);
    if (!userId) return;
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, { completedLessonIds: newCompletedLessonIds }, { merge: true });
  };

  // Fetch the user's completed lessons from Firebase.
  useEffect(() => {
    if (!userId) return;
    const fetchProgress = async () => {
      const userRef = doc(db, "users", userId);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        setCompletedLessonIds(docSnap.data().completedLessonIds || []);
      }
    };
    fetchProgress();
  }, [userId]);

  // Compute progress percentages for each level.
  const computeProgress = () => {
    const levelTotals = { Beginner: 0, Intermediate: 0, Advanced: 0 };
    const levelCompleted = { Beginner: 0, Intermediate: 0, Advanced: 0 };
    lessons.forEach((lesson, index) => {
      levelTotals[lesson.level] = (levelTotals[lesson.level] || 0) + 1;
      if (completedLessonIds.includes(index)) {
        levelCompleted[lesson.level] = (levelCompleted[lesson.level] || 0) + 1;
      }
    });
    const newProgress = {};
    for (const level in levelTotals) {
      newProgress[level] =
        levelTotals[level] > 0
          ? Math.round((levelCompleted[level] / levelTotals[level]) * 100)
          : 0;
    }
    return newProgress;
  };
  const computedProgress = computeProgress();

  // Determine the current level based on completion.
  const computeCurrentLevel = () => {
    let beginnerCount = 0, beginnerCompleted = 0;
    let intermediateCount = 0, intermediateCompleted = 0;
    let advancedCount = 0, advancedCompleted = 0;
    lessons.forEach((lesson, index) => {
      if (lesson.level === "Beginner") {
        beginnerCount++;
        if (completedLessonIds.includes(index)) beginnerCompleted++;
      } else if (lesson.level === "Intermediate") {
        intermediateCount++;
        if (completedLessonIds.includes(index)) intermediateCompleted++;
      } else if (lesson.level === "Advanced") {
        advancedCount++;
        if (completedLessonIds.includes(index)) advancedCompleted++;
      }
    });
    if (beginnerCompleted === beginnerCount && intermediateCompleted === intermediateCount && advancedCompleted === advancedCount) {
      return "Advanced";
    } else if (beginnerCompleted === beginnerCount && intermediateCompleted === intermediateCount) {
      return "Intermediate";
    } else if (beginnerCompleted === beginnerCount) {
      return "Beginner";
    } else {
      return "Amateur";
    }
  };
  const currentLevel = computeCurrentLevel();

  // Compute a badge title based on number of lessons completed.
  const badgeTitle = (() => {
    const count = completedLessonIds.length;
    if (count >= 50) return "Wall Street Wizard";
    else if (count >= 20) return "Investment Pro";
    else if (count >= 10) return "Market Enthusiast";
    else if (count >= 5) return "Financial Learner";
    else if (count >= 2) return "Finance Novice";
    else return "Finance Rookie";
  })();
  return (
    <div className="max-w-4xl mx-auto space-y-4 p-4 ml-80">
      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-xs">Completed Lessons</p>
              <h3 className="text-lg font-bold text-white mt-1">
                {completedLessonIds.length}/{lessons.length}
              </h3>
            </div>
            <BookOpen className="h-6 w-6 text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-xs">Current Level</p>
              <h3 className="text-lg font-bold text-white mt-1">{currentLevel}</h3>
            </div>
            <GraduationCap className="h-6 w-6 text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-xs">Achievements</p>
              <h3 className="text-lg font-bold text-white mt-1">{badgeTitle}</h3>
            </div>
            <Award className="h-6 w-6 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Learning Progress */}
      <div className="bg-[#0A1929]/80 rounded-lg shadow-md p-4">
        <h2 className="text-lg font-semibold text-white mb-2">Your Learning Progress</h2>
        <div className="space-y-2">
          {Object.keys(computedProgress).map((level, index) => (
            <div
              key={index}
              className="bg-gradient-to-r from-blue-900/30 to-blue-800/30 p-2 rounded-lg"
            >
              <div className="flex justify-between items-center mb-1 text-xs">
                <span className="text-white">{level}</span>
                <span className="text-blue-300">{computedProgress[level]}%</span>
              </div>
              <div className="w-full bg-blue-900/50 rounded-full h-1">
                <div
                  className="bg-blue-500 rounded-full h-1"
                  style={{ width: `${computedProgress[level]}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Available Lessons */}
      <div className="bg-[#0A1929]/80 rounded-lg shadow-md p-4">
        <h2 className="text-lg font-semibold text-white mb-2">Available Lessons</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lessons.map((lesson, index) => (
            <div
              key={index}
              className="bg-gradient-to-r from-blue-900/30 to-blue-800/30 p-4 rounded-lg"
            >
              <BookOpen className="h-6 w-6 text-blue-400 mb-2" />
              <h3 className="text-md font-medium text-white mb-1">{lesson.title}</h3>
              <p className="text-blue-300 text-sm mb-2">{lesson.description}</p>
              <div className="flex justify-between text-xs">
                <span className="text-blue-200">{lesson.duration}</span>
                <span className="text-blue-200">{lesson.level}</span>
              </div>
              <a
                href={lesson.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-1 rounded-lg transition-colors text-xs text-center block"
              >
                Start Lesson
              </a>
              <button
                onClick={() => toggleLessonCompletion(index)}
                className={`mt-2 w-full ${
                  completedLessonIds.includes(index)
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                } text-white py-1 rounded-lg transition-colors text-xs text-center block`}
              >
                {completedLessonIds.includes(index)
                  ? 'Mark as Incomplete'
                  : 'Mark as Completed'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Lessons;

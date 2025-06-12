import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronRight, Mail, LayoutDashboard, TrendingUp, UserCircle, MessageSquare, Target, HeartPulse } from "lucide-react";
import chatbot from '../config/chatbot.jpg';
import main from '../config/main.jpg';
import dashboard from '../config/dashboard.jpg';
import health from '../config/health.jpg';
import plan from '../config/plan.jpg';
import profile from '../config/profile.jpg';
import stocks from '../config/stocks.jpg';
import videoSample from '../config/video.mp4';
import { BookOpen, GraduationCap, Award } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { FaInstagram } from 'react-icons/fa';

const home = () => {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const features = [
    {
      icon: <LayoutDashboard className="w-6 h-6" />,
      title: "Financial Dashboard",
      description: "Monitor your expenses, investments, and progress with our intuitive dashboard. Set financial goals and earn achievement badges along the way.",
      image: dashboard
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Live Stock Tracking",
      description: "Track your investments in real-time. Conduct research and analyze stocks with detailed insights to make informed decisions.",
      image: stocks
    },
    {
      icon: <UserCircle className="w-6 h-6" />,
      title: "Profile Builder",
      description: "Build a personalized profile to allow us to understand your needs better. Update your details anytime with ease.",
      image: profile
    }
  ];

  const additionalFeatures = [
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Finance AI Chatbot",
      description: "Ask our AI-powered chatbot if you have any financial questions. It can respond in many languages. Gain valuable insights and learn financial terms effortlessly.",
      image: chatbot
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Financial Lessons",
      description: "Learn about the basics of finance and smart spending. You get the opportunity to view insightful articles and useful resources to broaden your understanding.",
      image: plan
    },
    {
      icon: <HeartPulse className="w-6 h-6" />,
      title: "Action Plan",
      description: "Get a plan that will help improve your financial stability. Track your progress and receive actionable insights on possible improvements you can make.",
      image: health
    }
  ];

  const [completedLessonIds, setCompletedLessonIds] = useState(() => {
    const saved = localStorage.getItem('completedLessonIds');
    return saved ? JSON.parse(saved) : [];
  });

  // Persist to localStorage whenever completedLessonIds changes
  useEffect(() => {
    localStorage.setItem('completedLessonIds', JSON.stringify(completedLessonIds));
  }, [completedLessonIds]);

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

  const toggleLessonCompletion = (lessonIndex) => {
    setCompletedLessonIds((ids) =>
      ids.includes(lessonIndex)
        ? ids.filter((id) => id !== lessonIndex)
        : [...ids, lessonIndex]
    );
  };

  const computeProgress = () => {
    const levelTotals = { Beginner: 0, Intermediate: 0, Advanced: 0 };
    const levelCompleted = { Beginner: 0, Intermediate: 0, Advanced: 0 };
    lessons.forEach((lesson, index) => {
      levelTotals[lesson.level]++;
      if (completedLessonIds.includes(index)) {
        levelCompleted[lesson.level]++;
      }
    });
    return Object.fromEntries(
      Object.keys(levelTotals).map((level) => [
        level,
        levelTotals[level]
          ? Math.round((levelCompleted[level] / levelTotals[level]) * 100)
          : 0,
      ])
    );
  };

  const computeCurrentLevel = () => {
    const levels = computeProgress();
    if (levels.Beginner === 100 && levels.Intermediate === 100 && levels.Advanced === 100)
      return 'Advanced';
    if (levels.Beginner === 100 && levels.Intermediate === 100) return 'Intermediate';
    if (levels.Beginner === 100) return 'Beginner';
    return 'Amateur';
  };

  const computedProgress = computeProgress();
  const currentLevel = computeCurrentLevel();

  const badgeTitle = (() => {
    const count = completedLessonIds.length;
    if (count >= 50) return 'Wall Street Wizard';
    if (count >= 20) return 'Investment Pro';
    if (count >= 10) return 'Market Enthusiast';
    if (count >= 5) return 'Financial Learner';
    if (count >= 2) return 'Finance Novice';
    return 'Finance Rookie';
  })();

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    hover: { 
      scale: 1.05,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: { type: "spring", stiffness: 300 }
    }
  };

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-x-hidden">
      <nav className="fixed top-0 w-full z-50 bg-gray-900/80 backdrop-blur-md border-b border-blue-900/30">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-xl font-semibold text-blue-400 hover:text-blue-300">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                Finfluent
              </motion.div>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection('home')}
                className="text-sm text-white hover:text-blue-400 transition-colors"
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection('about')}
                className="text-sm text-white hover:text-blue-400 transition-colors"
              >
                About us
              </button>
              <button 
                onClick={() => scrollToSection('features')}
                className="text-sm text-white hover:text-blue-400 transition-colors"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('howItWorks')}
                className="text-sm text-white hover:text-blue-400 transition-colors"
              >
                How it works
              </button>
              <button 
                onClick={() => scrollToSection('lessons')}
                className="text-sm text-white hover:text-blue-400 transition-colors"
              >
                Lessons
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className="text-sm text-white hover:text-blue-400 transition-colors"
              >
                Contact us
              </button>
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
                >
                  Sign in
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div id="home" className="relative pt-32 pb-20 bg-gradient-to-br from-gray-900 via-gray-900 to-blue-900/20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-blue-600/10 text-blue-400 rounded-full">
                  AI-Powered Finance
                </span>
                <h1 className="text-4xl md:text-6xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
                  Finance Made Simple
                </h1>
                <p className="text-lg text-white">
                  Harness AI-powered insights, learn key financial concepts, track expenses and savings, and learn about popular stocks and ETFs.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                  <Link onClick={() => scrollToSection('lessons')}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full sm:w-auto px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium inline-flex items-center justify-center space-x-2"
                    >
                      <span>Start Learning</span>
                      <ChevronRight className="w-4 h-4" />
                    </motion.button>
                  </Link>
                  <Link onClick={() => scrollToSection('contact')}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full sm:w-auto px-8 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-medium inline-flex items-center justify-center space-x-2"
                    >
                      <span>Contact Us</span>
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex-1"
            >
              <img
                src={main}
                alt="Financial dashboard"
                className="rounded-2xl shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </div>

      <div id="about" className="py-20 bg-gray-800">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-blue-400 mb-4">Our Mission</h2>
            <p className="text-white max-w-3xl mx-auto">
              Finfluent was founded with a mission to democratize financial literacy and empower everyone to make informed financial decisions. According to an article by Mint, only about 3% of the Indian population invests in the stock market, compared to 13% of the Chinese population and 55% of the US. This number highlights the extent of this issue expecially in India. Most people do not know the importance of investing their money and are not taught why it is important in school. 
            </p>
            <br />
            <p className="text-white max-w-3xl mx-auto">
              In India especially, many don't know how to invest and what to invest in. Additionally, many don't track their spendings and savings. Therefore, ultimately lacking the ability to build a financially stable life. This platform gives everyone, no matter their financial background, the opportunity to track their savings, get insights about popular investments and learn about key financial concepts all for free. We aim to give everyone the ability to expand their financial knowledge annd make smart financial decisions.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <div className="bg-gray-900 p-8 rounded-xl">
              <h3 className="text-xl font-semibold text-blue-400 mb-4">About me</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-600/10 p-3 rounded-lg">
                    <span className="text-blue-400">NC</span>
                  </div>
                  <div>
                    <p className="font-medium text-white">Noel Juby Chandy</p>
                    <p className="text-sm text-white">Founder</p>
                  </div>
                </div>
              </div>
              <br />
              <div className="text-sm text-white ml"> I am a high school student living in Mumbai studying in grade 11 at The Cathedral and John Connon School. I have always had a passion for coding and finance. That is why I decided to create this platform to promote fiancial literacy, a cause close to my heart. I strongly believe in what I am doing here and I believe that creating this website has given me the opportunity to hone my creativity, problem solving and web development skills.   </div>
            </div>
            <div className="bg-gray-900 p-8 rounded-xl">
              <h3 className="text-xl font-semibold text-blue-400 mb-4">Our Values</h3>
              <p className="text-white"> 
                Our platform is built on the principles of transparency, inclusivity, and empowerment. Through innovative technology and user-friendly tools, we're breaking down the barriers to financial literacy and helping individuals build a secure financial future. Our commitment to innovation and user-centric design drives us to create meaningful solutions for all. 
              </p>
            </div>
          </div>
        </div>
      </div>

      <div id="features" className="py-20 bg-gray-900">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-blue-400 mb-4">Comprehensive Features</h2>
            <p className="text-white">Everything you need to manage and grow your wealth</p>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover="hover"
                className="bg-gray-900/50 backdrop-blur-lg border border-blue-900/20 rounded-xl p-6 flex flex-col items-start space-y-4 overflow-hidden transform transition-all duration-300"
              >
                <motion.img
                  initial={{ scale: 1.2 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.6 }}
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-40 object-cover rounded-lg mb-4 hover:scale-105 transition-transform duration-300"
                />
                <div className="p-2 rounded-lg bg-blue-600/10 text-blue-400">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-blue-400">{feature.title}</h3>
                <p className="text-sm text-white">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="py-20 bg-gray-800">
        <div className="container mx-auto px-6">
          <motion.div 
            variants={containerVariants}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {additionalFeatures.map((feature, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover="hover"
                className="bg-gray-800/50 backdrop-blur-lg border border-blue-900/20 rounded-xl p-6 flex flex-col items-start space-y-4"
              >
                <motion.img
                  initial={{ scale: 1.2 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.6 }}
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-40 object-cover rounded-lg mb-4 hover:scale-105 transition-transform duration-300"
                />
                <div className="p-2 rounded-lg bg-blue-600/10 text-blue-400">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-blue-400">{feature.title}</h3>
                <p className="text-sm text-white">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      <div id="howItWorks" className="py-20 bg-gray-900">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-blue-400 mb-4">How It Works</h2>
            <p className="text-white">Watch the video below to understand how you can get started on Finfluent, your one stop destination to wealth management. Learn how to use our platform properly and view a demo of how to use all the features effectively</p>
          </motion.div>
          <div className="flex justify-center">
            <video controls className="w-full max-w-4xl rounded-lg shadow-2xl">
              <source src={videoSample} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>
      
      <div id="lessons" className="py-20 bg-gray-800">
      <div className="max-w-4xl mx-auto space-y-4 p-4">
      <motion.div 
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-blue-400 mb-4">Lessons</h2>
            <p className="text-white">Here are our lessons, begin learning now! Create a free account by clicking sign in to get access to the rest of our features, including personalized AI-advice, all for free.</p>
      </motion.div>
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
                className={`
                  mt-2 w-full ${
                    completedLessonIds.includes(index)
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-green-600 hover:bg-green-700'
                  } 
                  text-white py-1 rounded-lg transition-colors text-xs text-center block
                `}
              >
                 {completedLessonIds.includes(index)
                ? 'Mark as Incomplete'
                : 'Mark as Completed'}
              </button>
              </div>
              
            ))}
          </div>
        </div>
        <Link to="/signup">
        <div className="max-w-4xl mx-auto space-y-4 p-4 mt-10">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium inline-flex items-center justify-center space-x-2 "
                    >
                      <span>Access all our features</span>
                      <ChevronRight className="w-4 h-4" />
                    </motion.button>
        </div>
          </Link>
      </div>
      </div>

      <div id="contact" className="py-20 bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-blue-400 mb-4">Contact Us</h2>
            <p className="text-white">Get in touch with us</p>
          </motion.div>
          </div>
          <div className="max-w-2xl mx-auto bg-gray-800 rounded-xl p-8">
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="flex items-center space-x-3">
                <Mail className="w-6 h-6 text-blue-400" />
                <a 
                  href="mailto:noeljubychandy@gmail.com" 
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  noeljubychandy@gmail.com
                </a>
              </div>
              <p className="text-white text-center">
                Have questions? Feel free to reach out to us directly through mail. We're here to help!
              </p>
              <p className="text-white text-center">
                Moreover, we would really appreciate it if you checked out our instagram linked below and followed us to keep up with the latest updates to the website and support our venture!
              </p>
              <div className="flex items-center space-x-3">
                <FaInstagram className="w-6 h-6 text-pink-500" />
                <a 
               href="https://instagram.com/finfluent29" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-pink-500 hover:text-pink-400 transition-colors"
                >
                @finfluent29
              </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-blue-800/20 bg-gray-800">
  <div className="container mx-auto px-6 py-12">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      {/* Left side: Brand Info */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-blue-400">Finfluent</h4>
        <p className="text-sm text-white">
          Making wealth management accessible to everyone
        </p>
      </div>

      {/* Right side: Socials */}
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <Mail className="w-5 h-5 text-blue-400" />
          <a 
            href="mailto:noeljubychandy@gmail.com" 
            className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
          >
            noeljubychandy@gmail.com
          </a>
        </div>

        <div className="flex items-center space-x-3">
          <FaInstagram className="w-5 h-5 text-pink-500" />
          <a 
            href="https://instagram.com/finfluent29" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-pink-500 hover:text-pink-400 text-sm transition-colors"
          >
            @finfluent29
          </a>
        </div>
      </div>
    </div>
  </div>
</footer>

    </div>
  );
};

export default home;

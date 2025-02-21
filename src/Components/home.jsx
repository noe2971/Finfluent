import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronRight, Bot, LineChart, PieChart, Wallet, Mail, Star, Lock, LayoutDashboard, TrendingUp, UserCircle, MessageSquare, Target, HeartPulse } from "lucide-react";
import chatbot from '../config/chatbot.jpg';
import main from '../config/main.jpg';
import dashboard from '../config/dashboard.jpg';
import health from '../config/health.jpg';
import plan from '../config/plan.jpg';
import profile from '../config/profile.jpg';
import stocks from '../config/stocks.jpg';

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
      description: "Build a personalized profile to tailor financial advice and investment options to your needs. Update your details anytime with ease.",
      image: profile
    }
  ];

  const additionalFeatures = [
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Finance Advice Chatbot",
      description: "Ask our AI-powered chatbot for financial guidance in any language. Gain valuable insights and learn financial terms effortlessly.",
      image: chatbot
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Custom Investment Plans",
      description: "Receive investment plans customized to match your risk tolerance and financial goals, backed by data-driven insights.",
      image: plan
    },
    {
      icon: <HeartPulse className="w-6 h-6" />,
      title: "Financial Health Tracker",
      description: "Get personalized advice on improving your financial stability. Track your progress and receive actionable recommendations.",
      image: health
    }
  ];

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
                Wealthify
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
                  Smart Investing Made Simple
                </h1>
                <p className="text-lg text-white">
                  Harness AI-powered insights, track expenses, and get personalized investment suggestions for stocks and ETFs
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                  <Link to="/signup">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full sm:w-auto px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium inline-flex items-center justify-center space-x-2"
                    >
                      <span>Start Investing</span>
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
              Wealthify was founded with a mission to democratize financial literacy and empower everyone to make informed financial decisions. According to an article by Mint, only about 3% of the Indian population invests in the stock market, compared to 13% of the Chinese population and 55% of the US. This number highlights the extent of this issue expecially in India. Most people do not know the importance of investing their money and are not taught why it is important in school. 
            </p>
            <br />
            <p className="text-white max-w-3xl mx-auto">
              In India especially, many don't know how to invest and what to invest in. Additionally, many don't track their spendings and savings. Therefore, ultimately lacking the ability to build a financially stable life. This platform gives everyone, no matter their financial background, the opportunity to track their savings, get personalized investment suggestions and learn about key financial concepts all for free. We aim to give everyone the ability to expand their financial knowledge annd make smart financial decisions.
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
              <div className="text-sm text-white ml"> I am a high school student living in Mumbai studing in grade 11 at The Cathedral and John Connon School. I have always had a passion for coding and finance. This is why I decided to create this platform to promote fiancial literacy, a cause close to my heart. I strongly believe in what I am doing here and I believe that creating this website has give me the opportunity to hone my creativity, problem solving and web development skills.   </div>
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

      <div id="contact" className="py-20 bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-blue-400 mb-4">Contact Us</h2>
            <p className="text-white">Get in touch with us</p>
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
                Have questions? Feel free to reach out to us directly. We're here to help!
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-blue-900/20 bg-gray-800">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-blue-400">Wealthify</h4>
              <p className="text-sm text-white">
                Making wealth management accessible to everyone
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default home;
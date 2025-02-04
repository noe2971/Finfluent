import React from "react";

const Features = () => {
  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <header>
        <nav className="bg-blue-800 flex justify-center py-4 space-x-12 w-full">
          <button onClick={() => window.location.href = "/home"} className="hover:underline">Home</button>
          <button onClick={() => window.location.href = "/aboutus"} className="hover:underline">About Us</button>
          <button onClick={() => window.location.href = "/features"} className="hover:underline">Features</button>
          <button onClick={() => window.location.href = "/login"} className="hover:underline">Login</button>
        </nav>
      </header>

      <main className="py-12 px-6">
        <h1 className="text-center text-blue-400 text-5xl font-extrabold mb-6">Explore Our Features</h1>
        <h2 className="text-center text-gray-300 text-2xl mb-10">Enhancing your financial journey with innovative tools</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            title="Financial Dashboard"
            description="Monitor your expenses, investments, and progress with our intuitive dashboard. Set financial goals and earn achievement badges along the way."
          />
          <FeatureCard
            title="Live Stock Tracking"
            description="Track your investments in real-time. Conduct research and analyze stocks with detailed insights to make informed decisions."
          />
          <FeatureCard
            title="Profile Builder"
            description="Build a personalized profile to tailor financial advice and investment options to your needs. Update your details anytime with ease."
          />
          <FeatureCard
            title="Finance Advice Chatbot"
            description="Ask our AI-powered chatbot for financial guidance in any language. Gain valuable insights and learn financial terms effortlessly."
          />
          <FeatureCard
            title="Custom Investment Plans"
            description="Receive investment plans customized to match your risk tolerance and financial goals, backed by data-driven insights."
          />
          <FeatureCard
            title="Goal-Oriented Tracking"
            description="Set realistic financial goals and let us help you achieve them with actionable advice and progress updates."
          />
        </div>
      </main>

      <footer className="bg-blue-800 py-4 text-center">
        <p>&copy; 2024 Wealthify. All rights reserved.</p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ title, description }) => (
  <div className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-blue-500/50 transition-shadow">
    <h3 className="text-xl font-bold text-blue-400 mb-3">{title}</h3>
    <p className="text-gray-300">{description}</p>
  </div>
);

export default Features;

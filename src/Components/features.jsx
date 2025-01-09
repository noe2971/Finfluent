import React from "react";

const Features = () => {
    return (
        <div className="bg-gray-900 text-white">
            <header>
                <nav className="bg-blue-800 flex justify-center py-3 space-x-44">
                    <a href="index.html" className="border-r border-l border-white pr-6 pl-6">Home</a>
                    <a href="about.html" className="border-r border-l border-white pr-6 pl-6">About Us</a>
                    <a href="features.html" className="border-r border-l border-white pr-6 pl-6">Features</a>
                    <a href="signup.html" className="border-r border-l border-white pr-6 pl-6">Sign Up</a>
                </nav>
            </header>

            <h1 className="text-center text-blue-400 text-6xl font-bold mt-5">Wealthify</h1>
            <h2 className="text-center text-3xl my-2 text-blue-300 font-semibold">Discover Our Unique Features</h2>

            <main className="py-10 px-5">
                <section className="mb-6 bg-gray-800 p-5 rounded-lg">
                    <h3 className="text-3xl font-bold border-b-2 border-blue-400 pb-2">Financial Dashboard</h3>
                    <p className="text-lg text-gray-300">
                        Manage all your finances in one place with our easy-to-use financial dashboard. Track your expenses and investments, set new targets and goals, and see your progress while receiving cool badges that add a sense of achievement.
                    </p>
                </section>
                
                <section className="mb-6 bg-gray-800 p-5 rounded-lg">
                    <h3 className="text-3xl font-bold border-b-2 border-blue-400 pb-2">Live Stock Tracking</h3>
                    <p className="text-lg text-gray-300">
                        Track your investments in real-time with our live stock tracking feature. Conduct your own market research and discover promising stocks with our stock analysis feature. Click on them for more information.
                    </p>
                </section>
                
                <section className="mb-6 bg-gray-800 p-5 rounded-lg">
                    <h3 className="text-3xl font-bold border-b-2 border-blue-400 pb-2">Profile Builder</h3>
                    <p className="text-lg text-gray-300">
                        Use our profile-building feature to help us understand your needs for tailored financial advice and suitable investment opportunities. Fill in only what you're comfortable sharing, and update your profile anytime.
                    </p>
                </section>
                
                <section className="mb-6 bg-gray-800 p-5 rounded-lg">
                    <h3 className="text-3xl font-bold border-b-2 border-blue-400 pb-2">Finance Advice Chatbot</h3>
                    <p className="text-lg text-gray-300">
                        Get personalized advice from our finance AI chatbot, which can answer your questions and provide guidance on financial issues. The chatbot highlights key financial terms, making it beginner-friendly, and it can respond in any language.
                    </p>
                </section>
            </main>
            
            <footer className="bg-blue-800 py-4 text-center">
                <p>&copy; 2024 Wealthify. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Features;

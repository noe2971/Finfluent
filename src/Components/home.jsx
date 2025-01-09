import React from "react";

const Home = () => {
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

            <section className="text-center py-10">
                <h1 className="text-blue-400 text-6xl font-bold">Wealthify</h1>
                <h2 className="text-2xl my-6">Welcome to Wealthify</h2>
                <p className="text-lg text-gray-300 mx-auto w-3/4">
                    Our mission is to provide everyone with the opportunity to make good financial decisions, no matter their age, education, or gender. With our chatbot and personalized targets and dashboard, everyone can achieve their best financial selves — gaining financial freedom, spending your money safely, and investing money to create a passive income. We offer tailored investment options based on data collected to determine each individual's risk level.
                </p>
                <a href="signup.html" className="mt-8 inline-block bg-blue-500 text-white font-bold py-2 px-6">Sign Up Now</a>
            </section>

            <section className="flex justify-center gap-10 my-10">
                <div className="bg-gray-800 p-5 w-44">
                    <h3 className="text-xl font-bold text-blue-400 mb-2">Feature 1</h3>
                    <p>Personalized financial advice tailored to your needs</p>
                </div>
                <div className="bg-gray-800 p-5 w-44">
                    <h3 className="text-xl font-bold text-blue-400 mb-2">Feature 2</h3>
                    <p>Real-time stock updates and performance tracking</p>
                </div>
                <div className="bg-gray-800 p-5 w-44">
                    <h3 className="text-xl font-bold text-blue-400 mb-2">Feature 3</h3>
                    <p>Effective financial planning with AI-based recommendations</p>
                </div>
            </section>

            <footer className="bg-blue-800 py-4 text-center">
                <p>&copy; 2024 Wealthify. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Home;

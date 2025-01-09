import React from "react";

const AboutUs = () => {
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

            <main className="py-10">
                <h1 className="text-blue-400 text-6xl font-bold text-center">About Wealthify</h1>

                <section className="mt-6 text-center">
                    <h3 className="text-3xl font-bold mb-4">Our Story</h3>
                    <p className="text-lg text-gray-300 mx-auto w-3/4">
                        Wealthify started with a vision to make financial management accessible and user-friendly to allow anyone to invest their money, no matter what their background is.
                    </p>
                </section>

                <section className="mt-10">
                    <h3 className="text-3xl font-bold mb-4 text-center">Our Team</h3>
                    <div className="flex justify-center gap-10">
                        <div className="bg-gray-800 p-5 rounded-lg">
                            <h4 className="text-xl font-bold text-blue-400">Noel Chandy</h4>
                            <p className="text-gray-300">Founder</p>
                        </div>
                        <div className="bg-gray-800 p-5 rounded-lg">
                            <h4 className="text-xl font-bold text-blue-400">Aayushi Jain</h4>
                            <p className="text-gray-300">Mentor</p>
                        </div>
                    </div>
                </section>

                <section className="mt-10 text-center">
                    <h3 className="text-3xl font-bold mb-4">Our Values</h3>
                    <p className="text-lg text-gray-300 mx-auto w-3/4">
                        We believe in equal opportunities for all and helping those who have not had the privilege to receive education in financial literacy make choices that will benefit them financially in the long run. We believe in empowering our users to achieve their goals.
                    </p>
                </section>
            </main>

            <footer className="bg-blue-800 py-4 text-center">
                <p>&copy; 2024 Wealthify. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default AboutUs;

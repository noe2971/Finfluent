import React from "react";

const AboutUs = () => {
  return (
    <div className="bg-gray-900 text-white">
      <header>
        <nav className="bg-blue-800 flex justify-center py-4 space-x-12">
          <button onClick={() => window.location.href = "/home"} className="hover:underline">Home</button>
          <button onClick={() => window.location.href = "/aboutus"} className="hover:underline">About Us</button>
          <button onClick={() => window.location.href = "/features"} className="hover:underline">Features</button>
          <button onClick={() => window.location.href = "/login"} className="hover:underline">Login</button>
        </nav>
      </header>

      <main className="py-12 px-6">
        <h1 className="text-blue-400 text-5xl font-extrabold text-center mb-8">About Wealthify</h1>

        <section className="mb-12 text-center">
          <h2 className="text-3xl font-semibold mb-4">Our Story</h2>
          <p className="text-lg text-gray-300 mx-auto w-3/4">
            Wealthify was founded with a mission to democratize financial literacy and empower everyone to make informed financial decisions. We aim to bridge the gap between knowledge and action by providing tools that make financial planning accessible to all.
          </p>
        </section>

        <section className="mb-12 text-center">
          <h2 className="text-3xl font-semibold mb-4">Our Team</h2>
          <div className="flex justify-center gap-8 flex-wrap">
            <TeamMember name="Noel Chandy" role="Founder" />
            <TeamMember name="Aayushi Jain" role="Mentor" />
          </div>
        </section>

        <section className="text-center">
          <h2 className="text-3xl font-semibold mb-4">Our Values</h2>
          <p className="text-lg text-gray-300 mx-auto w-3/4">
            At Wealthify, we believe in financial inclusivity, equal opportunities, and empowering individuals to take control of their finances. Our commitment to innovation and user-centric design drives us to create meaningful solutions for all.
          </p>
        </section>
      </main>

      <footer className="bg-blue-800 py-4 text-center">
        <p>&copy; 2024 Wealthify. All rights reserved.</p>
      </footer>
    </div>
  );
};

const TeamMember = ({ name, role }) => (
  <div className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-blue-500/50 transition-shadow">
    <h3 className="text-xl font-bold text-blue-400">{name}</h3>
    <p className="text-gray-300">{role}</p>
  </div>
);

export default AboutUs;

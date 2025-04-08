import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const navItems = [{ name: "About Us", path: "/about" }];
const navigate = useNavigate();

const team = [
  {
    name: "Amit Kumar",
    role: "Frontend Developer",
    image: "https://randomuser.me/api/portraits/women/1.jpg",
  },
  {
    name: "Amit Mankar",
    role: "Backend Developer",
    image: "https://randomuser.me/api/portraits/men/2.jpg",
  },
  {
    name: "Priyanshi Shrivastava",
    role: "UI/UX Designer",
    image: "https://randomuser.me/api/portraits/women/3.jpg",
  },
  {
    name: "Aditya Dewangan",
    role: "AI/ML Engineer",
    image: "https://randomuser.me/api/portraits/men/4.jpg",
  },
  {
    name: "Manshi Awasthi",
    role: "AI/ML Engineer",
    image: "https://randomuser.me/api/portraits/women/5.jpg",
  },
];

const AboutUs: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-800 text-white p-10">
      <h1 className="text-4xl font-bold text-center mb-10">
        Meet Our Team
      </h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 justify-items-center">
        {team.map((member, index) => (
          <motion.div
            key={index}
            className="bg-white text-gray-800 p-6 rounded-2xl shadow-lg w-72 hover:scale-105 transition-all duration-300"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
          >
            <img
              src={member.image}
              alt={member.name}
              className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-blue-500"
            />
            <h2 className="text-xl font-semibold text-center">{member.name}</h2>
            <p className="text-center text-sm text-gray-600">{member.role}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AboutUs;
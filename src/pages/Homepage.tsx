import { FC, useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/homepage/Header";
import { HeroSection } from "@/components/homepage/HeroSection";
import { FeaturesCarousel } from "@/components/homepage/FeaturesCarousel";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import ButtonCustom from "@/components/ui/button-custom";

const faqs = [
  { question: "How can I register for an account?", answer: "Simply click the 'Register' button, fill in your details, and verify your email to get started!" },
  { question: "How do I submit my application?", answer: "Log in, go to the dashboard, select 'Apply,' and follow the step-by-step process." },
  { question: "Can I track my application status?", answer: "Yes! Check your application status anytime through the 'Application History' section." },
  { question: "How do I contact an inspector?", answer: "Use the built-in chat feature to communicate directly with inspectors assigned to your case." },
  { question: "What if I forget my password?", answer: "Click 'Forgot Password' on the login page and follow the reset instructions." },
];

const LoginChoice: FC = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <section id="home">
          <HeroSection />
          <FeaturesCarousel />
        </section>

        {/* FAQs Section */}
        <section id="faqs" className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="max-w-2xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b pb-4">
                <button
                  className="w-full flex justify-between items-center text-lg font-medium text-left"
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                >
                  {faq.question}
                  <ChevronDown className={`transition-transform ${openFAQ === index ? "rotate-180" : ""}`} />
                </button>
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={openFAQ === index ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
                  className="overflow-hidden mt-2 text-gray-600"
                >
                  {faq.answer}
                </motion.div>
              </div>
            ))}
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="mt-16">
          <motion.div 
            initial={{ opacity: 0, x: -50 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.6 }}
            className="bg-gray-100 p-8 rounded-lg shadow-md max-w-3xl mx-auto"
          >
            <h2 className="text-3xl font-bold text-center mb-4">About Our System</h2>
            <p className="text-gray-700 text-center mb-6">
              Our platform is designed to streamline fire safety inspections, making it easier for establishments and inspectors to communicate efficiently.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-white rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-2">🔄 Real-time Chat</h3>
                <p className="text-gray-600">Chat instantly with inspectors and keep track of conversations.</p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-2">📄 Easy Applications</h3>
                <p className="text-gray-600">Submit and track your applications with just a few clicks.</p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-2">🔒 Secure & Reliable</h3>
                <p className="text-gray-600">We prioritize data security and reliability for all users.</p>
              </div>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
};

export default LoginChoice;

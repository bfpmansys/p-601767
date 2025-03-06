import { FC, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";

export const Header: FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isLoginPage = location.pathname === "/establishment-login" || location.pathname === "/establishment-register";

  const scrollToSection = (sectionId: string) => {
    if (location.pathname !== "/") {
      navigate("/", { replace: false });
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 300); // Delay to ensure navigation completes first
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
    setIsMenuOpen(false);
  };

  // Scroll to hash section if URL has one (like #faqs)
  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.replace("#", ""));
      if (element) {
        setTimeout(() => element.scrollIntoView({ behavior: "smooth" }), 300);
      }
    }
  }, [location]);

  return (
    <header className="flex justify-between items-center h-20 bg-white px-8 border-b border-gray-300 shadow-sm">
      <Link to="/" className="flex items-center gap-1">
        <img src="/images/logo.png" alt="Logo" className="h-12" />
        <span className="text-2xl font-bold text-red-600">V-FIRE</span>
        <span className="text-1xl font-bold text-black">INSPECT</span>
      </Link>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-8">
        <button onClick={() => scrollToSection("home")} className="text-1xl font-semibold text-black">
          HOME
        </button>
        <button onClick={() => scrollToSection("faqs")} className="text-1xl font-semibold text-black">
          FAQS
        </button>
        <button onClick={() => scrollToSection("about")} className="text-1xl font-semibold text-black">
          ABOUT
        </button>
        {!isLoginPage && (
          <Link to="/establishment-login" className="text-1xl font-semibold text-white bg-[#FE623F] px-5 py-2.5 rounded-[15px]">
            LOG IN
          </Link>
        )}
        {!isLoginPage && (
          <Link to="/admin-login" className="text-1xl font-semibold text-white bg-[#FE623F] px-5 py-2.5 rounded-[15px]">
            ADMIN LOG IN
          </Link>
        )}
      </nav>

      {/* Mobile Navigation Button */}
      <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden" aria-label="Toggle menu">
        <Menu size={24} />
      </button>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 top-[80px] bg-white z-50 md:hidden">
          <nav className="flex flex-col items-center gap-8 pt-8">
            <button onClick={() => scrollToSection("home")} className="text-1xl font-semibold text-black">
              HOME
            </button>
            <button onClick={() => scrollToSection("faqs")} className="text-1xl font-semibold text-black">
              FAQS
            </button>
            <button onClick={() => scrollToSection("about")} className="text-1xl font-semibold text-black">
              ABOUT
            </button>
            {!isLoginPage && (
              <Link to="/establishment-login" className="text-xl font-semibold text-white bg-[#FE623F] px-5 py-2.5 rounded-[15px]" onClick={() => setIsMenuOpen(false)}>
                LOG IN
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header
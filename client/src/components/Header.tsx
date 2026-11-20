import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Search, X, User, LogOut, ChevronDown } from "lucide-react";
import { useLanguage } from "../i18n/LanguageProvider";
import { Button } from "@/components/ui/button";
import NavButton from "./NavButton";
import AuthModal from "./AuthModal";
import AnimatedButton from "./AnimatedButton";
import { useAuth } from "@/contexts/AuthContext";
import { useJourney } from "@/contexts/JourneyContext";

const Header = () => {
  const { t, lang, setLang } = useLanguage();
  const [location] = useLocation();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [isScrolled, setIsScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { user, isLoggedIn, logout } = useAuth();

  // Navigation configuration
  const navConfig = [
    { key: "Home_Landing_Page.Header.nav_community", href: "/community" },
    { key: "Home_Landing_Page.Header.nav_home", href: "/" },
    { key: "Home_Landing_Page.Header.nav_knowledge", href: "/knowledge-hub" },
    { key: "Home_Landing_Page.Header.nav_sakhi", href: "/sakhi" },
    { key: "Home_Landing_Page.Header.nav_tools", href: "/tools" },
    { key: "Home_Landing_Page.Header.nav_treatments", href: "/treatments" },
    { key: "Home_Landing_Page.Header.nav_blog", href: "/blogs" },
    { key: "Home_Landing_Page.Header.nav_success", href: "/success-stories" },
    { key: "Home_Landing_Page.Header.nav_experts", href: "/experts" },
    { key: "Home_Landing_Page.Header.nav_investors", href: "/investors" },
  ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openAuth = (tab: "login" | "register") => {
    setAuthTab(tab);
    setAuthModalOpen(true);
  };

  // Listen for custom event from other components (e.g. hero Register Now button)
  useEffect(() => {
    const handler = (e: Event) => {
      const tab = (e as CustomEvent).detail as "login" | "register";
      openAuth(tab || "register");
    };
    window.addEventListener('open-auth-modal', handler);
    return () => window.removeEventListener('open-auth-modal', handler);
  }, []);

  const { journey, openSelector } = useJourney();

  const handleAuthSuccess = (isNewUser?: boolean) => {
    setAuthModalOpen(false);

    // If it's a new sign-up, show journey selector (unless on Sakhi pages)
    if (isNewUser && !journey) {
      const isSakhiPage = location.startsWith('/sakhi');
      if (!isSakhiPage) {
        // Show after a small delay to allow account created toast to be seen
        setTimeout(() => {
          openSelector();
        }, 800);
      }
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
  };

  /** Get initials / avatar character from user name */
  const getUserInitial = () => {
    if (!user) return "U";
    const name = user.name || user.email || "User";
    return name.charAt(0).toUpperCase();
  };

  return (
    <>
      {/* Top Bar - Sticky */}
      <header
        className={`site-header sticky top-0 z-[60] w-full bg-white transition-all duration-300 ${isScrolled ? "shadow-md" : ""
          }`}
      >
        <div className="container mx-auto px-3 md:px-4 h-14 md:h-16">
          <div className="flex items-center justify-between h-full relative">

            {/* Left: Language Toggle */}
            <div className="flex items-center gap-1 md:gap-4 relative z-[60]">
              {/* Language Toggle - Compact capsule on mobile, full on desktop */}
              <div className="bg-gray-50 p-px md:p-1 rounded-full border border-gray-200 shadow-sm inline-flex h-5 sm:h-6 md:h-9 items-center">
                <button
                  onClick={() => setLang('en')}
                  className={`px-1.5 sm:px-2 md:px-3 py-0.5 md:py-1.5 rounded-full text-[8px] sm:text-[9px] md:text-xs font-semibold transition-all duration-200 leading-none h-full flex items-center ${lang === 'en'
                    ? 'bg-purple-500 text-white shadow-sm'
                    : 'text-gray-700 hover:text-purple-600 font-bold'
                    }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLang('te')}
                  className={`px-1.5 sm:px-2 md:px-3 py-0.5 md:py-1.5 rounded-full text-[8px] sm:text-[9px] md:text-xs font-semibold transition-all duration-200 leading-none h-full flex items-center ${lang === 'te'
                    ? 'bg-purple-500 text-white shadow-sm'
                    : 'text-gray-700 hover:text-purple-600 font-bold'
                    }`}
                >
                  <span className="md:hidden">TE</span>
                  <span className="hidden md:inline">తెలుగు</span>
                </button>
              </div>
            </div>

            {/* Center: Logo */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center h-14 md:h-16 w-28 md:w-40 z-[55] pointer-events-none">
              <Link href="/" className="pointer-events-auto flex items-center justify-center w-full h-full relative">
                <img
                  src="/JanmaSethu Logo.svg"
                  alt="JanmaSethu"
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-36 md:h-56 w-auto max-w-none object-contain pointer-events-none"
                />
              </Link>
            </div>

            {/* Right: Auth Buttons or User Avatar */}
            <div className="flex items-center gap-1.5 md:gap-3 relative z-[60]">

              {isLoggedIn && user ? (
                /* ── Logged-in: User Avatar + Dropdown ── */
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-full border border-gray-200 hover:border-purple-300 bg-white hover:bg-purple-50 transition-all duration-200 shadow-sm"
                    aria-label="User menu"
                  >
                    {/* Avatar circle */}
                    {user.profile_picture ? (
                      <img
                        src={user.profile_picture}
                        alt={user.name}
                        className="w-6 h-6 md:w-7 md:h-7 rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-[10px] md:text-xs font-bold flex-shrink-0">
                        {getUserInitial()}
                      </div>
                    )}
                    <span className="hidden md:block text-sm font-medium text-gray-700 max-w-[100px] truncate">
                      {user.name || user.email}
                    </span>
                    <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-[70]">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs font-semibold text-gray-900 truncate">{user.name || "User"}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* ── Logged-out: Login / Sign Up ── */
                <>
                  {/* Desktop */}
                  <div className="hidden md:flex items-center gap-3">
                    <Button
                      variant="ghost"
                      className="font-semibold text-gray-700 hover:text-primary hover:bg-primary/5"
                      onClick={() => openAuth("login")}
                    >
                      Log In
                    </Button>
                  </div>

                  {/* Mobile */}
                  <div className="flex md:hidden items-center gap-0.5 sm:gap-1">
                    <button
                      className="px-1.5 sm:px-2 py-1 text-[9px] sm:text-[10px] font-semibold text-gray-600 rounded-full transition-all duration-200 hover:text-purple-600 hover:bg-purple-50 active:scale-90 active:bg-purple-100 whitespace-nowrap"
                      onClick={() => openAuth("login")}
                    >
                      Login
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Secondary Nav Bar - Non-sticky, visible for logged-in or non-home pages */}
      {(location !== "/" || isLoggedIn) && (
        <div className="hidden md:block w-full bg-white py-0.5 border-b border-gray-100/50 shadow-sm relative z-40">
          <div className="container mx-auto px-3 md:px-4">
            <nav className="w-full">
              <ul className="flex items-center justify-between w-full">
                {navConfig.map((item) => (
                  <li key={item.key} className="flex-shrink-0">
                    <Link href={item.href}>
                      <NavButton
                        label={t(item.key)}
                        isActive={location === item.href || (item.href !== "/" && location.startsWith(item.href))}
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        key={authTab}
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        defaultTab={authTab}
      />
    </>
  );
};

export default Header;

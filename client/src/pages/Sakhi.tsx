import { useLocation } from "wouter";
import { useEffect } from "react";
import SEO from "../components/SEO";

// Sakhi Web Page Components
import { HeroSection } from "@/components/sakhi-web/HeroSection";
import { ValueProposition } from "@/components/sakhi-web/ValueProposition";
import { HowItWorks } from "@/components/sakhi-web/HowItWorks";
import { SpecificWays } from "@/components/sakhi-web/SpecificWays";
import { InteractiveDemo } from "@/components/sakhi-web/InteractiveDemo";
import { WhyChooseSakhi } from "@/components/sakhi-web/WhyChooseSakhi";
import { SocialProof } from "@/components/sakhi-web/SocialProof";
import { FAQSection } from "@/components/sakhi-web/FAQSection";

const Sakhi = () => {
  const [, setLocation] = useLocation();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleTrySakhiClick = () => {
    // Ensure guest identity exists so Sakhi companion loads immediately
    if (!localStorage.getItem("userId")) {
      localStorage.setItem("userId", "guest_" + Date.now());
    }
    if (!localStorage.getItem("userName")) {
      localStorage.setItem("userName", "Friend");
    }
    setLocation("/sakhi/try");
  };

  return (
    <>
      <SEO
        title="Sakhi - Your Pregnancy Companion"
        description="Personalized support, expert guidance, and compassionate care for your fertility journey."
      />
      <div className="min-h-screen bg-white">
        <HeroSection onCtaClick={handleTrySakhiClick} />
        <ValueProposition onCtaClick={handleTrySakhiClick} />
        <HowItWorks />
        <SpecificWays />
        <InteractiveDemo onCtaClick={handleTrySakhiClick} />
        <WhyChooseSakhi onCtaClick={handleTrySakhiClick} />
        <SocialProof />
        <FAQSection onCtaClick={handleTrySakhiClick} />
      </div>
    </>
  );
};

export default Sakhi;

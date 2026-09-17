import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import ProblemSolution from "@/components/ProblemSolution";
import Features from "@/components/Features";
import Roles from "@/components/Roles";
import DashboardShowcase from "@/components/DashboardShowcase";
import MobileApp from "@/components/MobileApp";
import Security from "@/components/Security";
import Pricing from "@/components/Pricing";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="relative">
      <Navbar />
      <main id="main">
        <Hero />
        <Stats />
        <ProblemSolution />
        <Features />
        <Roles />
        <DashboardShowcase />
        <MobileApp />
        <Security />
        <Pricing />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
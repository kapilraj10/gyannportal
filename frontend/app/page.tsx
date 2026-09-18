"use client";

import { useState } from "react";
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
import AuthModal from "@/components/AuthModal";

export default function Home() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");

  function openLogin() {
    setAuthTab("login");
    setAuthOpen(true);
  }

  function openRegister() {
    setAuthTab("register");
    setAuthOpen(true);
  }

  return (
    <div className="relative">
      <AuthModal
        key={`${authOpen ? authTab : "closed"}`}
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        initialTab={authTab}
      />
      <Navbar onLogin={openLogin} onRegister={openRegister} />
      <main id="main">
        <Hero onRegister={openRegister} />
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
        <CTA onRegister={openRegister} />
      </main>
      <Footer />
    </div>
  );
}
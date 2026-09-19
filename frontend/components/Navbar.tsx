"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Solutions", href: "#solutions" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

interface NavbarProps {
  onLogin?: () => void;
  onRegister?: () => void;
}

function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label="GyannPortal home">
      <Image
        src="/logo1.png"
        alt="GyannPortal logo"
        width={96}
        height={48}
        priority
        className="h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.03]"
      />
      <span className="text-lg font-bold tracking-tight text-deep-900">
        Gyan<span className="text-primary-500">n</span>Portal
      </span>
    </Link>
  );
}

export default function Navbar({ onLogin, onRegister }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass border-b border-deep-100/70 py-2.5 shadow-[0_1px_0_rgba(15,23,42,0.02),0_8px_30px_-12px_rgba(15,23,42,0.12)]"
          : "border-b border-transparent py-4"
      }`}
    >
      <nav className="container-px flex max-w-7xl items-center justify-between">
        <Logo />

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="group relative rounded-lg px-3.5 py-2 text-sm font-medium text-deep-600 transition-colors hover:text-deep-900"
            >
              {link.label}
              <span className="absolute inset-x-3.5 -bottom-0.5 h-px origin-left scale-x-0 bg-primary-500 transition-transform duration-300 group-hover:scale-x-100" />
            </a>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 md:flex">
          <button
            onClick={onLogin}
            className="rounded-lg px-4 py-2 text-sm font-medium text-deep-700 transition-colors hover:bg-deep-100/60 hover:text-deep-900"
          >
            Login
          </button>
          <button
            onClick={onRegister}
            className="group inline-flex items-center gap-1.5 rounded-lg bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-600 hover:shadow-lg hover:shadow-primary-500/25 active:translate-y-0 active:scale-[0.98]"
          >
            Get Started
            <svg
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-deep-700 transition-colors hover:bg-deep-100/70 md:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        className={`fixed inset-x-0 top-0 z-40 origin-top bg-white/95 backdrop-blur-xl transition-all duration-300 md:hidden ${
          mobileOpen
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-3 opacity-0"
        }`}
      >
        <div className="flex flex-col px-6 pb-8 pt-24">
          <div className="flex flex-col divide-y divide-deep-100/80">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between py-4 text-lg font-medium text-deep-800 transition-colors hover:text-primary-600"
              >
                {link.label}
                <svg
                  className="h-4 w-4 text-deep-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <button
              onClick={() => {
                setMobileOpen(false);
                onLogin?.();
              }}
              className="w-full rounded-xl border border-deep-200 px-4 py-3.5 text-base font-semibold text-deep-800 transition-colors hover:bg-deep-50"
            >
              Login
            </button>
            <button
              onClick={() => {
                setMobileOpen(false);
                onRegister?.();
              }}
              className="w-full rounded-xl bg-primary-500 px-4 py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-primary-600"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
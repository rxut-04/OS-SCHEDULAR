"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, MapPin, Clock } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div
      className="min-h-screen flex justify-center items-center py-12 px-5"
      style={{
        fontFamily: "'Source Sans Pro', sans-serif",
        background: "var(--alg-primary)",
      }}
    >
      <div className="w-full max-w-[1000px] bg-white flex flex-col md:flex-row rounded-[20px] overflow-hidden shadow-2xl">
        <div
          className="flex-1 p-10 md:p-12"
          style={{ background: "var(--alg-mint)", color: "var(--alg-primary)" }}
        >
          <h2 className="text-3xl font-black mb-5">Get in Touch</h2>
          <p className="leading-relaxed text-base mb-8 text-justify">
            At <strong>AlgoLogic</strong>, we believe that the evolution of educational tools depends on continuous feedback and academic collaboration. We welcome inquiries from students, developers, and faculty members regarding pedagogical improvements.
          </p>
          <ul className="list-none p-0 m-0 space-y-5">
            <li className="flex items-center gap-4 font-semibold">
              <Mail className="h-5 w-5 shrink-0" style={{ color: "var(--alg-secondary)" }} />
              contact@algologic.edu
            </li>
            <li className="flex items-center gap-4 font-semibold">
              <MapPin className="h-5 w-5 shrink-0" style={{ color: "var(--alg-secondary)" }} />
              Computer Science Dept, University Campus
            </li>
            <li className="flex items-center gap-4 font-semibold">
              <Clock className="h-5 w-5 shrink-0" style={{ color: "var(--alg-secondary)" }} />
              Mon - Fri, 9:00 AM - 5:00 PM
            </li>
          </ul>
        </div>
        <div className="flex-[1.2] p-10 md:p-12 bg-white">
          {submitted ? (
            <div className="text-center py-8">
              <p className="text-lg font-semibold text-[var(--alg-secondary)] mb-4">
                Thank you! Your message has been sent.
              </p>
              <Link
                href="/"
                className="text-[var(--alg-primary)] font-bold text-sm no-underline block mt-5"
              >
                ← Back to Home
              </Link>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
            >
              <div className="mb-5">
                <label className="block font-bold mb-2 text-[var(--alg-primary)]">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  required
                  className="w-full py-3 px-3 border-2 border-gray-200 rounded-lg outline-none transition-colors focus:border-[var(--alg-secondary)] font-[inherit]"
                />
              </div>
              <div className="mb-5">
                <label className="block font-bold mb-2 text-[var(--alg-primary)]">Email</label>
                <input
                  type="email"
                  placeholder="email@university.edu"
                  required
                  className="w-full py-3 px-3 border-2 border-gray-200 rounded-lg outline-none transition-colors focus:border-[var(--alg-secondary)] font-[inherit]"
                />
              </div>
              <div className="mb-5">
                <label className="block font-bold mb-2 text-[var(--alg-primary)]">Subject</label>
                <input
                  type="text"
                  placeholder="Academic Inquiry / Feedback"
                  className="w-full py-3 px-3 border-2 border-gray-200 rounded-lg outline-none transition-colors focus:border-[var(--alg-secondary)] font-[inherit]"
                />
              </div>
              <div className="mb-6">
                <label className="block font-bold mb-2 text-[var(--alg-primary)]">Message</label>
                <textarea
                  rows={4}
                  placeholder="How can we assist your learning journey?"
                  className="w-full py-3 px-3 border-2 border-gray-200 rounded-lg outline-none transition-colors focus:border-[var(--alg-secondary)] font-[inherit] resize-y"
                />
              </div>
              <button
                type="submit"
                className="w-full py-4 rounded-full font-bold text-white cursor-pointer text-[17px] border-0 transition-all hover:-translate-y-0.5"
                style={{ background: "var(--alg-secondary)" }}
              >
                Send Inquiry
              </button>
              <Link
                href="/"
                className="block mt-5 text-center text-[var(--alg-primary)] font-bold text-sm no-underline"
              >
                ← Back to Home
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

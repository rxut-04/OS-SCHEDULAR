"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, MapPin, Clock, Star, Send, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { submitFeedback, FeedbackPayload } from "./actions";

const FEEDBACK_TYPES: { value: FeedbackPayload["type"]; label: string; emoji: string }[] = [
  { value: "general",    label: "General",    emoji: "💬" },
  { value: "suggestion", label: "Suggestion", emoji: "💡" },
  { value: "bug",        label: "Bug Report", emoji: "🐛" },
  { value: "academic",   label: "Academic",   emoji: "🎓" },
];

function StarRating({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const active = (hovered ?? value ?? 0) >= star;
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(null)}
            className="transition-transform hover:scale-110"
            aria-label={`Rate ${star} stars`}
          >
            <Star
              className="h-6 w-6 transition-colors"
              fill={active ? "#f59e0b" : "none"}
              stroke={active ? "#f59e0b" : "#d1d5db"}
            />
          </button>
        );
      })}
    </div>
  );
}

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    type: "general" as FeedbackPayload["type"],
    rating: null as number | null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<"success" | "error" | null>(null);
  const [serverError, setServerError] = useState("");

  const set = (field: string, value: string | number | null) =>
    setForm((f) => ({ ...f, [field]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim() || form.name.trim().length < 2)
      e.name = "Please enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email address.";
    if (!form.message.trim() || form.message.trim().length < 10)
      e.message = "Message must be at least 10 characters.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setServerError("");
    try {
      const res = await submitFeedback(form);
      if (res.success) {
        setResult("success");
      } else {
        setServerError(res.error ?? "Something went wrong.");
        setResult("error");
      }
    } catch {
      setServerError("Network error. Please try again.");
      setResult("error");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field: string) =>
    `w-full py-3 px-4 rounded-xl border-2 outline-none transition-all text-sm font-medium bg-white ${
      errors[field]
        ? "border-red-400 focus:border-red-500"
        : "border-gray-200 focus:border-[var(--alg-secondary)]"
    }`;

  return (
    <div
      className="min-h-screen flex justify-center items-center py-12 px-5"
      style={{ background: "var(--alg-primary)", fontFamily: "'Source Sans Pro', sans-serif" }}
    >
      <div className="w-full max-w-[1060px] flex flex-col md:flex-row rounded-3xl overflow-hidden shadow-2xl">

        {/* ── Left panel ── */}
        <div
          className="flex-1 p-10 md:p-12 flex flex-col justify-between"
          style={{ background: "var(--alg-mint)", color: "var(--alg-primary)" }}
        >
          <div>
            <h2 className="text-3xl font-black mb-2">Get in Touch</h2>
            <p className="text-sm leading-relaxed mb-8 text-neutral-600">
              At <strong>AlgoLogic</strong>, we grow through your feedback. Share ideas,
              report issues, or reach out for academic collaboration — every message is read.
            </p>

            <ul className="space-y-5 mb-10">
              {[
                { icon: <Mail className="h-5 w-5" />, text: "contact@algologic.edu" },
                { icon: <MapPin className="h-5 w-5" />, text: "CS Dept, University Campus" },
                { icon: <Clock className="h-5 w-5" />, text: "Mon – Fri · 9 AM – 5 PM" },
              ].map(({ icon, text }) => (
                <li key={text} className="flex items-center gap-4 font-semibold text-sm">
                  <span style={{ color: "var(--alg-secondary)" }}>{icon}</span>
                  {text}
                </li>
              ))}
            </ul>

            {/* Feedback type legend */}
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-3">
                Feedback Categories
              </p>
              {FEEDBACK_TYPES.map(({ value, label, emoji }) => (
                <div key={value} className="flex items-center gap-2 text-sm font-medium">
                  <span>{emoji}</span>
                  <span className="text-neutral-700">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/"
            className="mt-10 flex items-center gap-2 text-sm font-bold no-underline self-start"
            style={{ color: "var(--alg-primary)" }}
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </div>

        {/* ── Right panel: form ── */}
        <div className="flex-[1.3] p-10 md:p-12 bg-white" style={{ color: "var(--alg-text)" }}>
          <AnimatePresence mode="wait">
            {result === "success" ? (
              /* ── Success state ── */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center h-full text-center py-12 gap-5"
              >
                <div className="w-20 h-20 rounded-full bg-green-50 border-2 border-green-300 flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-green-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-black mb-2" style={{ color: "var(--alg-text)" }}>
                    Feedback Received! 🎉
                  </h3>
                  <p className="text-neutral-500 text-sm max-w-xs mx-auto">
                    Thank you, <strong>{form.name.split(" ")[0]}</strong>! We&apos;ve saved your
                    message and will follow up at <strong>{form.email}</strong> if needed.
                  </p>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => { setResult(null); setForm({ name: "", email: "", subject: "", message: "", type: "general", rating: null }); }}
                    className="px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:-translate-y-0.5"
                    style={{ background: "var(--alg-secondary)" }}
                  >
                    Submit Another
                  </button>
                  <Link
                    href="/"
                    className="px-6 py-2.5 rounded-xl font-bold text-sm border-2 no-underline transition-all hover:-translate-y-0.5"
                    style={{ borderColor: "var(--alg-primary)", color: "var(--alg-primary)" }}
                  >
                    ← Home
                  </Link>
                </div>
              </motion.div>
            ) : (
              /* ── Form ── */
              <motion.form
                key="form"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSubmit}
                noValidate
              >
                <h3 className="text-2xl font-black mb-1" style={{ color: "var(--alg-text)" }}>
                  Share Feedback
                </h3>
                <p className="text-xs text-neutral-400 mb-7">All fields marked * are required.</p>

                {/* Error banner */}
                {result === "error" && serverError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-5">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {serverError}
                  </div>
                )}

                {/* Feedback type tabs */}
                <div className="mb-6">
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--alg-primary)" }}>
                    Type
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {FEEDBACK_TYPES.map(({ value, label, emoji }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => set("type", value)}
                        className={`px-4 py-2 rounded-xl border-2 text-xs font-bold transition-all ${
                          form.type === value
                            ? "border-[var(--alg-secondary)] bg-[var(--alg-mint)] text-[var(--alg-primary)]"
                            : "border-gray-200 text-neutral-500 hover:border-gray-300"
                        }`}
                      >
                        {emoji} {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name + Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--alg-primary)" }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => { set("name", e.target.value); if (errors.name) setErrors(p => ({ ...p, name: "" })); }}
                      placeholder="Your name"
                      className={inputClass("name")}
                      required
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--alg-primary)" }}>
                      Email *
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => { set("email", e.target.value); if (errors.email) setErrors(p => ({ ...p, email: "" })); }}
                      placeholder="you@university.edu"
                      className={inputClass("email")}
                      required
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                </div>

                {/* Subject */}
                <div className="mb-4">
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--alg-primary)" }}>
                    Subject
                  </label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={e => set("subject", e.target.value)}
                    placeholder="Brief topic (optional)"
                    className={inputClass("subject")}
                  />
                </div>

                {/* Message */}
                <div className="mb-5">
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--alg-primary)" }}>
                    Message *
                  </label>
                  <textarea
                    rows={4}
                    value={form.message}
                    onChange={e => { set("message", e.target.value); if (errors.message) setErrors(p => ({ ...p, message: "" })); }}
                    placeholder="Describe your feedback, question, or suggestion in detail…"
                    className={`${inputClass("message")} resize-y`}
                    required
                  />
                  <div className="flex justify-between mt-1">
                    {errors.message
                      ? <p className="text-red-500 text-xs">{errors.message}</p>
                      : <span />}
                    <span className={`text-xs ${form.message.length > 500 ? "text-orange-500" : "text-neutral-400"}`}>
                      {form.message.length}/500
                    </span>
                  </div>
                </div>

                {/* Rating */}
                <div className="mb-7">
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--alg-primary)" }}>
                    Rate AlgoLogic (optional)
                  </label>
                  <StarRating value={form.rating} onChange={v => set("rating", v)} />
                  {form.rating && (
                    <p className="text-xs text-neutral-400 mt-1">
                      {["", "Poor", "Fair", "Good", "Very Good", "Excellent!"][form.rating]}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-2xl font-bold text-white text-base flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
                  style={{ background: "var(--alg-secondary)" }}
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Send Feedback
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}

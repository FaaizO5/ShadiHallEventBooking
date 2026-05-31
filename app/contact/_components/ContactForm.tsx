"use client";

import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import Button from "@/app/_components/Button";

const inputCls =
  "mt-1.5 block w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-base " +
  "text-charcoal outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30 " +
  "placeholder:text-charcoal-soft/50";

export default function ContactForm() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="rounded-2xl border border-gold/20 bg-white p-8 text-center shadow-[var(--shadow-soft)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-available-bg text-available">
          <CheckCircle2 className="h-7 w-7" aria-hidden />
        </div>
        <h3 className="mt-4 font-serif text-2xl text-bordeaux">Message Sent</h3>
        <p className="mt-2 text-sm text-charcoal-soft">
          Thank you for reaching out — our team will be in touch shortly.
        </p>
        <Button variant="secondary" className="mt-6" onClick={() => setSent(false)}>
          Send another
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
      className="rounded-2xl border border-gold/20 bg-white p-7 shadow-[var(--shadow-soft)]"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-charcoal">
          Name
          <input type="text" required placeholder="Your name" className={inputCls} />
        </label>
        <label className="block text-sm font-medium text-charcoal">
          Email
          <input type="email" required placeholder="you@example.com" className={inputCls} />
        </label>
      </div>
      <label className="mt-4 block text-sm font-medium text-charcoal">
        Event date <span className="text-charcoal-soft">(optional)</span>
        <input type="date" className={inputCls} />
      </label>
      <label className="mt-4 block text-sm font-medium text-charcoal">
        Message
        <textarea
          required
          rows={5}
          placeholder="Tell us about your celebration…"
          className={`${inputCls} resize-none`}
        />
      </label>
      <Button type="submit" size="lg" className="mt-6 w-full">
        <Send className="h-4 w-4" aria-hidden />
        Send Message
      </Button>
    </form>
  );
}

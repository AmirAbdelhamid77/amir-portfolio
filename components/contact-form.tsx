"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Loader2, Mail, Send } from "lucide-react";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

type Status = "idle" | "sending" | "sent" | "mailto" | "error";

type Errors = Partial<Record<"name" | "email" | "message", string>>;

const SUBJECTS = [
  "Full-time role",
  "Dashboard / BI project",
  "Analysis project",
  "Training or exam prep",
  "Something else",
];

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [copied, setCopied] = useState(false);
  const subjectRef = useRef<HTMLSelectElement>(null);

  // Service pages link here with ?service=..., which pre-selects the matching
  // subject. The select stays uncontrolled, so this writes to the DOM directly
  // instead of mirroring the value in React state (and it cannot flash during
  // hydration).
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("service");
    const map: Record<string, string> = {
      "bi-dashboards": SUBJECTS[1],
      analysis: SUBJECTS[2],
      training: SUBJECTS[3],
    };
    if (requested && map[requested] && subjectRef.current) {
      subjectRef.current.value = map[requested];
    }
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const subject = String(data.get("subject") ?? SUBJECTS[0]);
    const message = String(data.get("message") ?? "").trim();
    const honeypot = String(data.get("company") ?? "").trim();

    const nextErrors: Errors = {};
    if (name.length < 2) nextErrors.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))
      nextErrors.email = "Please enter a valid email address.";
    if (message.length < 10)
      nextErrors.message = "A sentence or two is enough — at least 10 characters.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      // Move focus to the first field that needs attention so the error is not
      // only announced visually.
      const firstInvalid = (["name", "email", "message"] as const).find(
        (key) => nextErrors[key],
      );
      if (firstInvalid) {
        const field = form.elements.namedItem(firstInvalid);
        if (field instanceof HTMLElement) field.focus();
      }
      return;
    }

    // Honeypot: real people leave this empty.
    if (honeypot) {
      setStatus("sent");
      return;
    }

    if (SITE.contactEndpoint) {
      setStatus("sending");
      try {
        const response = await fetch(SITE.contactEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ name, email, subject, message }),
        });
        if (!response.ok) throw new Error("Request failed");
        setStatus("sent");
        form.reset();
      } catch {
        setStatus("error");
      }
      return;
    }

    const mailSubject = encodeURIComponent(`[Portfolio] ${subject} — ${name}`);
    const mailBody = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nTopic: ${subject}\n\n${message}`,
    );
    window.location.href = `mailto:${SITE.email}?subject=${mailSubject}&body=${mailBody}`;
    setStatus("mailto");
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(SITE.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  const fieldClass =
    "mt-1.5 w-full rounded-xl border border-border-strong bg-background px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary";

  return (
    <div className="rounded-3xl border border-border bg-card/50 p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-medium tracking-tight">Send a message</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {SITE.contactEndpoint
              ? "Delivered through a form endpoint — no account needed."
              : "This opens your email app with the message pre-filled. Nothing is silently discarded."}
          </p>
        </div>
        <button
          type="button"
          onClick={copyEmail}
          className="press inline-flex h-9 items-center gap-1.5 rounded-full border border-border px-3 text-xs text-muted-foreground hover:text-foreground"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-success" aria-hidden="true" />
          ) : (
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          {copied ? "Copied" : "Copy email"}
        </button>
      </div>

      <form onSubmit={onSubmit} className="mt-6 grid gap-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="contact-name" className="text-xs font-medium">
              Name
            </label>
            <input
              id="contact-name"
              name="name"
              type="text"
              autoComplete="name"
              required
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "contact-name-error" : undefined}
              placeholder="Your name"
              className={cn(fieldClass, errors.name && "border-destructive")}
            />
            {errors.name ? (
              <p id="contact-name-error" className="mt-1 text-[11px] text-destructive">
                {errors.name}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="contact-email" className="text-xs font-medium">
              Email
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "contact-email-error" : undefined}
              placeholder="you@company.com"
              className={cn(fieldClass, errors.email && "border-destructive")}
            />
            {errors.email ? (
              <p id="contact-email-error" className="mt-1 text-[11px] text-destructive">
                {errors.email}
              </p>
            ) : null}
          </div>
        </div>

        <div>
          <label htmlFor="contact-subject" className="text-xs font-medium">
            What is this about?
          </label>
          <select
            ref={subjectRef}
            id="contact-subject"
            name="subject"
            className={fieldClass}
            defaultValue={SUBJECTS[0]}
          >
            {SUBJECTS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="contact-message" className="text-xs font-medium">
            Message
          </label>
          <textarea
            id="contact-message"
            name="message"
            rows={5}
            required
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? "contact-message-error" : undefined}
            placeholder="A sentence about the role or project, the timeline, and what a good outcome looks like."
            className={cn(fieldClass, "resize-y", errors.message && "border-destructive")}
          />
          {errors.message ? (
            <p id="contact-message-error" className="mt-1 text-[11px] text-destructive">
              {errors.message}
            </p>
          ) : null}
        </div>

        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label htmlFor="contact-company">Company</label>
          <input id="contact-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={status === "sending"}
            className="press inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {status === "sending" ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="h-4 w-4" aria-hidden="true" />
            )}
            {status === "sending" ? "Sending…" : "Send message"}
          </button>
          <p className="text-[11px] leading-5 text-muted-foreground">
            Your details are used only to reply. No newsletter, no list.
          </p>
        </div>

        <div aria-live="polite" className="text-xs">
          {status === "sent" ? (
            <p className="flex items-center gap-2 rounded-xl border border-success/30 bg-success/5 p-3 text-success">
              <Check className="h-4 w-4" aria-hidden="true" />
              Message sent. I usually reply within one working day.
            </p>
          ) : null}
          {status === "mailto" ? (
            <p className="flex items-start gap-2 rounded-xl border border-border bg-background/60 p-3 text-muted-foreground">
              <Mail className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              Your email app should open with the message ready. If it did not, email{" "}
              <a href={`mailto:${SITE.email}`} className="text-foreground underline underline-offset-4">
                {SITE.email}
              </a>
              directly.
            </p>
          ) : null}
          {status === "error" ? (
            <p className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-destructive">
              <Mail className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              The form could not send. Please email{" "}
              <a href={`mailto:${SITE.email}`} className="underline underline-offset-4">
                {SITE.email}
              </a>{" "}
              instead.
            </p>
          ) : null}
        </div>
      </form>
    </div>
  );
}

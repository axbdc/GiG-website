import { useEffect, useState, FormEvent } from "react";
import { supabase } from "./lib/supabase";

type Language = "en" | "pt";

const CLOSED_WEEKDAY = 3; // quarta-feira

const copy = {
  en: {
    title: "Reserve a Table",
    closeLabel: "Close",
    nameLabel: "Name",
    namePlaceholder: "Your name",
    emailLabel: "Email",
    emailPlaceholder: "your@email.com",
    phoneLabel: "Phone",
    phonePlaceholder: "+351 999 999 999",
    dateLabel: "Date",
    timeLabel: "Time",
    guestsLabel: "Guests",
    guestsPlaceholder: "Number of guests",
    messageLabel: "Message (optional)",
    messagePlaceholder: "Any special request or occasion?",
    submitButton: "Request Reservation",
    submitting: "Sending...",
    successTitle: "Reservation Confirmed!",
    successMessage: "A confirmation has been sent to your email. See you soon at GiG!",
    closeSuccess: "Got it",
    required: "*",
    submitNote: "We will confirm your reservation instantly by email.",
    errorClosed: "Sorry, the café is closed on Wednesdays.",
    errorClosedDate: "Sorry, the café is closed on this date.",
    errorHours: "Please choose a time between 10:00 and 14:30.",
    errorCapacity: "Sorry, there are not enough spots for your group at this time. Please try another time.",
    errorGeneral: "Something went wrong. Please try again.",
    errorName: "Please enter a valid name.",
    errorPhone: "Please enter a valid phone number (at least 9 digits).",
    persons: "people",
    person: "person",
    timeOptions: [
      "10:00", "10:30", "11:00", "11:30", "12:00",
      "12:30", "13:00", "13:30", "14:00", "14:30"
    ],
    selectTime: "Select a time",
  },
  pt: {
    title: "Reservar Mesa",
    closeLabel: "Fechar",
    nameLabel: "Nome",
    namePlaceholder: "O teu nome",
    emailLabel: "Email",
    emailPlaceholder: "o-teu@email.com",
    phoneLabel: "Telefone",
    phonePlaceholder: "+351 999 999 999",
    dateLabel: "Data",
    timeLabel: "Hora",
    guestsLabel: "Pessoas",
    guestsPlaceholder: "Número de pessoas",
    messageLabel: "Mensagem (opcional)",
    messagePlaceholder: "Algum pedido especial ou ocasião?",
    submitButton: "Pedir Reserva",
    submitting: "A enviar...",
    successTitle: "Reserva Confirmada!",
    successMessage: "Enviámos uma confirmação para o teu email. Até breve no GiG!",
    closeSuccess: "Perfeito",
    required: "*",
    submitNote: "Vamos confirmar a tua reserva instantaneamente por email.",
    errorClosed: "Desculpa, o café está fechado às quartas-feiras.",
    errorClosedDate: "Desculpa, o café está fechado nesta data.",
    errorHours: "Por favor escolhe um horário entre as 10:00 e as 14:30.",
    errorCapacity: "Desculpa, não há lugares suficientes para o teu grupo neste horário. Tenta outro horário.",
    errorGeneral: "Algo correu mal. Tenta novamente.",
    errorName: "Por favor insere um nome válido.",
    errorPhone: "Por favor insere um número de telefone válido (mínimo 9 dígitos).",
    persons: "pessoas",
    person: "pessoa",
    timeOptions: [
      "10:00", "10:30", "11:00", "11:30", "12:00",
      "12:30", "13:00", "13:30", "14:00", "14:30"
    ],
    selectTime: "Seleciona uma hora",
  },
};

function getMinDate() {
  const today = new Date();
  return today.toISOString().split("T")[0];
}

function getMaxDate() {
  const d = new Date();
  d.setMonth(d.getMonth() + 3);
  return d.toISOString().split("T")[0];
}

function isWeekdayClosed(dateStr: string) {
  if (!dateStr) return false;
  const d = new Date(dateStr + "T12:00:00");
  return d.getDay() === CLOSED_WEEKDAY;
}

function isValidName(name: string) {
  return name.trim().length >= 2 && /[a-zA-ZÀ-ÿ]/.test(name);
}

function isValidPhone(phone: string) {
  if (!phone) return true; // telefone é opcional
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 9;
}

export function ReservationOverlay({
  isOpen,
  onClose,
  lang,
}: {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}) {
  const t = copy[lang];
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    guests: "",
    message: "",
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setSubmitted(false);
      setError(null);
      setFormData({ name: "", email: "", phone: "", date: "", time: "", guests: "", message: "" });
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validação do nome
    if (!isValidName(formData.name)) {
      setError(t.errorName);
      return;
    }

    // Validação do telefone
    if (!isValidPhone(formData.phone)) {
      setError(t.errorPhone);
      return;
    }

    // Validação: quarta-feira
    if (isWeekdayClosed(formData.date)) {
      setError(t.errorClosed);
      return;
    }

    setLoading(true);

    try {
      // Verificar disponibilidade
      const { data: availability, error: availError } = await supabase.rpc("check_availability", {
        p_date: formData.date,
        p_time: formData.time,
        p_guests: parseInt(formData.guests),
      });

      if (availError) throw availError;

      if (!availability.available) {
        if (availability.reason === "closed_weekday") setError(t.errorClosed);
        else if (availability.reason === "closed_date") setError(t.errorClosedDate);
        else if (availability.reason === "outside_hours") setError(t.errorHours);
        else if (availability.reason === "no_capacity") setError(t.errorCapacity);
        else setError(t.errorGeneral);
        setLoading(false);
        return;
      }

      // Guardar reserva
      const { error: insertError } = await supabase.from("reservations").insert({
        name: formData.name.trim(),
        email: formData.email,
        phone: formData.phone || null,
        date: formData.date,
        time: formData.time,
        guests: parseInt(formData.guests),
        message: formData.message || null,
        status: "confirmed",
      });

      if (insertError) throw insertError;

      // Enviar email de confirmação
      await supabase.functions.invoke("send-confirmation", {
        body: {
          name: formData.name.trim(),
          email: formData.email,
          date: formData.date,
          time: formData.time,
          guests: formData.guests,
          lang,
        },
      });

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError(t.errorGeneral);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-[#18352a]/18 bg-white/60 px-4 py-3.5 text-sm text-[#18352a] placeholder:text-[#18352a]/35 outline-none transition focus:border-[#6f8f72] focus:ring-1 focus:ring-[#6f8f72]/40 font-sans";

  const labelClass = "mb-1.5 block text-xs font-bold uppercase tracking-[0.18em] text-[#6f8f72]";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={t.title}
    >
      <div className="absolute inset-0 bg-[#18352a]/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-[#f7f0e3] shadow-2xl reservation-panel">
        {submitted ? (
          <div className="flex flex-col items-center gap-4 px-8 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#6f8f72] text-[#fff8ea]">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-serif text-2xl tracking-[-0.04em] text-[#18352a]">{t.successTitle}</h3>
            <p className="max-w-xs text-[#405a4d]">{t.successMessage}</p>
            <button
              onClick={onClose}
              className="mt-2 rounded-full bg-[#18352a] px-8 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#fff8ea] transition hover:bg-[#6f8f72]"
            >
              {t.closeSuccess}
            </button>
          </div>
        ) : (
          <>
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#18352a]/12 bg-[#f7f0e3] px-6 py-4">
              <h2 className="font-serif text-2xl tracking-[-0.04em] text-[#18352a]">{t.title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 text-[#18352a]/60 transition hover:bg-[#18352a]/10 hover:text-[#18352a]"
                aria-label={t.closeLabel}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 px-6 pb-10 pt-6">
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Nome */}
              <div>
                <label className={labelClass}>
                  {t.nameLabel} <span className="text-red-400">{t.required}</span>
                </label>
                <input
                  type="text"
                  required
                  minLength={2}
                  className={inputClass}
                  placeholder={t.namePlaceholder}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {/* Email */}
              <div>
                <label className={labelClass}>
                  {t.emailLabel} <span className="text-red-400">{t.required}</span>
                </label>
                <input
                  type="email"
                  required
                  className={inputClass}
                  placeholder={t.emailPlaceholder}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              {/* Telefone */}
              <div>
                <label className={labelClass}>{t.phoneLabel}</label>
                <input
                  type="tel"
                  className={inputClass}
                  placeholder={t.phonePlaceholder}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              {/* Data + Hora */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>
                    {t.dateLabel} <span className="text-red-400">{t.required}</span>
                  </label>
                  <input
                    type="date"
                    required
                    min={getMinDate()}
                    max={getMaxDate()}
                    className={`${inputClass} ${isWeekdayClosed(formData.date) ? "border-red-300 bg-red-50" : ""}`}
                    value={formData.date}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({ ...formData, date: val });
                      if (isWeekdayClosed(val)) setError(t.errorClosed);
                      else setError(null);
                    }}
                  />
                  {isWeekdayClosed(formData.date) && (
                    <p className="mt-1 text-xs text-red-500">{t.errorClosed}</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>
                    {t.timeLabel} <span className="text-red-400">{t.required}</span>
                  </label>
                  <select
                    required
                    className={`${inputClass} appearance-none cursor-pointer`}
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  >
                    <option value="">{t.selectTime}</option>
                    {t.timeOptions.map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pessoas */}
              <div>
                <label className={labelClass}>
                  {t.guestsLabel} <span className="text-red-400">{t.required}</span>
                </label>
                <select
                  required
                  className={`${inputClass} appearance-none cursor-pointer`}
                  value={formData.guests}
                  onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                >
                  <option value="">{t.guestsPlaceholder}</option>
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? t.person : t.persons}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mensagem */}
              <div>
                <label className={labelClass}>{t.messageLabel}</label>
                <textarea
                  rows={3}
                  className={inputClass}
                  placeholder={t.messagePlaceholder}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={loading || isWeekdayClosed(formData.date)}
                className="w-full rounded-full bg-[#18352a] py-4 text-sm font-bold uppercase tracking-[0.16em] text-[#fff8ea] transition hover:bg-[#6f8f72] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t.submitting : t.submitButton}
              </button>
              <p className="text-center text-xs text-[#18352a]/40">{t.submitNote}</p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
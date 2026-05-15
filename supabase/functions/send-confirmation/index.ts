// supabase/functions/send-confirmation/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const ADMIN_EMAIL = "alexandrexbdcosme@gmail.com";

const DAYS_PT = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
const DAYS_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS_PT = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function formatDatePT(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return `${DAYS_PT[d.getDay()]}, ${d.getDate()} de ${MONTHS_PT[d.getMonth()]} de ${d.getFullYear()}`;
}

function formatDateEN(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return `${DAYS_EN[d.getDay()]}, ${MONTHS_EN[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function formatTime(timeStr: string) {
  return timeStr.substring(0, 5);
}

function emailTemplateCustomer(name: string, date: string, time: string, guests: string, lang: string) {
  const isPT = lang === "pt";
  const dateFormatted = isPT ? formatDatePT(date) : formatDateEN(date);
  const timeFormatted = formatTime(time);

  const subject = isPT
    ? `✅ Reserva confirmada no GiG - ${dateFormatted}`
    : `✅ Reservation confirmed at GiG - ${dateFormatted}`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f7f0e3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <div style="background:#18352a;border-radius:24px;padding:40px;text-align:center;margin-bottom:24px;">
      <h1 style="color:#fff8ea;font-size:32px;margin:0;letter-spacing:-0.04em;">GiG</h1>
      <p style="color:#6f8f72;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;margin:8px 0 0;">Green is Good</p>
    </div>
    
    <div style="background:white;border-radius:24px;padding:36px;margin-bottom:16px;">
      <div style="text-align:center;margin-bottom:28px;">
        <div style="width:56px;height:56px;background:#6f8f72;border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
          <span style="color:white;font-size:24px;">✓</span>
        </div>
        <h2 style="color:#18352a;font-size:24px;margin:0;letter-spacing:-0.03em;">
          ${isPT ? `Olá ${name}!` : `Hello ${name}!`}
        </h2>
        <p style="color:#405a4d;margin:12px 0 0;line-height:1.6;">
          ${isPT
            ? "A tua reserva no GiG foi confirmada. Até breve!"
            : "Your reservation at GiG is confirmed. See you soon!"}
        </p>
      </div>
      
      <div style="background:#f7f0e3;border-radius:16px;padding:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;color:#6f8f72;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;">
              ${isPT ? "DATA" : "DATE"}
            </td>
            <td style="padding:8px 0;color:#18352a;font-weight:600;text-align:right;">${dateFormatted}</td>
          </tr>
          <tr style="border-top:1px solid rgba(24,53,42,0.08);">
            <td style="padding:8px 0;color:#6f8f72;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;">
              ${isPT ? "HORA" : "TIME"}
            </td>
            <td style="padding:8px 0;color:#18352a;font-weight:600;text-align:right;">${timeFormatted}</td>
          </tr>
          <tr style="border-top:1px solid rgba(24,53,42,0.08);">
            <td style="padding:8px 0;color:#6f8f72;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;">
              ${isPT ? "PESSOAS" : "GUESTS"}
            </td>
            <td style="padding:8px 0;color:#18352a;font-weight:600;text-align:right;">${guests}</td>
          </tr>
          <tr style="border-top:1px solid rgba(24,53,42,0.08);">
            <td style="padding:8px 0;color:#6f8f72;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;">
              ${isPT ? "LOCAL" : "PLACE"}
            </td>
            <td style="padding:8px 0;color:#18352a;font-weight:600;text-align:right;">GiG - Ericeira</td>
          </tr>
        </table>
      </div>
      
      <p style="color:#405a4d;font-size:13px;line-height:1.6;margin:20px 0 0;text-align:center;">
        ${isPT
          ? "Se precisares de cancelar ou alterar a reserva, responde a este email ou contacta-nos no Instagram <strong>@gigericeira</strong>."
          : "If you need to cancel or change your reservation, reply to this email or contact us on Instagram <strong>@gigericeira</strong>."}
      </p>
    </div>
    
    <p style="text-align:center;color:#405a4d;font-size:12px;margin:0;">
      GiG - Green is Good · Ericeira, Portugal
    </p>
  </div>
</body>
</html>`;

  return { subject, html };
}

function emailTemplateAdmin(name: string, email: string, phone: string, date: string, time: string, guests: string, message: string) {
  const dateFormatted = formatDatePT(date);
  const timeFormatted = formatTime(time);

  return {
    subject: `🟢 Nova reserva GiG — ${name} · ${dateFormatted} ${timeFormatted}`,
    html: `
<!DOCTYPE html>
<html>
<body style="font-family:-apple-system,sans-serif;background:#f0ede6;padding:20px;">
  <div style="max-width:500px;margin:0 auto;background:white;border-radius:16px;padding:28px;">
    <h2 style="color:#18352a;margin:0 0 20px;font-size:20px;">Nova reserva recebida</h2>
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:6px 0;color:#6f8f72;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;width:100px;">Nome</td><td style="padding:6px 0;color:#18352a;font-weight:600;">${name}</td></tr>
      <tr style="border-top:1px solid #f0ede6;"><td style="padding:6px 0;color:#6f8f72;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;">Email</td><td style="padding:6px 0;color:#18352a;">${email}</td></tr>
      <tr style="border-top:1px solid #f0ede6;"><td style="padding:6px 0;color:#6f8f72;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;">Telefone</td><td style="padding:6px 0;color:#18352a;">${phone || "—"}</td></tr>
      <tr style="border-top:1px solid #f0ede6;"><td style="padding:6px 0;color:#6f8f72;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;">Data</td><td style="padding:6px 0;color:#18352a;font-weight:600;">${dateFormatted}</td></tr>
      <tr style="border-top:1px solid #f0ede6;"><td style="padding:6px 0;color:#6f8f72;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;">Hora</td><td style="padding:6px 0;color:#18352a;font-weight:600;">${timeFormatted}</td></tr>
      <tr style="border-top:1px solid #f0ede6;"><td style="padding:6px 0;color:#6f8f72;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;">Pessoas</td><td style="padding:6px 0;color:#18352a;font-weight:600;">${guests}</td></tr>
      ${message ? `<tr style="border-top:1px solid #f0ede6;"><td style="padding:6px 0;color:#6f8f72;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;">Nota</td><td style="padding:6px 0;color:#18352a;">${message}</td></tr>` : ""}
    </table>
  </div>
</body>
</html>`,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" } });
  }

  try {
    const { name, email, phone, date, time, guests, message, lang } = await req.json();

    const customerEmail = emailTemplateCustomer(name, date, time, guests, lang || "pt");
    const adminEmail = emailTemplateAdmin(name, email, phone, date, time, guests, message);

    // Enviar email ao cliente
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "GiG Ericeira <onboarding@resend.dev>",
        to: [email],
        subject: customerEmail.subject,
        html: customerEmail.html,
      }),
    });

    // Notificar admin
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "GiG Reservas <onboarding@resend.dev>",
        to: [ADMIN_EMAIL],
        subject: adminEmail.subject,
        html: adminEmail.html,
      }),
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});

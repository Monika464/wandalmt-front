// np. src/api/sendEmail.ts
export async function sendEmail(to: string, subject: string, text: string) {
  const res = await fetch("/api/send-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to, subject, text }),
  });

  if (!res.ok) {
    throw new Error("Failed to send email");
  }

  return res.json();
}

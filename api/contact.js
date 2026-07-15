const json = (response, status, body) => {
  response.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.end(JSON.stringify(body));
};

const clean = (value, max = 2000) => String(value ?? '').replace(/[<>]/g, '').trim().slice(0, max);

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return json(response, 405, { error: 'Method not allowed' });
  }

  const { RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL } = process.env;
  if (!RESEND_API_KEY || !CONTACT_TO_EMAIL || !CONTACT_FROM_EMAIL) {
    return json(response, 503, { error: 'Email delivery is not configured' });
  }

  let body = request.body || {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body || '{}'); }
    catch { return json(response, 400, { error: 'Invalid JSON' }); }
  }
  if (body.company) return json(response, 200, { ok: true });

  const name = clean(body.name, 120);
  const email = clean(body.email, 200);
  const organisation = clean(body.organisation, 160);
  const interest = clean(body.interest, 120);
  const message = clean(body.message, 4000);
  const lang = clean(body.lang, 4) || 'de';

  if (!name || !email || !message || !/^\S+@\S+\.\S+$/.test(email)) {
    return json(response, 400, { error: 'Invalid form data' });
  }

  const subject = `WAO Website enquiry – ${interest || 'General'} – ${name}`;
  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Organisation: ${organisation || '—'}`,
    `Interest: ${interest || '—'}`,
    `Language: ${lang}`,
    '',
    message
  ].join('\n');

  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: CONTACT_FROM_EMAIL,
      to: [CONTACT_TO_EMAIL],
      reply_to: email,
      subject,
      text
    })
  });

  if (!resendResponse.ok) {
    const details = await resendResponse.text();
    console.error('Resend error:', details);
    return json(response, 502, { error: 'Email provider error' });
  }

  return json(response, 200, { ok: true });
}

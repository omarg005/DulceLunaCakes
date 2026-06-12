module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

    const { 'contact-name': name, 'contact-email': email, 'contact-subject': subject, 'contact-message': message, 'contact-phone': phone, 'preferred-contact': preferredContact } = req.body || {};

    if (!name || !email || !message) {
        return res.status(400).json({ success: false, error: 'Name, email, and message are required.' });
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const TO_EMAIL = process.env.CONTACT_EMAIL || 'nomi@dulcelunacakes.com'; // override in Vercel env vars if needed

    if (!RESEND_API_KEY) {
        return res.status(500).json({ success: false, error: 'RESEND_API_KEY environment variable is not set.' });
    }

    const subjectLine = subject ? `[Dulce Luna Cakes] ${subject} — from ${name}` : `[Dulce Luna Cakes] New message from ${name}`;

    const html = `
        <h2>New Contact Form Submission</h2>
        <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse;">
            <tr><td style="padding:6px 12px;font-weight:bold;">Name</td><td style="padding:6px 12px;">${name}</td></tr>
            <tr><td style="padding:6px 12px;font-weight:bold;">Email</td><td style="padding:6px 12px;"><a href="mailto:${email}">${email}</a></td></tr>
            ${phone ? `<tr><td style="padding:6px 12px;font-weight:bold;">Phone</td><td style="padding:6px 12px;">${phone}</td></tr>` : ''}
            ${subject ? `<tr><td style="padding:6px 12px;font-weight:bold;">Subject</td><td style="padding:6px 12px;">${subject}</td></tr>` : ''}
            ${preferredContact ? `<tr><td style="padding:6px 12px;font-weight:bold;">Preferred Contact</td><td style="padding:6px 12px;">${preferredContact}</td></tr>` : ''}
        </table>
        <h3 style="margin-top:24px;">Message</h3>
        <p style="font-family:sans-serif;font-size:14px;white-space:pre-wrap;">${message}</p>
    `;

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'Dulce Luna Cakes <onboarding@resend.dev>',
                to: [TO_EMAIL],
                reply_to: email,
                subject: subjectLine,
                html
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Resend error:', data);
            return res.status(500).json({ success: false, error: `Resend: ${data.message || data.name || JSON.stringify(data)}` });
        }

        res.json({ success: true });
    } catch (err) {
        console.error('send-contact error:', err);
        res.status(500).json({ success: false, error: `Server error: ${err.message}` });
    }
};

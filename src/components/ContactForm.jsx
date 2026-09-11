import { useState } from 'react';

const WEBHOOK_URL = 'https://hook.us2.make.com/ujpjvbgwfeliqp5w7sr61l89hhu110fb';
const SECRET = 'i love youdummy';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [errorDetail, setErrorDetail] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    if (status === 'sending') return;
    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus('error');
      return;
    }
    setStatus('sending');
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_name: name.trim(),
          from_email: email.trim(),
          message: message.trim(),
          secret: SECRET,
        }),
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      setStatus('sent');
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      console.error('[contact form] Make webhook failed:', err);
      setErrorDetail(err && err.message ? String(err.message) : 'network error');
      setStatus('error');
    }
  }

  return (
    <form className="contact-form" onSubmit={onSubmit} noValidate={false}>
      <div className="contact-fields">
        <label className="contact-field">
          <span>your name</span>
          <input
            type="text"
            name="from_name"
            autoComplete="name"
            placeholder="Who is this?"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label className="contact-field">
          <span>your email</span>
          <input
            type="email"
            name="from_email"
            autoComplete="email"
            placeholder="Where do I reply?"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
      </div>
      <label className="contact-field">
        <span>your message</span>
        <textarea
          name="message"
          rows={4}
          placeholder="Weird idea goes here…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </label>
      <div className="contact-sendrow">
        <button className="glow-btn" type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'sending…' : 'send it →'}
        </button>
        <p className="contact-status" aria-live="polite" data-state={status}>
          {status === 'sent' && 'Received! I read everything, I promise.'}
          {status === 'error' && ('Hmm, that failed to send (' + errorDetail + ') — or ping me on GitHub instead.')}
        </p>
      </div>
    </form>
  );
}

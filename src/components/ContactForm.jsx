import { useState } from 'react';
import emailjs from '@emailjs/browser';

const SERVICE_ID = 'service_wtfrq2j';
// TODO: fill these two from your EmailJS dashboard (https://dashboard.emailjs.com):
// - Email Templates -> your template -> Template ID
// - Account -> General -> Public Key
// The template must contain the variables {{from_name}}, {{from_email}} and {{message}}.
const TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
const PUBLIC_KEY = 'YOUR_PUBLIC_KEY';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error

  async function onSubmit(e) {
    e.preventDefault();
    if (status === 'sending') return;
    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus('error');
      return;
    }
    setStatus('sending');
    try {
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        { from_name: name.trim(), from_email: email.trim(), message: message.trim() },
        { publicKey: PUBLIC_KEY }
      );
      setStatus('sent');
      setName('');
      setEmail('');
      setMessage('');
    } catch {
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
          {status === 'error' && 'Hmm, that failed to send — fill every field, or ping me on GitHub instead.'}
        </p>
      </div>
    </form>
  );
}

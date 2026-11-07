import { useMemo, useState } from 'react';
import { useCopy } from '../i18n';
import Choice from '../components/tools/Choice';
import { downloadBlob } from '../lib/files';
import { makeQr, qrPng, qrSvg, wifiPayload, type WifiSecurity } from '../lib/qr';
import { normalizePhone, whatsappLink } from '../lib/whatsapp';

const COPY = {
  es: {
    type: 'Tipo de QR', link: 'Link o texto', wifi: 'Wifi', whatsapp: 'WhatsApp',
    linkLabel: 'Link o texto', linkPh: 'https://instagram.com/tulocal',
    ssid: 'Nombre de la red', pass: 'Contraseña', security: 'Seguridad', open: 'Sin contraseña', hidden: 'Red oculta',
    phone: 'Número de WhatsApp', phonePh: '0223 15 555-1234', phoneHint: 'Escribilo como lo usás. Lo paso al formato internacional.',
    phoneErr: 'Revisá el número: tiene que tener la característica (por ejemplo 223 o 11).',
    message: 'Mensaje (opcional)', messagePh: 'Hola, quiero hacer un pedido',
    waLink: 'Link para compartir', copy: 'Copiar', copied: 'Copiado', failed: 'No se pudo',
    empty: 'Completá los datos y el QR aparece acá.',
    tooLong: 'Es demasiado texto para un QR. Probá con un link más corto.',
    png: 'Descargar PNG', svg: 'Descargar SVG (imprenta)',
    tip: 'Imprimilo de al menos 3 × 3 cm y probalo con tu celular antes de imprimir muchos.',
    qrAlt: 'Vista previa del código QR',
  },
  en: {
    type: 'QR type', link: 'Link or text', wifi: 'Wifi', whatsapp: 'WhatsApp',
    linkLabel: 'Link or text', linkPh: 'https://instagram.com/yourshop',
    ssid: 'Network name', pass: 'Password', security: 'Security', open: 'No password', hidden: 'Hidden network',
    phone: 'WhatsApp number', phonePh: '+54 9 223 555-1234', phoneHint: 'Argentine numbers can be typed as usual; others with + and country code.',
    phoneErr: 'Check the number: include the area code, or + and the country code.',
    message: 'Message (optional)', messagePh: "Hi, I'd like to place an order",
    waLink: 'Link to share', copy: 'Copy', copied: 'Copied', failed: 'Failed',
    empty: 'Fill in the details and the QR code shows up here.',
    tooLong: 'Too much text for a QR code. Try a shorter link.',
    png: 'Download PNG', svg: 'Download SVG (print)',
    tip: 'Print it at least 3 × 3 cm and test it with your phone before printing a batch.',
    qrAlt: 'QR code preview',
  },
};

type Kind = 'link' | 'wifi' | 'whatsapp';

export default function QrTool() {
  const c = useCopy(COPY);
  const [kind, setKind] = useState<Kind>('link');
  const [text, setText] = useState('');
  const [ssid, setSsid] = useState('');
  const [pass, setPass] = useState('');
  const [security, setSecurity] = useState<WifiSecurity>('WPA');
  const [hidden, setHidden] = useState(false);
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState<'idle' | 'done' | 'error'>('idle');

  const digits = phone.trim() ? normalizePhone(phone) : null;
  const wa = digits ? whatsappLink(digits, message) : '';

  const payload =
    kind === 'link' ? text.trim()
    : kind === 'wifi' ? (ssid.trim() ? wifiPayload(ssid.trim(), pass, security, hidden) : '')
    : wa;

  const matrix = useMemo(() => (payload ? makeQr(payload) : null), [payload]);
  const svg = matrix ? qrSvg(matrix) : '';
  const name = kind === 'wifi' ? `qr-wifi-${(ssid.trim() || 'red').replace(/[^\w-]+/g, '-')}` : kind === 'whatsapp' ? 'qr-whatsapp' : 'qr';

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(wa); setCopied('done'); } catch { setCopied('error'); }
    setTimeout(() => setCopied('idle'), 1600);
  };

  return (
    <div className="tool-panel qr-tool">
      <div className="qr-form">
        <Choice legend={c.type} value={kind} onChange={setKind} options={[['link', c.link], ['wifi', c.wifi], ['whatsapp', c.whatsapp]]} />

        {kind === 'link' && (
          <label className="field">
            <span>{c.linkLabel}</span>
            <textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder={c.linkPh} />
          </label>
        )}

        {kind === 'wifi' && (
          <>
            <label className="field"><span>{c.ssid}</span><input type="text" value={ssid} onChange={(e) => setSsid(e.target.value)} autoComplete="off" /></label>
            <Choice legend={c.security} value={security} onChange={setSecurity} options={[['WPA', 'WPA/WPA2/WPA3'], ['WEP', 'WEP'], ['nopass', c.open]]} />
            {security !== 'nopass' && (
              <label className="field"><span>{c.pass}</span><input type="text" value={pass} onChange={(e) => setPass(e.target.value)} autoComplete="off" spellCheck={false} /></label>
            )}
            <label className="check"><input type="checkbox" checked={hidden} onChange={(e) => setHidden(e.target.checked)} /> {c.hidden}</label>
          </>
        )}

        {kind === 'whatsapp' && (
          <>
            <label className="field">
              <span>{c.phone}</span>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={c.phonePh} aria-invalid={Boolean(phone.trim() && !digits)} aria-describedby="phone-hint" />
              <small id="phone-hint" className={phone.trim() && !digits ? 'err' : undefined}>{phone.trim() && !digits ? c.phoneErr : c.phoneHint}</small>
            </label>
            <label className="field">
              <span>{c.message}</span>
              <textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder={c.messagePh} />
            </label>
            {wa && (
              <div className="field">
                <span>{c.waLink}</span>
                <div className="copy-row">
                  <code className="mono">{wa}</code>
                  <button type="button" className={`copy${copied === 'done' ? ' done' : ''}`} onClick={copyLink}>
                    {copied === 'done' ? c.copied : copied === 'error' ? c.failed : c.copy}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="qr-preview">
        <div className="qr-frame">
          {svg
            ? <img src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`} alt={c.qrAlt} width={260} height={260} />
            : <p>{payload ? c.tooLong : c.empty}</p>}
        </div>
        <div className="tool-actions">
          <button type="button" className="btn primary" disabled={!matrix} onClick={async () => matrix && downloadBlob(await qrPng(matrix), `${name}.png`)}>{c.png}</button>
          <button type="button" className="btn" disabled={!matrix} onClick={() => downloadBlob(new Blob([svg], { type: 'image/svg+xml' }), `${name}.svg`)}>{c.svg}</button>
        </div>
        <small className="qr-tip">{c.tip}</small>
      </div>
    </div>
  );
}

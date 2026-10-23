const SKILLS = [
  ['Lenguajes', 'Python, TypeScript, JavaScript, PHP, SQL'],
  ['Frontend', 'React, Next.js, Tailwind CSS, Vite'],
  ['Datos', 'Supabase, PostgreSQL, MySQL, Firebase'],
  ['Cloud', 'Vercel, Docker, Git, fundamentos de AWS'],
  ['Broadcast', 'Squid CGX, OBS, CasparCG, Premiere, After Effects'],
];

const TIMELINE = [
  { year: '2011', title: 'Técnico en Informática', text: 'E.E.T. N°3 D. F. Sarmiento' },
  { year: '2015', title: 'Freelance', text: 'Edición de video, soporte IT y, más tarde, desarrollo web para clientes propios' },
  { year: '2017', title: 'Canal 8 Mar del Plata', text: 'Cámara, dirección de cámaras, control de aire, gráfica, edición y soporte IT' },
  { year: '2024', title: 'Festival de Cine de Mar del Plata', text: 'Edición para redes en las ediciones 2024, 2025 y 2026' },
  { year: '2026', title: 'Teleocho Informa', text: 'Paquete gráfico del noticiero generado con código' },
  { year: '2027', title: 'Tecnicatura en Programación', text: 'Teclab, en curso', next: true },
];

export default function About() {
  return (
    <section className="sec" id="sobre-mi" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="sec-head">
          <span className="eyebrow">Sobre mí</span>
          <h2>De la cámara al código.</h2>
        </div>
        <div className="about">
          <div>
            <p>Soy técnico en informática y trabajo hace 9 años en Canal 8 Mar del Plata. Empecé en cámara y hoy también dirijo cámaras, opero el control de aire y la gráfica, edito y doy soporte IT.</p>
            <p>En un canal en vivo los problemas se resuelven en el momento. Ahí empecé a armar mis propias herramientas para automatizar lo que se repetía, y eso es lo que hago hoy con software: entiendo el problema operativo desde adentro y construyo la solución.</p>
            <p className="mute">Busco sumarme a un equipo de Argentina o LatAm para crecer en desarrollo de software, automatización y datos. Fuera del trabajo entreno CrossFit y salgo a la costa con mis perros.</p>
            <dl className="skills">
              {SKILLS.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
            </dl>
          </div>
          <ol className="tl">
            {TIMELINE.map((t) => (
              <li key={t.year + t.title} className={t.next ? 'next' : undefined}>
                <span className="y">{t.year}</span>
                <b>{t.title}</b>
                <span>{t.text}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

import { useCopy } from '../i18n';

const COPY = {
  es: {
    eyebrow: 'Sobre mí',
    title: 'De la cámara al código.',
    p1: 'Soy técnico en informática y trabajo hace 9 años en Canal 8 Mar del Plata. Empecé en cámara y hoy también dirijo cámaras, opero el control de aire y la gráfica, edito y doy soporte IT.',
    p2: 'En un canal en vivo los problemas se resuelven en el momento. Ahí empecé a armar mis propias herramientas para automatizar lo que se repetía, y eso es lo que hago hoy con software: entiendo el problema operativo desde adentro y construyo la solución.',
    p3: 'Busco sumarme a un equipo de Argentina o LatAm para crecer en desarrollo de software, automatización y datos. Fuera del trabajo entreno CrossFit y salgo a la costa con mis perros.',
    skills: [
      ['Lenguajes', 'Python, TypeScript, JavaScript, PHP, SQL'],
      ['Frontend', 'React, Next.js, Tailwind CSS, Vite'],
      ['Datos', 'Supabase, PostgreSQL, MySQL, Firebase'],
      ['Cloud', 'Vercel, Docker, Git, fundamentos de AWS'],
      ['Broadcast', 'Squid CGX, OBS, CasparCG, Premiere, After Effects'],
    ],
    timeline: [
      { year: '2011', title: 'Técnico en Informática', text: 'E.E.T. N°3 D. F. Sarmiento' },
      { year: '2015', title: 'Freelance', text: 'Edición de video, soporte IT y, más tarde, desarrollo web para clientes propios' },
      { year: '2017', title: 'Canal 8 Mar del Plata', text: 'Cámara, dirección de cámaras, control de aire, gráfica, edición y soporte IT' },
      { year: '2024', title: 'Festival de Cine de Mar del Plata', text: 'Edición para redes en las ediciones 2024, 2025 y 2026' },
      { year: '2026', title: 'Teleocho Informa', text: 'Paquete gráfico del noticiero generado con código' },
      { year: '2027', title: 'Tecnicatura en Programación', text: 'Teclab, en curso', next: true },
    ],
  },
  en: {
    eyebrow: 'About',
    title: 'From the camera to the code.',
    p1: "I'm an IT technician and I've worked at Canal 8 Mar del Plata for 9 years. I started on camera, and today I also direct cameras, run the control room and the on-air graphics, edit video and handle IT support.",
    p2: 'At a live TV station, problems get solved on the spot. That is where I started building my own tools to automate repetitive work, and it is what I do now with software: I understand the operational problem from the inside and build the solution.',
    p3: "I'm looking to join a team in Argentina or Latin America to grow in software development, automation and data. Outside work I do CrossFit and walk my dogs along the coast.",
    skills: [
      ['Languages', 'Python, TypeScript, JavaScript, PHP, SQL'],
      ['Frontend', 'React, Next.js, Tailwind CSS, Vite'],
      ['Data', 'Supabase, PostgreSQL, MySQL, Firebase'],
      ['Cloud', 'Vercel, Docker, Git, AWS fundamentals'],
      ['Broadcast', 'Squid CGX, OBS, CasparCG, Premiere, After Effects'],
    ],
    timeline: [
      { year: '2011', title: 'IT Technician', text: 'E.E.T. N°3 D. F. Sarmiento technical high school' },
      { year: '2015', title: 'Freelance', text: 'Video editing, IT support and, later, web development for my own clients' },
      { year: '2017', title: 'Canal 8 Mar del Plata', text: 'Camera, camera directing, control room, graphics, editing and IT support' },
      { year: '2024', title: 'Mar del Plata Film Festival', text: 'Social media editing for the 2024, 2025 and 2026 editions' },
      { year: '2026', title: 'Teleocho Informa', text: 'Newscast graphics package generated with code' },
      { year: '2027', title: 'Associate degree in Programming', text: 'Teclab, in progress', next: true },
    ],
  },
};

export default function About() {
  const c = useCopy(COPY);
  return (
    <section className="sec" id="sobre-mi" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="sec-head">
          <span className="eyebrow">{c.eyebrow}</span>
          <h2>{c.title}</h2>
        </div>
        <div className="about">
          <div>
            <p>{c.p1}</p>
            <p>{c.p2}</p>
            <p className="mute">{c.p3}</p>
            <dl className="skills">
              {c.skills.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
            </dl>
          </div>
          <ol className="tl">
            {c.timeline.map((t) => (
              <li key={t.year + t.title} className={'next' in t && t.next ? 'next' : undefined}>
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

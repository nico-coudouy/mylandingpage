import { useCopy } from '../i18n';

const COPY = {
  es: {
    eyebrow: 'Sobre mí',
    title: 'De la cámara al código.',
    p1: 'Soy técnico en informática y trabajo hace 9 años en Canal 8 Mar del Plata. Empecé en cámara y hoy también dirijo cámaras, opero el control de aire y la gráfica, edito y doy soporte IT. También redacté el protocolo de producción audiovisual y gestión de activos del canal.',
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
    photosTitle: 'Del otro lado de la pantalla',
    photos: [
      { src: '/assets/foto-control.webp', w: 900, h: 1192, alt: 'Nico en el control de aire de Canal 8, con auricular y frente al switcher', cap: 'Control de aire · Canal 8' },
      { src: '/assets/foto-grua.webp', w: 900, h: 1131, alt: 'Nico operando una grúa de cámara en el estudio', cap: 'Grúa de cámara en estudio' },
      { src: '/assets/foto-teleocho.webp', w: 900, h: 1200, alt: 'Switcher y pared de monitores del control con Teleocho Informa al aire', cap: 'Teleocho Informa al aire' },
    ],
  },
  en: {
    eyebrow: 'About',
    title: 'From the camera to the code.',
    p1: "I'm an IT technician and I've worked at Canal 8 Mar del Plata for 9 years. I started on camera, and today I also direct cameras, run the control room and the on-air graphics, edit video and handle IT support. I also wrote the station's audiovisual production and media asset management protocol.",
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
    photosTitle: 'The other side of the screen',
    photos: [
      { src: '/assets/foto-control.webp', w: 900, h: 1192, alt: 'Nico in the Canal 8 control room, wearing a headset at the switcher', cap: 'Control room · Canal 8' },
      { src: '/assets/foto-grua.webp', w: 900, h: 1131, alt: 'Nico operating a camera crane in the studio', cap: 'Camera crane in the studio' },
      { src: '/assets/foto-teleocho.webp', w: 900, h: 1200, alt: 'Control room switcher and monitor wall with Teleocho Informa on air', cap: 'Teleocho Informa on air' },
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
        <div className="photo-strip">
          <span className="eyebrow">{c.photosTitle}</span>
          <div className="photo-grid">
            {c.photos.map((p) => (
              <figure key={p.src}>
                <img src={p.src} alt={p.alt} width={p.w} height={p.h} loading="lazy" decoding="async" />
                <figcaption>{p.cap}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

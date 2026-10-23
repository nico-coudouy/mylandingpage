import { CodeIcon, VideoIcon } from './Icons';

const SERVICES = [
  {
    icon: <CodeIcon />,
    title: 'Desarrollo web y automatización',
    text: 'Sitios y apps web con base de datos, integraciones entre sistemas y scripts que eliminan tareas repetitivas.',
    items: ['Webs para negocios y profesionales', 'Apps con usuarios, reservas o catálogos', 'Automatización con Python y APIs', 'Chatbots con IA para Instagram y WhatsApp'],
  },
  {
    icon: <VideoIcon />,
    title: 'Producción audiovisual y motion',
    text: 'Edición para redes, gráfica animada y piezas para televisión, con criterio de quien trabaja en el aire.',
    items: ['Edición de reels e historias', 'Motion graphics y animación', 'Gráfica broadcast para noticieros', 'Cámara y dirección de cámaras'],
  },
];

export default function Services() {
  return (
    <section className="sec" id="servicios" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="sec-head">
          <span className="eyebrow">Servicios</span>
          <h2>En qué te puedo ayudar.</h2>
        </div>
        <div className="svc">
          {SERVICES.map((s) => (
            <div key={s.title} className="svc-card">
              <div className="ico">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
              <ul>{s.items.map((i) => <li key={i}>{i}</li>)}</ul>
            </div>
          ))}
        </div>
        <div className="svc-alt">
          <span><b>También:</b> soporte IT para hogares y comercios en Mar del Plata, con PC, notebooks y redes.</span>
          <a href="#contacto">CONSULTAR →</a>
        </div>
      </div>
    </section>
  );
}

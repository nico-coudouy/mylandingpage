import { useLang } from '../../i18n';
import { ArrowUpRight } from '../Icons';

const GAME = '/batalladebaristas/';
const CODE = 'https://github.com/nico-coudouy/batalla-de-baristas';

/** Jugar y ver el código, lado a lado. */
export default function BaristasLinks() {
  const es = useLang().lang === 'es';
  return (
    <div className="mini-links">
      <a className="mini-link" href={GAME} target="_blank" rel="noopener">{es ? 'Jugar' : 'Play'} <ArrowUpRight size={14} /></a>
      <a className="mini-link" href={CODE} target="_blank" rel="noopener">{es ? 'Ver código' : 'View code'} <ArrowUpRight size={14} /></a>
    </div>
  );
}

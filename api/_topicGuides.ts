/**
 * What the assistant knows about each "Explicado simple" page (/explicado/<slug>).
 * Like the tool guides, the browser only sends the slug; the text lives here.
 * Keep each guide in sync with what the page really shows.
 */
export const TOPIC_GUIDES: Record<string, { name: string; guide: string }> = {
  'hace-tu-zocalo': {
    name: 'Hacé tu propio zócalo',
    guide: `- Un zócalo es el texto que aparece en la parte de abajo de la pantalla en la tele: el nombre y cargo de un entrevistado, o una volanta (tema corto, como CLIMA) y un título.
- En la página la persona elige "Nombre y cargo" o "Volanta y título", escribe los dos renglones y lo ve en una tele simulada. Las reglas son las de Canal 8: máximo 47 caracteres por renglón (es lo que entra en pantalla con la letra del canal) y todo en mayúsculas (la página lo pasa sola, como el conversor real).
- Al tocar "Mandar a la gráfica" ve el recorrido real: 1) Airtable, una planilla compartida donde la producción escribe cada zócalo en la fila de su nota; 2) CSV, el archivo de texto que se descarga de la planilla; 3) el conversor que hizo Nico, que revisa las reglas y arma el Excel que entiende la gráfica; 4) Squid (CGX), el sistema de gráfica del canal, que lo carga en la playlist del programa.
- Después aparece el botón "Sacar al aire": en el canal, el operador de gráfica decide el momento exacto en que sale cada zócalo. La automatización prepara; la decisión es humana.
- Con el zócalo al aire se puede descargar una imagen para historia (9:16) u horizontal (16:9). Dice "SIMULADOR" y lleva nicolascoudouy.com.ar en una esquina; no es la gráfica real de ningún canal.
- Dato real: con el conversor, cargar los zócalos de un programa (unos 39) pasó de media hora a unos 5 minutos. No es por API: se descarga el CSV de Airtable.`,
  },
};

/**
 * What the assistant knows about each tool in /herramientas. The browser only sends the
 * slug; the text comes from here, so nobody can slip instructions into the prompt.
 * Files starting with "_" inside api/ are not deployed as their own endpoint.
 * Keep each guide in sync with what the tool really does.
 */
export const TOOL_GUIDES: Record<string, { name: string; guide: string }> = {
  'unir-y-separar-pdf': {
    name: 'Unir y separar PDF',
    guide: `- Tiene dos modos, que se eligen arriba: "Unir" y "Separar".
- Unir: se sueltan o eligen varios PDF. Aparecen en una lista con la cantidad de páginas de cada uno. El orden se cambia con las flechas de cada fila y se quita uno con la cruz. El botón "Unir y descargar" baja un solo PDF.
- Separar: se elige un PDF. En "Páginas" se escribe qué páginas sacar, por ejemplo 1-3, 5 o 8- (de la 8 al final). Vacío significa todas. Se puede escribir en otro orden (3, 1, 2) para reordenar. Hay dos salidas: "Un PDF con esas páginas" o "Cada página en un PDF aparte", que baja un .zip.
- Los PDF protegidos con contraseña no se pueden abrir: hay que quitarles la contraseña primero desde el programa con el que se abren.
- No comprime ni convierte a Word. Si piden eso, decí que no lo hace.
- Si un PDF está dañado, la herramienta lo marca en la lista y se puede quitar.`,
  },
  'fotos-a-pdf': {
    name: 'Fotos a PDF',
    guide: `- Acepta JPG, PNG, WebP y HEIC (el formato de las fotos del iPhone). Las fotos HEIC se convierten en el navegador; la primera vez tarda unos segundos más porque carga el conversor.
- Las fotos aparecen en orden; se reordenan con las flechas y se quitan con la cruz. Cada foto ocupa una página.
- Opciones: hoja (A4, Oficio o "Tamaño de la foto"), margen (con o sin) y calidad (Alta, Media o Liviana). "Liviana" achica las fotos para que el PDF pese poco, útil para formularios con límite de tamaño. Con una foto por hoja, las fotos apaisadas van en hoja apaisada.
- Para el frente y dorso del DNI: en "Fotos por hoja" elegir "Dos (frente y dorso)", que pone dos imágenes una arriba de la otra en la misma hoja. No está disponible con "Tamaño de la foto".
- El botón "Crear PDF" lo descarga y muestra cuánto pesa. Si pesa demasiado para un formulario, elegir calidad Liviana y volver a crearlo.
- En el iPhone, al elegir fotos de la galería el sistema muchas veces ya las pasa a JPG; igual funciona con los dos formatos.`,
  },
  'qr-whatsapp': {
    name: 'QR y links de WhatsApp',
    guide: `- Tiene tres tipos de QR: "Link o texto" (una web, la carta del local, un Instagram), "Wifi" (nombre de la red, contraseña y tipo de seguridad; al escanearlo el celular se conecta solo) y "WhatsApp" (número y mensaje opcional).
- En WhatsApp, el número se escribe como uno lo usa (por ejemplo 0223 15 555-1234) y la herramienta lo pasa al formato internacional. También genera el link wa.me para copiar y pegar en Instagram o en una web.
- El QR se descarga en PNG (para pantalla o impresión chica) o SVG (para imprenta, se agranda sin perder calidad).
- Los QR no vencen ni dependen de ningún servicio: el contenido va dentro del código. Si cambia la contraseña del wifi o la web, hay que hacer un QR nuevo.
- Para imprimir, conviene que mida al menos 3 x 3 cm, y más grande si se escanea de lejos (una regla práctica: 1 cm de lado por cada 10 cm de distancia).`,
  },
};

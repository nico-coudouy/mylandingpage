# CV

Fuente única del CV. `cv.html` genera `public/assets/cv-nicolas-coudouy.pdf`, el que se descarga desde la web.

Para regenerar el PDF después de editar `cv.html`:

```bash
google-chrome --headless=new --no-pdf-header-footer \
  --print-to-pdf=public/assets/cv-nicolas-coudouy.pdf "file://$PWD/cv/cv.html"
```

Tiene que quedar en una sola página A4. Las fuentes (IBM Plex) están en `cv/fonts`, así que no depende de internet.

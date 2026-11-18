# Araçari: decisiones

Este documento explica qué decidí al construir la web y tienda de Araçari, por qué, qué descarté y qué queda pendiente. Todo lo marcado **[TBD]** o **[VERIFY]** en la web es un hueco que tiene que rellenar o comprobar la familia antes del lanzamiento.

- Web publicada: ver el enlace del artifact.
- Archivo único publicado: `public/index.html` (se abre directamente en el navegador).
- Código fuente: `src/`. Para regenerar el archivo único: `npm run build`.
- Datos de la tienda (sabores, precios, packs, envío, maridajes): `src/js/data.js`, el primer bloque del código. Es lo único que hay que tocar para cambiar un precio o añadir un sabor.

---

## 1. La idea central

Una nuez pecana sola es una materia prima. Así que cada sección tenía que responder a dos preguntas: ¿hace que la pecana parezca valer más? ¿Acerca al visitante a comprar?

| Sección | Qué valor añade | Cómo lleva a la compra |
|---|---|---|
| Hero | El pack real, en 3D, flotando; el pájaro aterriza encima. El color de toda la página cambia con cada sabor. | "Shop now" y el selector de 8 sabores, que ya es una forma de elegir. |
| Origen | Las cuatro estaciones de verdad (por eso crecen pecanas en el sur de Brasil y no en el trópico) y los 10 687 km del viaje. Convierte "nuez" en "nuez con historia y con origen". | Al terminar el recorrido la tienda está justo debajo. |
| La nuez | El momento de abrir una pecana, convertido en juego. Es lo único que el visitante "toca" del producto antes de comprarlo. | Contador y racha: invita a quedarse; la tienda sigue a continuación. |
| Tienda | Cada sabor es un "mundo de color" con su pack girable. La parte trasera del pack muestra información real (o [TBD]). | Añadir al carrito con el pájaro llevando el paquete; packs que suben el ticket medio; barra de envío gratis; sugerencia de producto. |
| Maridaje | Posiciona la pecana como acompañante de vino y queso: el ritual de un sumiller, no un test. | Cada sugerencia termina en "Add to cart". |
| El araçari | El pájaro real detrás de la marca. Da personalidad y algo que contar en la mesa. | Mantiene el vínculo emocional con el personaje que aparece en el pack. |
| La finca | El 20% de la finca es bosque atlántico nativo, hogar del araçari: une la marca con un hecho concreto. Mapa ilustrado interactivo. Todo con [VERIFY]. | Da una razón para pagar más por la misma nuez. |
| Para tiendas | Un apartado limpio para vinotecas, queserías y tiendas ecológicas. | Formulario de muestras/precios mayoristas. |
| Newsletter | El pájaro se despide. | Captura de email para el lanzamiento. |

**Orden actual (cambiado a petición del cliente):** hero, tienda y cajas, maridaje, la nuez, origen, el araçari, la finca, para tiendas, newsletter. Los productos van primero y la historia después: quien llega quiere ver qué se vende antes de leer de dónde viene.

**Orden original y por qué:** puse la tienda antes del maridaje (el brief los tenía en orden 4 y 5, igual que yo), pero añadí un acceso directo al maridaje desde el hero ("Find your pairing"), porque para quien llega desde una vinoteca o quesería esa es la entrada más natural. También puse "La nuez" antes de la tienda: abrir una pecana justo antes de ver los packs funciona como "abrir el apetito".

---

## 2. Estudio tipográfico

Puse las cuatro direcciones con el mismo contenido (titular, párrafo, nota manuscrita, precio, botón, tabla nutricional y una prueba de caracteres en portugués y neerlandés) sobre crema, sobre el naranja del pack y sobre chocolate. Captura: `docs/type-study/type-study.png`; archivo: `docs/type-study/type-study.html`.

1. **Cálida y orgánica: Fraunces (eje SOFT) + Nunito Sans.** Acogedora, pero es exactamente la combinación "crema + serif suave" que hoy se ve en cualquier web generada. No tiene nada que ver con el pack.
2. **Premium y editorial: Bodoni Moda cursiva + Jost.** Lujosa, pero fría. Los trazos finos de Bodoni desaparecen sobre el naranja y en tamaños pequeños, y el precio en cursiva pierde claridad. Va contra lo que pide la marca: cálida, familiar, honesta.
3. **Juguetona y brasileña: Bricolage Grotesque condensada + Figtree.** Con mucha energía y precios muy legibles, pero no tiene relación con el logotipo. Sería otra marca.
4. **Desde el pack: Josefin Sans + Literata + Dancing Script. ELEGIDA.**

**Por qué la 4.** El logotipo de Araçari está dibujado a partir de Josefin Sans Bold, y el pack usa Josefin en mayúsculas con mucho espaciado ("BRAZILIAN PECANS", "EL PORVENIR FARMS · BRAZIL"). Usarla para titulares hace que la web y el pack parezcan la misma familia. Pero Josefin tiene una altura de x muy baja y cansa en texto largo, así que el texto va en **Literata**: una serif de lectura con eje óptico, cálida, con cifras tabulares para precios y tablas, y muy cómoda en móvil. **Dancing Script** es la letra manuscrita del pack y solo se usa para las notas a mano ("slow roasted", "glassy caramel") y detalles pequeños, como en el pack.

**Detalles del sistema:**
- Escala fluida con `clamp()` para hero, títulos de sección, subtítulos, cuerpo, pies, precios, botones y etiquetas de formulario (tokens `--fs-*` en `styles.css`).
- Josefin es variable (300–700): los titulares se aligeran letra a letra cuando el cursor pasa cerca, y el titular del hero pierde peso al hacer scroll.
- La "A" con paisaje: en el logotipo solo la parte superior de cada A está pintada (sol, colinas, olas). En los titulares, cada A lleva ese mismo paisaje en el pico (sol, cielo, hoja, lima, ola) y el resto de la letra en el color del texto. Se hace con gradientes, así que funciona en cualquier sabor.
- Precios y tablas con `tabular-nums`.
- Comprobé que las tres fuentes incluyen el subconjunto latin-ext de Google Fonts: ç, ã, é, õ y ĳ se ven bien (Araçari, São João, één, ĳsje).
- En el estudio, la A con paisaje salía hueca porque el color base era `currentColor` y el texto era transparente. En la web lo corregí con un color explícito.

---

## 3. El pájaro

El SVG del pájaro del pack es una lista plana de trazados, sin partes, y no se puede animar. Así que lo redibujé en código como un personaje con partes independientes: cola, cuerpo, pecho amarillo con escamas naranjas, ala plegada, dos alas de vuelo, cabeza, anillo azul del ojo, ojo con pupila y brillo, párpado, mejilla, pico superior e inferior (se abren por separado) y patas. Las plumas se generan con la misma forma de hoja con borde blanco que en el pack.

- **Ojo:** suave y cálido, con párpado relajado y brillo; al parpadear muestra el ojo cerrado sonriente del pack. Nada de diana. **Pico:** liso, sin dientes.
- **Comportamiento:** aterriza en el pack del hero, parpadea, mira al cursor (en móvil sigue el dedo; el giroscopio funciona fuera del artifact, porque allí está bloqueado), se da la vuelta si te pones detrás, y tiene gestos en reposo: ladea la cabeza, se acicala, salta, mueve la cola, pía.
- **Vuela entre secciones** con trayectorias curvas, aletea, planea al aterrizar y rebota. Se posa en el pack, en el escenario del origen, en el canvas de la nuez, al final de la primera línea de los títulos, en las fichas de datos, en las fotos de la familia y en el formulario. En el mapa vuela la ruta Brasil → Países Bajos.
- **Compra:** al añadir un producto vuela a la tarjeta, coge el pack con las patas y lo lleva al carrito. Al abrir el carrito, la ficha o el checkout se posa en el título del panel. En la confirmación celebra con confeti.
- **Reacciones:** salta al elegir un sabor; al hacer clic coge una pecana, la parte con el pico y lanza los trozos. En "Meet the araçari" cada dato tiene una demostración (dormir con la cola sobre la espalda, lanzar y atrapar comida, enseñar el pico…).
- **Colores:** los acentos del ala y la mejilla cambian con el sabor activo.
- **Huevos de pascua:** (1) siete toques seguidos al pájaro: hace un looping dorado y cuenta que antes de Araçari la familia vendía como 7 Sentidos (siete sentidos, siete toques). (2) Quedarse 5 segundos al final de la página: el pájaro se duerme y el pie lo dice. (3) La pecana dorada aparece de vez en cuando en el juego de la nuez.

---

## 4. Tienda y venta en la UE

- **Todos los productos y precios están en un solo objeto** (`DATA` en `data.js`), comentado. Precios en céntimos con IVA incluido.
- **Precios provisionales:** no hay precios de Araçari. Usé los de la antigua lista de 7 Sentidos (€5,95 el pack; envío €4,95; gratis desde €35) y todos llevan una etiqueta [TBD] visible mientras `pricesConfirmed` sea `false`.
- **Los 8 sabores se venden**, como pediste. Los cuatro "concept" no tienen receta todavía (según BRAND.md), así que sus notas de cata, ingredientes y tabla nutricional son [TBD].
- **Packs:** caja de cata (los 8), caja "wine night" (3 sabores) y caja regalo (4) con mensaje personal. Contenidos y precios provisionales.
- **Suscripción** opcional en la ficha de producto (descuento [TBD]).
- **Carrito lateral** con cantidades, eliminar, barra de envío gratis, sugerencia que depende del carrito (si hay 3 o más packs sueltos ofrece la caja de cata; si no, equilibra salado/dulce) y persistencia en el navegador (con try/catch).
- **Checkout en 4 pasos** con validación al salir del campo, código postal neerlandés (1234 AB), Luhn para tarjetas, caducidad futura, CVC, casilla de términos obligatoria y botón final "Place order and pay · €X". En móvil el resumen se pliega en una línea y los botones quedan fijos abajo, al alcance del pulgar.
- **Pago simulado:** toda la lógica de pago está en `PaymentProvider.pay()` (al principio de `checkout.js`). Para producción se sustituye por una sesión de Stripe Checkout (creada en servidor) o un Shopify Buy Button.
- **UE:** precios con IVA (9% para alimentos en NL, [VERIFY]); gastos y plazos de envío visibles en la tienda y en la ficha antes del checkout; alérgenos (frutos de cáscara) en cada tarjeta, ficha, carrito y en la parte trasera del pack; mención del derecho de desistimiento de 14 días con una nota [VERIFY] sobre los alimentos; banner de cookies que por defecto solo permite las esenciales (y no se carga ninguna analítica); todos los textos legales son borradores [TBD].

---

## 5. Movimiento y oficio

- GSAP 3.12.5 + ScrollTrigger, cargados de cdnjs. Al principio usé Lenis para un scroll suave, pero lo quité a petición del cliente: la página seguía moviéndose después de soltar la rueda y daba sensación de retraso. Ahora el scroll es el nativo del navegador.
- **Descarté three.js.** Los packs son imágenes planas de una bolsa; un pack en CSS 3D con la ilustración real delante, una trasera impresa (con la misma silueta, sacada de la imagen como máscara), un brillo metálico que se mueve con el giro e inercia al arrastrar se ve más nítido, pesa cero y va a 60 fps en cualquier portátil. Con WebGL habría tenido que inventar una malla de bolsa que no se correspondería con la ilustración.
- Coreografía: titulares que entran letra a letra con curvas expo, apariciones escalonadas, cursor propio (con etiquetas "turn" y "crack"), botones magnéticos, transición de color de toda la página entre sabores, grano sutil fijo.
- **El origen** es una escena dibujada en código (árboles generados por recursión) que se desplaza con el scroll. Muestra los amentos de primavera (las "flores" del pecano), el verano verde, la cosecha con las nueces cayendo y el invierno con helada. Después pasa a un mapa estilizado donde la ruta se dibuja y el contador de km sube.
- **La nuez** es un canvas: mantener pulsado (o tocar tres veces, o la barra espaciadora) aumenta la presión, aparecen grietas, la cáscara se rompe en fragmentos con gravedad y rebote, salen las dos mitades del fruto y entra rodando otra nuez. Lleva contador, racha y vibración en móvil.
- **Sin sonido.** Hubo sonido opcional (Web Audio, apagado por defecto); se quitó en noviembre de 2026 junto con su botón.
- **prefers-reduced-motion:** sin entradas animadas. El pájaro sigue ahí, pero se mueve con calma: aparece y desaparece en vez de volar, y solo parpadea.

---

## 6. Iteraciones

1. **Estructura e historia.** Datos, secciones, textos, i18n EN/NL y las piezas grandes (pájaro, pack, origen, nuez, tienda, checkout, maridaje).
2. **Estudio tipográfico y sistema visual.** Cuatro direcciones, elección de Josefin + Literata + Dancing Script, escala fluida, tokens de color por sabor, patrones de espirales del pack como máscaras recoloreables.
3. **Movimiento, pájaro y tienda.** Primera revisión con capturas a 1440 y 390 px. Lo que corregí:
   - Carrito y banner de cookies visibles al cargar (`[hidden]` perdía contra `display`).
   - Las espirales del hero pasaban por detrás del texto; las moví y suavicé.
   - Un "toast" vacío asomaba en el borde inferior.
   - En el mapa "DO SUL" era crema sobre crema y el contador de km usaba separadores neerlandeses en inglés.
   - Quedaban nueces en el suelo en invierno.
   - La copa de vino salía vacía: el nivel del líquido quedaba por debajo del cáliz.
   - La animación de letras cortaba la tilde de "Até" (y habría cortado la ç).
   - El pájaro se posaba con la cola encima del texto y de los botones. Ahora se sienta al final de la primera línea de los títulos.
   - En móvil, el pack del hero quedaba por debajo de la primera pantalla; reordené el hero para que vaya justo después del titular.
   - Los círculos de sabor se partían en dos filas a 390 px.
4. **Compra completa y pulido.** Prueba automatizada de compra completa (de la tarjeta a la confirmación) en escritorio y móvil, con errores provocados a propósito (campos vacíos, código postal y tarjeta incorrectos, términos sin marcar). Lo que encontré y corregí:
   - La barra superior se escondía al hacer scroll y el pájaro llevaba el pack a un carrito invisible. Ahora la barra reaparece al añadir.
   - El pájaro se quedaba encima de los campos del checkout. Ahora se posa en el título del panel abierto.
   - La confirmación era pobre. Ahora tiene recibo, ruta animada Brasil → ciudad del cliente y dirección.
   - En móvil, el resumen del pedido ocupaba la primera pantalla de cada paso; ahora se pliega.
   - El botón "Place order and pay" se cortaba en móvil.
   - Los países salían en mayúsculas de etiqueta.
   - Las notas manuscritas usaban "·", que en Dancing Script se ve roto; ahora usan comas.
   - La cara superior del queso salía negra (color mal mezclado).
   - La pecana parecía una almendra: las vetas iban de lado a lado y en una pecana van a lo largo, desde la punta.
   - El fruto y los fragmentos eran poco creíbles.
   - El cursor "crack" tapaba la nuez.
   - También probé el teclado (orden de tabulación, foco dentro del carrito, Escape y vuelta del foco), el modo de movimiento reducido y el cambio a neerlandés.

---

## 6b. La sección de la finca (sustituye a "padre e hijo")

El cliente pidió quitar la sección de la familia y propuso seis argumentos de sostenibilidad. Usé cuatro, reformulé uno y descarté otro:

- **20% de bosque nativo (Mata Atlântica):** es el centro de la sección y conecta con el pájaro del pack. [VERIFY] superficie y estatus legal (en Brasil la reserva legal del 20% es la norma para fincas en esta región, pero hay que confirmarlo para El Porvenir).
- **Protección de arroyos y manantiales:** [VERIFY].
- **Aves, abejas e insectos entre filas:** lo describo como un hecho ("las filas están junto al bosque"), sin la etiqueta "biodiversity-friendly". [VERIFY] qué hace la finca.
- **Sumidero de carbono:** reformulado. Digo solo lo verificable (los pecanos viven décadas y almacenan carbono en la madera) y quito "combate el cambio climático": desde el 27 de septiembre de 2026 la UE prohíbe las afirmaciones ambientales genéricas en productos si no se pueden demostrar (Directiva (UE) 2024/825).
- **Apoyo a la economía regional:** se mantiene, es simplemente el origen.
- **Envase ecológico: descartado.** El envase es una bolsa de aluminio; decir "kraft" o "biodegradable" sería falso. Si cambia el envase, se añade.

**Actualización: fincas asociadas.** El Porvenir es la finca de la familia, pero no todas las nueces vienen de ella: el resto procede de fincas asociadas con las mismas prácticas (20% de bosque nativo, arroyos protegidos, sin pesticidas). La sección se llama ahora "Nuestras fincas" y todo lo que dice vale para todas, con [VERIFY]. El cliente dijo que las fincas son "bio": no uso las palabras "organic", "bio" ni "eco", porque en la UE solo se pueden usar con certificado ecológico (Reglamento (UE) 2018/848). Tampoco "sostenible" como etiqueta genérica. Escribo "bosque nativo" en lugar de "bosque primario" hasta confirmar que nunca se taló.

**Buscador de sabor (sustituye al juego de la nuez, a petición del cliente).** Cuatro preguntas (dulce o salado, textura, momento, nota de sabor) que suman puntos a los ocho sabores; las preguntas y la puntuación están en `DATA.quiz`. A la derecha, los ocho packs reaccionan a cada respuesta: los que encajan crecen y se iluminan, los demás se apagan. Al terminar aparece el ganador como pack 3D con el motivo, el precio y "Añadir al carrito", más una segunda opción y "Empezar de nuevo". Primero había que romper la nuez para ver el resultado; al cliente no le gustó ese paso extra y lo quité (también el juego de romper nueces).

**El pájaro y el scroll:** mientras el usuario hace scroll, el pájaro espera en la rama de la barra de navegación (un scroll rápido lo manda allí enseguida); tras 5 segundos sin scroll baja a un sitio de la pantalla.

## 7. Descartado

- **three.js para los packs** (ver arriba).
- **Fraunces, Bodoni y Bricolage** (ver el estudio).
- **Fotos de stock, reseñas, premios, sellos, logos de tiendas, contadores de stock, afirmaciones de salud.** Prohibidos por el brief y por honestidad.
- **Inventar notas de cata, ingredientes, valores nutricionales, nombres o anécdotas de la familia.** Todo es [TBD]. Las sugerencias de maridaje sí son mías y están marcadas como "sugerencias a confirmar en una cata [TBD]".
- **Mapa con contornos geográficos precisos.** El mapa es estilizado a propósito, para no parecer una herramienta de navegación.
- **Música ambiente y sonidos.** La web no tiene sonido.

---

## 8. Pendiente para la familia

- **[TBD]:** precios, envío y transportista; ingredientes, trazas, conservación, consumo preferente y tabla nutricional; notas de cata; contenido y precio de los packs; descuento de suscripción; condiciones mayoristas; textos legales (términos, privacidad, envíos, contacto, KvK, BTW); conectar el formulario de tiendas, la newsletter y el pago.
- **[VERIFY]:** los meses exactos de cosecha con El Porvenir; los cinco datos del araçari real (incluido el significado del nombre en tupí); el tipo de IVA; cómo aplica el derecho de desistimiento de 14 días a alimentos; todos los datos de la finca (20% de bosque, arroyos, fauna, longevidad de los pecanos).
- **Material que falta del kit:** las imágenes sueltas de *Cinnamon sugar*. Las recorté de `packs-overview.jpg` y tienen la mitad de resolución que las demás, así que en tamaños grandes se ven algo blandas. Tampoco estaban las fuentes TTF ni la licencia OFL (la web usa Google Fonts, así que no hacen falta).
- **La marca:** el nombre está en `DATA.brand`, pero el logotipo SVG y los textos lo nombran también; si gana otro nombre en la encuesta habrá que cambiar el logo.

---

## 9. Tiempo total

Unos **45 minutos** de trabajo continuo en esta sesión (del análisis de los archivos a la publicación): estudio tipográfico, construcción, cuatro pases de revisión con capturas y las pruebas de compra en escritorio y móvil. Antes, otros ~10 minutos para ordenar el kit de marca en `design/`.

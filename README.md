# Proyecto de cifrado Cesar y Atbash

## Portada

Materia: Seguridad informatica  
Proyecto: Programa web para cifrar y descifrar oraciones con Cesar y Atbash  
Tecnologias: Angular, TypeScript y Bootstrap  
Entrega: enlace al programa publicado y enlace al codigo documentado

## Enlaces de entrega

Programa web publicado: https://renteriasantiago1805.github.io/proyectoCifrador/  
Codigo fuente documentado: https://github.com/renteriasantiago1805/proyectoCifrador

## Indice

1. Introduccion
2. Objetivo
3. Desarrollo
4. Enlaces de entrega
5. Ejecucion local
6. Publicacion
7. Seguridad de la documentacion
8. Conclusion
9. Bibliografia

## Introduccion

Abu Yusuf Yaqub ibn Ishaq al-Kindi, أبو يوسف يعقوب بن إسحاق الكندي, aporto uno de los fundamentos historicos del criptoanalisis: el analisis de frecuencia. Su idea consiste en contar que letras o simbolos aparecen con mayor frecuencia en un texto y comparar esos patrones con los patrones normales de un idioma.

Ese conocimiento permite atacar cifrados de sustitucion simples. En Cesar, todos los caracteres se desplazan la misma cantidad dentro de un alfabeto; en Atbash, el alfabeto se invierte. Ambos conservan patrones del idioma, por lo que una computadora puede generar candidatos y elegir el mas probable con estadistica. Por esta razon ya no son viables para proteger datos reales: tienen poco espacio de busqueda, no ocultan bien la frecuencia del lenguaje y pueden romperse automaticamente.

## Objetivo

Desarrollar una aplicacion web que permita cifrar y descifrar oraciones con los metodos Cesar y Atbash, usando un conjunto de caracteres configurable, e identificar automaticamente el metodo y el modulo usado durante el descifrado.

## Desarrollo

La aplicacion esta construida con Angular standalone components y Bootstrap. El usuario puede escribir el conjunto de caracteres que desea usar como alfabeto de cifrado. El sistema elimina caracteres duplicados para evitar asignaciones ambiguas.

### Cifrado Cesar

Cada caracter que pertenece al alfabeto se convierte en su posicion numerica y se desplaza con aritmetica modular:

```text
nueva_posicion = (posicion_original + modulo) mod longitud_alfabeto
```

Los caracteres que no pertenecen al alfabeto se conservan sin cambios para que el usuario pueda decidir si desea incluirlos o no.

El modulo puede ser positivo o negativo. Un modulo positivo avanza posiciones y uno negativo retrocede posiciones dentro del conjunto de caracteres.

### Caracteres fuera del alfabeto

Si el usuario escribe simbolos que no estan en el conjunto de caracteres configurado, la aplicacion los detecta y muestra un aviso para agregarlos al alfabeto. Si no se agregan, esos caracteres se conservan sin cambios porque no tienen una posicion valida para cifrado o descifrado.

### Cifrado Atbash

Cada caracter se sustituye por el caracter ubicado en la posicion simetrica del alfabeto:

```text
nueva_posicion = longitud_alfabeto - 1 - posicion_original
```

Atbash es reversible porque aplicar el mismo proceso dos veces devuelve el texto original.

### Descifrado automatico

El sistema no pide al usuario elegir el tipo de cifrado durante el descifrado. En su lugar:

1. Genera un candidato Atbash.
2. Genera todos los candidatos Cesar posibles. Cuando un modulo grande equivale a un desplazamiento negativo, el sistema lo muestra con signo negativo para facilitar la lectura.
3. Evalua cada resultado con una puntuacion inspirada en Al-Kindi:
   - frecuencia de letras comunes en espanol;
   - presencia de palabras comunes como `de`, `la`, `que`, `el`, `en`;
   - proporcion de vocales;
   - separacion por espacios;
   - forma general de las palabras.
4. Muestra unicamente el texto con mejor puntuacion, junto con el metodo detectado y el modulo cuando corresponde.

Esta automatizacion sirve para demostrar por que Cesar y Atbash no deben usarse como proteccion de datos en sistemas reales.

## Ejecucion local

Instalar dependencias:

```bash
npm install
```

Ejecutar el servidor de desarrollo:

```bash
npm start
```

Compilar version de produccion:

```bash
npm run build
```

Ejecutar pruebas:

```bash
npm test
```

## Publicacion

La version publica del proyecto se encuentra en GitHub Pages:

```text
https://renteriasantiago1805.github.io/proyectoCifrador/
```

El codigo fuente se encuentra en GitHub:

```text
https://github.com/renteriasantiago1805/proyectoCifrador
```

Como alternativa, tambien podria publicarse en Firebase Hosting:

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

Durante `firebase init hosting`, el directorio publico debe apuntar a `dist/proyectoCifrado/browser`. Tambien se puede publicar en GitHub Pages, Netlify, Vercel o Google Cloud, siempre que se entregue la liga al programa y la liga al repositorio.

## Seguridad de la documentacion

La documentacion evita incluir claves, contrasenas, tokens, informacion personal, rutas privadas de produccion o instrucciones para atacar sistemas reales. El objetivo es academico: explicar cifrados clasicos y mostrar sus debilidades de forma controlada.

## Conclusion

El proyecto permite comprender como funcionan Cesar y Atbash, pero tambien muestra su principal problema: al preservar patrones del idioma, pueden romperse con analisis estadistico. Al-Kindi demostro que contar frecuencias transforma un mensaje cifrado simple en un problema medible; hoy esa misma idea puede automatizarse en segundos.

## Bibliografia

- 1001 Inventions. "Code Breaking a Thousand Years Ago". https://www.1001inventions.com/code-breaking/
- Khan Academy. "Ancient cryptography". https://www.khanacademy.org/computing/computer-science/cryptography
- Wikipedia contributors. "Frequency analysis". https://en.wikipedia.org/wiki/Frequency_analysis
- Wikipedia contributors. "Atbash". https://en.wikipedia.org/wiki/Atbash

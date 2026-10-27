# Helteludo

Ludo med rollespilsevner. Hver brik har sine egne evner fra Heltetabellen, Nørdtabellen og Superheltetabellen, og efter hvert spil bliver heltepoint til nye evner.

**Spil i browseren:** https://lokkegaard.github.io/helteludo/

Bygget efter reglerne af Mette Finderup og Kristoffer Apollo.

## Indhold

- `helteludo.html`: hele spillet i én fil (2D-kort og 3D-bord, 2–4 hold, computerspillere, firkantet bræt til 2 og 4 hold og rundt bræt til 3 hold).
- `OVERDRAGELSE.md`: teknisk beskrivelse af spillet og alle versioner.
- `tests/`: Node-test af regelmotoren (`node tests/motor-braet.js`).
- `tegninger/`: kildetegningerne til figurer, evner, bræt og bord.

## Online-spil

Online-spil mellem flere enheder bruger claude.ai's artefakt-runtime og virker kun der. På GitHub Pages kan man spille på samme skærm og mod computeren.

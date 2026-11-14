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

Vælg **Online**, skriv dit navn og opret et spil. Send koden eller linket til de andre, så de kan deltage fra deres egen enhed. Spillet kører i værtens browser, og de andre forbinder sig direkte til værten (via PeerJS), så værten skal have siden åben, mens I spiller. Enkelte skole- og firmanetværk kan blokere den direkte forbindelse.

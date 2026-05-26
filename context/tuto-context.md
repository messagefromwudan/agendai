# TUTO AI — Context produs

## Ce este TUTO
TUTO este o aplicație de tutoriat AI în limba română, destinată elevilor moldoveni
din clasele V–XII. Fiecare materie are un prompt de sistem specializat, aliniat la
curriculumul MECC (Ministerul Educației și Cercetării al Republicii Moldova).

## Stack tehnic
- Frontend: Next.js + TypeScript (Windsurf/Claude Code)
- AI: Anthropic API (claude-sonnet)
- Prompts: `src/lib/promptBuilder.ts` — complet, acoperă toate materiile și clasele

## Funcționalități existente
- Chat cu tutore AI pe materii și clase
- Prompturi specializate pe fiecare materie (fizică, matematică, chimie, biologie,
  geografie, istorie, română, informatică etc.) pentru clasele V–XII
- Interfață în română

## Funcționalități în lucru (prioritate acum)
- Flashcard-uri generate din lecțiile curente
- Quiz-uri cu întrebări din materia și clasa selectată
- Rapoarte pentru profesori bazate pe sesiunile elevilor

## Concurenți principali
- **Astra** — aplicație similară; TUTO se diferențiază prin:
  - Calitatea execuției (UX mai curat)
  - Aliniere strictă MECC
  - Funcționalitate offline (în plan)
  - Focalizare exclusivă pe Moldova

## Utilizatori țintă
- **Elevi** clasa V–XII (utilizatori primari)
- **Profesori** (utilizatori secundari — rapoarte, progres)
- **Părinți** (utilizatori terțiari)
- **Școli** (clienți instituționali — model B2B)

## Model de business
- Freemium: acces de bază gratuit, funcționalități avansate cu abonament
- B2B: licențe pentru școli

## Echipă
- Bianca Arghiri — fondator, product manager, development

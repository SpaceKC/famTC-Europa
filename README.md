# Jurnal de Călătorie — publicare pe Netlify (gratuit, storage automat)

Această variantă nu mai are nevoie de niciun pas de configurare pentru storage — nu cauți
în niciun Marketplace, nu conectezi nimic manual, nu cauți nume de variabile. Netlify Blobs
(storage-ul lor propriu) e activat automat, din prima, pentru orice site publicat pe Netlify.

## Pas 1 — Instalează Netlify CLI

```
npm install -g netlify-cli
```

## Pas 2 — Autentificare (creează cont Netlify dacă nu ai)

```
netlify login
```

Se deschide browserul, te loghezi (email + parolă sau Google/GitHub), gratuit, fără card.

## Pas 3 — Publică proiectul

Din folderul acestui proiect:

```
netlify deploy --prod
```

La prima rulare te va întreba:
- **"Link this directory to an existing site?"** → răspunde **No** (creezi unul nou)
- **"Team"** → alege contul tău
- **"Site name"** → apasă Enter pentru un nume automat, sau scrie unul (ex: `jurnal-cluj-adriatica`)

La final primești un link de tipul:
```
https://jurnal-cluj-adriatica.netlify.app
```

**Asta e tot.** Nu mai există alt pas de storage de configurat — Netlify Blobs e deja activ.

## Pas 4 — Deschide linkul, setează PIN-ul, trimite-l grupului

Prima persoană care deschide linkul va vedea ecranul „Creează un PIN".

---

## De ce e mai simplu decât Vercel

- **Zero pași de storage.** Nu există echivalentul „Storage → Marketplace → Upstash → conectează
  → verifică variabilele" — Netlify Blobs se activează singur, în interiorul funcțiilor, fără
  nicio acțiune din partea ta.
- **Un singur loc de erori posibile**: dacă totuși ceva nu merge, verifici direct în
  Netlify → site-ul tău → tab **Functions** → click pe funcția care a dat eroare → vezi log-ul.

## Limite plan gratuit (Netlify, 2026)

- 300 "credite"/lună incluse gratuit — acoperă cu mult o utilizare de tip jurnal de familie
  (câteva zeci de cereri pe zi, nu mii).
- Poze/documente sub ~5MB fiecare (limita per cerere pentru funcțiile Netlify).
- Fără card, fără cost, atât timp cât rămâi sub aceste limite (foarte generoase pentru acest caz).

## De reținut despre PIN

PIN-ul e verificat pe server la fiecare cerere de citire/scriere a datelor text (itinerar, note)
și la încărcarea/ștergerea de poze și documente. Rămâne un filtru simplu, nu o parolă criptată —
suficient să țină departe pe oricine nu are linkul și PIN-ul, dar nu protecție de nivel bancar.

O mică notă tehnică: afișarea propriu-zisă a unei poze/document (adică deschiderea linkului
`/api/files?id=...` într-un tag `<img>`) nu cere PIN, ca poza să se poată încărca direct în
pagină — dar ID-urile sunt aleatorii și lungi, deci practic imposibil de ghicit fără acces
la jurnal.

## Modificări ulterioare

Editează `index.html` sau fișierele din `netlify/functions/`, apoi:
```
netlify deploy --prod
```

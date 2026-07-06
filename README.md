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

## Pas 4 — Configurare manuală Netlify Blobs (necesară în unele cazuri)

Din cauza unei probleme cunoscute la Netlify (detectarea automată a contextului Blobs nu
funcționează mereu la deploy-uri făcute prin linia de comandă), codul din acest proiect
folosește configurare manuală. Ai nevoie de:

1. **User settings → Applications → New access token** → generezi un token, îl copiezi
2. Pe site-ul tău → **Project configuration → Environment variables → Add a variable**
   → key: `BLOBS_TOKEN`, value: token-ul copiat
3. Redeployează: `netlify deploy --prod`

Dacă la deploy-ul inițial funcțiile merg deja fără eroare, poți sări peste acest pas.

## Pas 5 — Deschide linkul, trimite-l grupului

Oricine deschide linkul intră direct în jurnal — nu mai există ecran de PIN.

---

## De ce e mai simplu decât Vercel

- **Zero pași de storage la configurarea inițială.** Nu există echivalentul „Storage →
  Marketplace → Upstash → conectează → verifică variabilele".
- **Un singur loc de erori posibile**: dacă ceva nu merge, verifici direct în
  Netlify → site-ul tău → tab **Logs → Functions** → click pe funcția care a dat eroare.

## Limite plan gratuit (Netlify, 2026)

- 300 "credite"/lună incluse gratuit — acoperă cu mult o utilizare de tip jurnal de familie
  (câteva zeci de cereri pe zi, nu mii).
- Poze/documente sub ~5MB fiecare (limita per cerere pentru funcțiile Netlify).
- Fără card, fără cost, atât timp cât rămâi sub aceste limite (foarte generoase pentru acest caz).

## De reținut — FĂRĂ PIN

Această variantă nu mai are niciun filtru de acces. Oricine găsește linkul poate vedea,
edita sau șterge orice din jurnal (itinerar, note, poze, documente). E o alegere conștientă
pentru simplitate — dacă vrei un filtru minim mai târziu, se poate adăuga din nou.

## Modificări ulterioare

Editează `index.html` sau fișierele din `netlify/functions/`, apoi:
```
netlify deploy --prod
```

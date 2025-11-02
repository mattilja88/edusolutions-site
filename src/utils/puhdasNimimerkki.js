// utils/puhdasNimimerkki.js
//
// Tarkistaa, onko nimimerkki sallittu ja siistii/estää rumat sanat.
// Palauttaa: { ok: boolean, reason?: string }

export function puhdasNimimerkki(nimi) {
    if (!nimi || typeof nimi !== "string") {
      return { ok: false, reason: "Nimimerkki puuttuu." };
    }
  
    const cleanName = nimi.trim().toLowerCase();
  
    // liian lyhyt / pitkä
    if (cleanName.length < 2) {
      return { ok: false, reason: "Nimimerkki on liian lyhyt." };
    }
    if (cleanName.length > 20) {
      return { ok: false, reason: "Nimimerkki on liian pitkä." };
    }
  
    // sallitut merkit: kirjaimet, numerot, _, -
    if (!/^[a-z0-9_\-äöå]+$/i.test(nimi)) {
      return { ok: false, reason: "Nimimerkki sisältää kiellettyjä merkkejä." };
    }
  
    // laaja lista suomeksi ja englanniksi
    const forbidden = [
      // suomi
      "vittu","vitun","vitut","vitussa","vittuun","vittua","perse","perseet",
      "perkele","jumalauta","helvetti","paska","paskat","paskaa","homo","huora",
      "idiotti","idiootti","retardi","kusipää","kyrpä","kyrpa","pillu","mulkku",
      "luuseri","saatana","kuole","tapa","tapan","nekro","neekeri","natsi","nazi",
      // englanti
      "fuck","fucking","fucker","shit","shitty","ass","arse","bitch","bastard",
      "cunt","dick","dicks","cock","suck","sucker","slut","whore","nigger",
      "retard","kill","murder","suicide","die","gay","pedo","rapist",
      // muita ilkeitä muotoja
      "fuk","phuk","biatch","damn","wtf","stfu"
    ];
  
    // jos löytyy rumasana osana (ei vain täydellisenä sanana)
    for (const w of forbidden) {
      if (cleanName.includes(w)) {
        return { ok: false, reason: "Nimimerkki sisältää sopimattomia sanoja." };
      }
    }
  
    return { ok: true };
  }
  
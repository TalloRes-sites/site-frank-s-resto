// Default privacy policy per language, filled with the restaurant's company details.
// TalloRes provides and maintains this text (hand-off open question 14); restaurants do not edit it.
// Statements here must stay true for the site: no cookies, no trackers, map only after a click.
import type { Lang, RestaurantData } from './types';

export interface PrivacySection { title: string; body: string[] }
export interface PrivacyText { title: string; back: string; sections: PrivacySection[] }

type Builder = (r: RestaurantData, addr: string, dpa: string) => PrivacyText;

const NL: Builder = (r, addr, dpa) => ({
  title: 'Privacybeleid', back: 'Terug naar de website',
  sections: [
    { title: 'Wie zijn wij', body: [`${r.company.name} (${r.company.enterpriseNumber}), ${addr}, is verantwoordelijk voor de verwerking van je persoonsgegevens via deze website. Je bereikt ons op ${r.email} of ${r.phone}.`] },
    { title: 'Geen cookies, geen trackers', body: ['Deze website plaatst geen cookies en gebruikt geen advertentie- of analysetrackers.'] },
    { title: 'Reservaties', body: ['Reserveer je via deze website, dan verwerken we je naam, contactgegevens, het aantal personen, het tijdstip en eventuele opmerkingen om je reservatie te beheren. Het reservatiesysteem wordt aangeboden door TalloRes, dat deze gegevens in onze opdracht verwerkt. We bewaren ze niet langer dan nodig voor je bezoek en onze wettelijke verplichtingen.'] },
    { title: 'Kaart en externe diensten', body: ['De kaart wordt pas geladen als je erop klikt. Op dat moment ontvangt OpenStreetMap je IP-adres. Cadeaubonnen en menukaarten kunnen via externe diensten worden aangeboden.'] },
    { title: 'Hosting', body: ['De website wordt gehost door Cloudflare. Voor de beveiliging en werking van de website worden technische gegevens zoals je IP-adres kortstondig verwerkt.'] },
    { title: 'Je rechten', body: [`Je hebt het recht op inzage, verbetering en verwijdering van je gegevens, en om bezwaar te maken tegen de verwerking. Neem hiervoor contact op via ${r.email}. Je kan ook een klacht indienen bij ${dpa}.`] },
  ],
});

const FR: Builder = (r, addr, dpa) => ({
  title: 'Politique de confidentialité', back: 'Retour au site',
  sections: [
    { title: 'Qui sommes-nous', body: [`${r.company.name} (${r.company.enterpriseNumber}), ${addr}, est responsable du traitement de vos données personnelles via ce site. Vous pouvez nous joindre à ${r.email} ou au ${r.phone}.`] },
    { title: 'Pas de cookies, pas de traceurs', body: ["Ce site ne dépose pas de cookies et n'utilise aucun traceur publicitaire ou analytique."] },
    { title: 'Réservations', body: ["Si vous réservez via ce site, nous traitons votre nom, vos coordonnées, le nombre de personnes, l'heure et vos éventuelles remarques pour gérer votre réservation. Le système de réservation est fourni par TalloRes, qui traite ces données pour notre compte. Nous ne les conservons pas plus longtemps que nécessaire pour votre visite et nos obligations légales."] },
    { title: 'Carte et services externes', body: ["La carte ne se charge qu'après un clic. À ce moment, OpenStreetMap reçoit votre adresse IP. Les bons cadeaux et les cartes peuvent être proposés via des services externes."] },
    { title: 'Hébergement', body: ['Le site est hébergé par Cloudflare. Pour la sécurité et le fonctionnement du site, des données techniques comme votre adresse IP sont traitées brièvement.'] },
    { title: 'Vos droits', body: [`Vous avez le droit d'accéder à vos données, de les rectifier, de les supprimer et de vous opposer à leur traitement. Contactez-nous à ${r.email}. Vous pouvez aussi introduire une plainte auprès de ${dpa}.`] },
  ],
});

const EN: Builder = (r, addr, dpa) => ({
  title: 'Privacy policy', back: 'Back to the website',
  sections: [
    { title: 'Who we are', body: [`${r.company.name} (${r.company.enterpriseNumber}), ${addr}, is responsible for processing your personal data through this website. You can reach us at ${r.email} or ${r.phone}.`] },
    { title: 'No cookies, no trackers', body: ['This website sets no cookies and uses no advertising or analytics trackers.'] },
    { title: 'Reservations', body: ['When you book through this website, we process your name, contact details, party size, time and any remarks to manage your reservation. The booking system is provided by TalloRes, which processes this data on our behalf. We keep it no longer than needed for your visit and our legal obligations.'] },
    { title: 'Map and external services', body: ['The map only loads after you click it. At that moment OpenStreetMap receives your IP address. Gift vouchers and menus may be offered through external services.'] },
    { title: 'Hosting', body: ['The website is hosted by Cloudflare. Technical data such as your IP address is processed briefly for the security and operation of the website.'] },
    { title: 'Your rights', body: [`You have the right to access, correct and delete your data, and to object to its processing. Contact us at ${r.email}. You can also lodge a complaint with ${dpa}.`] },
  ],
});

const BUILDERS: Partial<Record<Lang, Builder>> = { nl: NL, fr: FR, en: EN };

/** Data protection authority per country (ISO code from restaurant.address.country). */
const DPA: Record<string, Partial<Record<Lang, string>>> = {
  BE: {
    nl: 'de Gegevensbeschermingsautoriteit (www.gegevensbeschermingsautoriteit.be)',
    fr: "l'Autorité de protection des données (www.autoriteprotectiondonnees.be)",
    en: 'the Belgian Data Protection Authority (www.dataprotectionauthority.be)',
  },
  NL: {
    nl: 'de Autoriteit Persoonsgegevens (www.autoriteitpersoonsgegevens.nl)',
    fr: "l'Autoriteit Persoonsgegevens (www.autoriteitpersoonsgegevens.nl)",
    en: 'the Dutch Data Protection Authority (www.autoriteitpersoonsgegevens.nl)',
  },
};
const DPA_FALLBACK: Partial<Record<Lang, string>> = {
  nl: 'de gegevensbeschermingsautoriteit van je land',
  fr: "l'autorité de protection des données de votre pays",
  en: 'the data protection authority in your country',
};

/** Privacy text in a language; languages without a text fall back to English. */
export function privacyText(r: RestaurantData, lang: Lang): PrivacyText {
  const l: Lang = BUILDERS[lang] ? lang : 'en';
  const addr = `${r.address.street}, ${r.address.postalCode} ${r.address.city}`;
  const dpa = DPA[r.address.country]?.[l] ?? DPA_FALLBACK[l]!;
  return BUILDERS[l]!(r, addr, dpa);
}

import type { Lang } from './types';

/** Fixed template labels, translated by TalloRes (not editable by the restaurant). Unknown languages fall back to English. */
export interface Labels {
  navAbout: string; navMenu: string; navInfo: string; navContact: string;
  reserve: string; reserveTable: string; buyVoucher: string;
  today: string; todayOpen: string; todayClosed: string; openUntil: string; allHours: string;
  closed: string; closedOn: string; and: string;
  route: string; showMap: string; mapNote: string;
  viewMenu: string; updatedOn: string; pdf: string;
  privacy: string; madeBy: string;
  /** {n} = party size, {phone} = phone number */
  groupLine: string;
  days: [string, string, string, string, string, string, string];
  chooseLanguage: string; close: string;
}

const NL: Labels = {
  navAbout: 'Over ons', navMenu: 'Menukaart', navInfo: 'Info', navContact: 'Contact',
  reserve: 'Reserveren', reserveTable: 'Reserveer een tafel', buyVoucher: 'Cadeaubon kopen',
  today: 'Vandaag', todayOpen: 'Vandaag open', todayClosed: 'Vandaag gesloten', openUntil: 'Open tot', allHours: 'Alle uren',
  closed: 'Gesloten', closedOn: 'Gesloten op', and: 'en',
  route: 'Route plannen', showMap: 'Kaart tonen', mapNote: 'De kaart laadt pas na een klik, zonder cookies',
  viewMenu: 'Bekijk de kaart (PDF)', updatedOn: 'Bijgewerkt op', pdf: 'PDF',
  privacy: 'Privacybeleid', madeBy: 'Website door TalloRes',
  groupLine: 'Meer dan {n} personen? Bel ons op {phone}.',
  days: ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'],
  chooseLanguage: 'Taal kiezen', close: 'Sluiten',
};
const FR: Labels = {
  navAbout: 'À propos', navMenu: 'La carte', navInfo: 'Infos', navContact: 'Contact',
  reserve: 'Réserver', reserveTable: 'Réserver une table', buyVoucher: 'Acheter un bon cadeau',
  today: "Aujourd'hui", todayOpen: "Ouvert aujourd'hui", todayClosed: "Fermé aujourd'hui", openUntil: "Ouvert jusqu'à", allHours: 'Tous les horaires',
  closed: 'Fermé', closedOn: 'Fermé le', and: 'et',
  route: 'Itinéraire', showMap: 'Afficher la carte', mapNote: 'La carte ne se charge qu’après un clic, sans cookies',
  viewMenu: 'Voir la carte (PDF)', updatedOn: 'Mis à jour le', pdf: 'PDF',
  privacy: 'Politique de confidentialité', madeBy: 'Site web par TalloRes',
  groupLine: 'Plus de {n} personnes ? Appelez-nous au {phone}.',
  days: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'],
  chooseLanguage: 'Choisir la langue', close: 'Fermer',
};
const EN: Labels = {
  navAbout: 'About', navMenu: 'Menu', navInfo: 'Info', navContact: 'Contact',
  reserve: 'Book', reserveTable: 'Book a table', buyVoucher: 'Buy a gift voucher',
  today: 'Today', todayOpen: 'Open today', todayClosed: 'Closed today', openUntil: 'Open until', allHours: 'All hours',
  closed: 'Closed', closedOn: 'Closed on', and: 'and',
  route: 'Directions', showMap: 'Show map', mapNote: 'The map only loads after a click, without cookies',
  viewMenu: 'View the menu (PDF)', updatedOn: 'Updated on', pdf: 'PDF',
  privacy: 'Privacy policy', madeBy: 'Website by TalloRes',
  groupLine: 'More than {n} people? Call us on {phone}.',
  days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  chooseLanguage: 'Choose language', close: 'Close',
};

const ALL: Partial<Record<Lang, Labels>> = { nl: NL, fr: FR, en: EN };

/** TODO(TalloRes): add de, es, it, ... through the shared translation files. */
export const labels = (lang: Lang): Labels => ALL[lang] ?? EN;

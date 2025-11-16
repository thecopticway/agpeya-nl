// Koptische Kalender Datum Conversie en Hulpfuncties

export interface CopticDate {
  day: number;
  month: number; // 1-13 (Thoout t/m Nesi)
  year: number;
}

// Koptische maandnamen (13 maanden)
export const COPTIC_MONTHS = [
  'Thoout',    // 1: 11 sep - 10 okt
  'Paope',     // 2: 11 okt - 9 nov
  'Hathor',    // 3: 10 nov - 9 dec
  'Kiahk',     // 4: 10 dec - 8 jan
  'Tobi',      // 5: 9 jan - 7 feb
  'Meshir',    // 6: 8 feb - 9 mrt
  'Paremhat',  // 7: 10 mrt - 8 apr
  'Parmouti',  // 8: 9 apr - 8 mei
  'Pashons',   // 9: 9 mei - 7 jun
  'Paoni',     // 10: 8 jun - 7 jul
  'Epip',      // 11: 8 jul - 6 aug
  'Mesori',    // 12: 7 aug - 5 sep
  'Nesi'       // 13: 6 sep - 10 sep (5-6 dagen)
];

// Koptische dagnamen
export const COPTIC_DAYS = [
  'Zondag',
  'Maandag',
  'Dinsdag',
  'Woensdag',
  'Donderdag',
  'Vrijdag',
  'Zaterdag'
];

/**
 * Bereken de Koptische datum vanaf een Gregoriaanse datum
 * @param gregorianDate - Gregoriaanse datum
 * @returns CopticDate object
 */
export function calculateCopticDate(gregorianDate: Date = new Date()): CopticDate {
  const year = gregorianDate.getFullYear();
  
  // Bepaal wanneer het Koptische nieuwjaar begint (11 sept of 12 sept in schrikkeljaar)
  const isGregorianLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  const newYearDay = isGregorianLeapYear ? 12 : 11;
  
  // Koptisch nieuwjaar start op 11/12 september
  const copticNewYear = new Date(year, 8, newYearDay); // 8 = september (0-indexed)
  
  let copticYear: number;
  let daysSinceNewYear: number;
  
  if (gregorianDate >= copticNewYear) {
    // We zijn na het Koptische nieuwjaar van dit jaar
    copticYear = year - 283; // Gregoriaans jaar - 283 = Koptisch jaar
    daysSinceNewYear = Math.floor((gregorianDate.getTime() - copticNewYear.getTime()) / (1000 * 60 * 60 * 24));
  } else {
    // We zijn voor het Koptische nieuwjaar, dus vorig Koptisch jaar
    copticYear = year - 284;
    const prevNewYear = new Date(year - 1, 8, isGregorianLeapYear ? 12 : 11);
    daysSinceNewYear = Math.floor((gregorianDate.getTime() - prevNewYear.getTime()) / (1000 * 60 * 60 * 24));
  }
  
  // Bereken de maand en dag in de Koptische kalender
  // Elke maand heeft 30 dagen behalve Nesi (maand 13) met 5-6 dagen
  let copticMonth = 1;
  let copticDay = daysSinceNewYear + 1;
  
  // Trek volle maanden af tot we in de juiste maand zitten
  while (copticDay > 30 && copticMonth < 13) {
    copticDay -= 30;
    copticMonth++;
  }
  
  // Nesi (maand 13) heeft slechts 5 of 6 dagen
  if (copticMonth === 13) {
    const isCopticLeapYear = copticYear % 4 === 3;
    const nesiDays = isCopticLeapYear ? 6 : 5;
    if (copticDay > nesiDays) {
      // We zijn in het volgende jaar
      copticDay = 1;
      copticMonth = 1;
      copticYear++;
    }
  }
  
  return {
    day: copticDay,
    month: copticMonth,
    year: copticYear
  };
}

/**
 * Geef de naam van de huidige Koptische maand
 */
export function getCurrentCopticMonthName(): string {
  const copticDate = calculateCopticDate();
  return COPTIC_MONTHS[copticDate.month - 1] || 'Onbekend';
}

/**
 * Geef de naam van een Koptische maand op basis van maandnummer
 */
export function getCopticMonthName(monthNumber: number): string {
  if (monthNumber < 1 || monthNumber > 13) {
    return 'Onbekend';
  }
  return COPTIC_MONTHS[monthNumber - 1];
}

/**
 * Bereken het begin van het huidige Koptische jaar
 */
export function getCopticYearStart(copticYear?: number): Date {
  const currentCoptic = calculateCopticDate();
  const yearToUse = copticYear || currentCoptic.year;
  const gregorianYear = yearToUse + 283;
  
  const isGregorianLeapYear = (gregorianYear % 4 === 0 && gregorianYear % 100 !== 0) || (gregorianYear % 400 === 0);
  const newYearDay = isGregorianLeapYear ? 12 : 11;
  
  return new Date(gregorianYear, 8, newYearDay); // 8 = september
}

/**
 * Geef de naam van de dag in het Nederlands
 */
export function getCopticDayName(date: Date = new Date()): string {
  return COPTIC_DAYS[date.getDay()];
}

/**
 * Converteer een Koptische datum naar Gregoriaanse datum
 */
export function copticToGregorian(copticDay: number, copticMonth: number, copticYear: number): Date {
  const gregorianYear = copticYear + 283;
  const isGregorianLeapYear = (gregorianYear % 4 === 0 && gregorianYear % 100 !== 0) || (gregorianYear % 400 === 0);
  const newYearDay = isGregorianLeapYear ? 12 : 11;
  
  // Begin van het Koptische jaar
  const copticNewYear = new Date(gregorianYear, 8, newYearDay);
  
  // Bereken aantal dagen sinds nieuwjaar
  let daysSinceNewYear = 0;
  
  // Tel alle volledige maanden op (elke maand heeft 30 dagen)
  for (let m = 1; m < copticMonth; m++) {
    daysSinceNewYear += 30;
  }
  
  // Tel de dagen in de huidige maand op
  daysSinceNewYear += copticDay - 1;
  
  // Voeg dagen toe aan het Koptische nieuwjaar
  const result = new Date(copticNewYear);
  result.setDate(copticNewYear.getDate() + daysSinceNewYear);
  
  return result;
}

/**
 * Format een Koptische datum als string
 */
export function formatCopticDate(copticDate: CopticDate): string {
  return `${copticDate.day} ${getCopticMonthName(copticDate.month)} ${copticDate.year}`;
}

/**
 * Controleer of een jaar een Koptisch schrikkeljaar is
 */
export function isCopticLeapYear(copticYear: number): boolean {
  return copticYear % 4 === 3;
}

/**
 * Bereken het aantal dagen in een Koptische maand
 */
export function getDaysInCopticMonth(month: number, year: number): number {
  if (month < 1 || month > 13) {
    return 0;
  }
  
  if (month === 13) {
    // Nesi heeft 5 of 6 dagen
    return isCopticLeapYear(year) ? 6 : 5;
  }
  
  return 30; // Alle andere maanden hebben 30 dagen
}

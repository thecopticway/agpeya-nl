import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "./ui/button";

interface CopticCalendarProps {
  isDarkMode: boolean;
  onOpenCalendar?: () => void;
}

interface CopticDate {
  day: number;
  month: string;
  monthNumber: number;
  year: number;
  season: string;
}

const copticMonths = [
  "Thoout", "Paope", "Hathor", "Kiahk", 
  "Tobi", "Meshir", "Paremhat", "Parmouti",
  "Pashons", "Paoni", "Epip", "Mesori", "Nesi"
];

const copticSeasons = [
  { name: "Seizoen van de Overstromingen", months: [1, 2, 3, 4] },
  { name: "Seizoen van de Groei", months: [5, 6, 7, 8] },
  { name: "Seizoen van de Oogst", months: [9, 10, 11, 12] },
  { name: "Klein Maand", months: [13] }
];

function getCopticDate(gregorianDate: Date): CopticDate {
  const year = gregorianDate.getFullYear();
  const month = gregorianDate.getMonth() + 1;
  const day = gregorianDate.getDate();
  
  // Koptisch nieuwjaar voor het huidige jaar
  // 1 Thoout 1742 = 11 september 2025
  // Het Koptisch nieuwjaar valt meestal op 11 september (of 12 sept na Gregoriaans schrikkeljaar)
  let copticYear = year - 283;  // 2025 - 283 = 1742
  
  // Check of we voor of na het Koptische nieuwjaar zitten
  const isGregorianLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  const newYearDay = isGregorianLeapYear ? 12 : 11;  // 11 of 12 september
  
  if (month < 9 || (month === 9 && day < newYearDay)) {
    copticYear -= 1;
  }
  
  // Bereken het Koptische nieuwjaar voor dit Koptische jaar
  const copticNewYearDate = new Date(year, 8, newYearDay); // September = maand 8 (0-indexed)
  if (month < 9 || (month === 9 && day < newYearDay)) {
    copticNewYearDate.setFullYear(year - 1);
  }
  
  // Bereken aantal dagen sinds Koptisch nieuwjaar
  const diffTime = gregorianDate.getTime() - copticNewYearDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 2;  // +2 om correcte dag te krijgen
  
  // Bereken Koptische maand en dag (elke maand heeft 30 dagen, behalve Nesi met 5 of 6 dagen)
  let copticMonth = Math.floor((diffDays - 1) / 30) + 1;
  let copticDay = ((diffDays - 1) % 30) + 1;
  
  // Check voor overloop naar volgend jaar
  if (copticMonth > 13) {
    copticMonth = 1;
    copticYear += 1;
    copticDay = diffDays - 365;
  }
  
  const season = copticSeasons.find(s => s.months.includes(copticMonth))?.name || "";
  
  return {
    day: copticDay,
    month: copticMonths[copticMonth - 1],
    monthNumber: copticMonth,
    year: copticYear,
    season: season
  };
}

export function CopticCalendar({ isDarkMode, onOpenCalendar }: CopticCalendarProps) {
  const today = new Date();
  const copticDate = getCopticDate(today);
  
  const gregorianDayName = today.toLocaleDateString('nl-NL', { 
    weekday: 'long'
  });
  
  const gregorianFullDate = today.toLocaleDateString('nl-NL', { 
    day: 'numeric',
    month: 'long', 
    year: 'numeric'
  });

  return (
    <div className={`p-2 rounded-lg border shadow-sm ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* Gregorian Date */}
        <div>
          <p className={`mb-0.5 ${isDarkMode ? 'text-amber-400' : 'text-amber-800'}`}>Gregoriaans</p>
          <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{gregorianDayName}</p>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-[0.65rem]`}>{gregorianFullDate}</p>
        </div>
        
        {/* Coptic Date */}
        <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-amber-50'}`}>
          <p className={`mb-0.5 ${isDarkMode ? 'text-amber-400' : 'text-amber-800'}`}>Koptisch</p>
          <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-[0.7rem]`}>
            {copticDate.day} {copticDate.month} {copticDate.year}
          </p>
        </div>
      </div>
      {onOpenCalendar && (
        <div className="mt-1.5 flex justify-center">
          <Button
            onClick={onOpenCalendar}
            variant="outline"
            size="sm"
            className={`h-8 px-2 text-[0.7rem] ${isDarkMode ? 'bg-amber-900/30 border-amber-700 hover:bg-amber-900/50 text-amber-300' : 'bg-amber-50 border-amber-300 hover:bg-amber-100 text-amber-800'}`}
          >
            <CalendarIcon className="size-3 mr-1.5" />
            Heiligen & Feestdagen
          </Button>
        </div>
      )}
    </div>
  );
}
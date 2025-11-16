import { useState } from "react";
import { Button } from "./components/ui/button";
import { PrayerReader } from "./components/PrayerReader";
import { PWATools } from "./components/PWATools";
import { CalendarView } from "./components/CalendarView";
import { CalendarToday } from "./components/CalendarToday";
import { CalendarFull } from "./components/CalendarFull";
import { CopticCalendar } from "./components/CopticCalendar";
import { HourCard } from "./components/HourCard";
import { InstallPrompt } from "./components/InstallPrompt";
import { Toaster } from "./components/ui/sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./components/ui/collapsible";
import { Sun, Moon, Info } from "lucide-react";
import { agpeyaHours, PrayerHour } from "./data/prayers-new";
import { agpeyaInfo } from "./data/agpeya-info";
import "./styles/globals.css";

// Import images
import bisdomLogo from "./imports/bisdom-logo";
import copticCross from "./imports/coptic-cross";

export default function App() {
  const [selectedHour, setSelectedHour] = useState<PrayerHour | null>(null);
  const [showPWATools, setShowPWATools] = useState(false);
  const [showCalendarToday, setShowCalendarToday] = useState(false);
  const [showCalendarFull, setShowCalendarFull] = useState(false);
  const [showCalendarView, setShowCalendarView] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("agpeya-theme");
    return saved === "dark";
  });
  const [hours] = useState<PrayerHour[]>(agpeyaHours);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem("agpeya-theme", newMode ? "dark" : "light");
  };

  // PWA Tools View
  if (showPWATools) {
    return (
      <PWATools 
        onBack={() => setShowPWATools(false)}
        isDarkMode={isDarkMode}
      />
    );
  }

  // Calendar Today View
  if (showCalendarToday) {
    return (
      <CalendarToday 
        onBack={() => setShowCalendarToday(false)}
        onNavigateToFullCalendar={() => {
          setShowCalendarToday(false);
          setShowCalendarFull(true);
        }}
        isDarkMode={isDarkMode}
      />
    );
  }

  // Calendar Full View
  if (showCalendarFull) {
    return (
      <CalendarFull 
        onBack={() => {
          setShowCalendarFull(false);
          setShowCalendarToday(true);
        }}
        isDarkMode={isDarkMode}
      />
    );
  }

  // Calendar View (Feesten & Vastentijden)
  if (showCalendarView) {
    return (
      <CalendarView 
        isDarkMode={isDarkMode}
        onClose={() => setShowCalendarView(false)}
      />
    );
  }

  if (selectedHour) {
    return (
      <PrayerReader 
        hour={selectedHour} 
        onBack={() => setSelectedHour(null)}
        allHours={hours}
        onNavigateToHour={(hour) => setSelectedHour(hour)}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        onOpenPWATools={() => {
          setSelectedHour(null);
          setShowPWATools(true);
        }}
      />
    );
  }

  return (
    <div className={`min-h-screen relative ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-amber-50 to-white'}`}>
      {/* Toaster for notifications */}
      <Toaster />
      
      {/* Install Prompt */}
      <InstallPrompt />
      
      {/* Background Pattern */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `url(${copticCross})`,
          backgroundRepeat: 'repeat',
          backgroundSize: '1.5cm 1.5cm',
          opacity: 0.10,
          zIndex: 0
        }}
      />
      
      {/* Main Container with max-width for tablets/desktop */}
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className={`border-b shadow-sm relative z-10 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <div className="px-3 py-4 text-center relative">
            <div className="flex items-center justify-center gap-3">
              <img src={copticCross} alt="Koptisch Kruis" className="size-12" />
              <h1 
                className={`text-3xl ${isDarkMode ? 'text-amber-400' : 'text-amber-800'}`} 
                style={{ 
                  fontFamily: 'Cinzel, serif', 
                  letterSpacing: '0.1em', 
                  fontWeight: 700,
                  textShadow: isDarkMode 
                    ? '0 2px 4px rgba(0,0,0,0.3), 0 0 20px rgba(251,191,36,0.15)' 
                    : '0 2px 4px rgba(0,0,0,0.08), 0 1px 2px rgba(146,64,14,0.2)',
                  fontFeatureSettings: '"liga" 1, "dlig" 1',
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale'
                }}
              >
                AGPEYA
              </h1>
              <img src={copticCross} alt="Koptisch Kruis" className="size-12" />
            </div>
            <p className={`mt-1 tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} whitespace-nowrap`} style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem' }}>
              KOPTISCH-ORTHODOX BISDOM NEDERLAND
            </p>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="absolute top-2 right-2 size-10"
            >
              {isDarkMode ? <Sun className="size-6 text-gray-200" /> : <Moon className="size-6" />}
            </Button>
          </div>
        </div>
        
        {/* Coptic Calendar Section */}
        <div className="px-3 pt-3 relative z-10">
          <CopticCalendar 
            isDarkMode={isDarkMode}
            onOpenCalendar={() => setShowCalendarView(true)}
          />
        </div>

        {/* Prayer Hours Grid */}
        <div className="px-3 py-3 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-3">
            {hours.map((hour) => (
              <HourCard
                key={hour.id}
                name={hour.name}
                copticName={hour.copticName}
                time={hour.time}
                description={hour.description}
                onClick={() => setSelectedHour(hour)}
                isDarkMode={isDarkMode}
              />
            ))}
            
            {/* Bisdom Logo - rechts onderaan na alle gebedstijden */}
            <div className="p-3 flex items-center justify-center">
              <img 
                src={bisdomLogo} 
                alt="Koptisch-Orthodox Bisdom Nederland" 
                style={{
                  width: '2cm',
                  height: '2cm',
                  objectFit: 'contain',
                  filter: isDarkMode 
                    ? 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.7)) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5)) drop-shadow(0 0 20px rgba(218, 165, 32, 0.3))'
                    : 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.25)) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15)) drop-shadow(0 0 20px rgba(218, 165, 32, 0.2))'
                }}
              />
            </div>
          </div>
          
          {/* Over de Agpeya knop - aan het einde van het voorblad */}
          <div className="mt-2 mb-4">
            <Collapsible open={isInfoOpen} onOpenChange={setIsInfoOpen}>
              <CollapsibleTrigger asChild>
                <button className={`w-full h-10 p-2 rounded-lg border shadow-sm flex items-center justify-between transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                    : 'bg-white hover:bg-gray-50'
                }`}>
                  <div className="flex items-center gap-2">
                    <Info className={`size-4 ${isDarkMode ? 'text-amber-500' : 'text-amber-700'}`} />
                    <span className={`text-sm ${isDarkMode ? 'text-amber-400' : 'text-amber-800'}`}>Over de Agpeya</span>
                  </div>
                  <span className={`text-xs ${isDarkMode ? 'text-amber-500' : 'text-amber-600'}`}>
                    {isInfoOpen ? '−' : '+'}
                  </span>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className={`mt-2 p-3 rounded-lg border shadow-sm ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'
                }`}>
                  <p className={`mb-3 text-xs ${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`}>
                    {agpeyaInfo.introduction}
                  </p>
                  <div className="space-y-2 text-xs">
                    {agpeyaInfo.sections.map((section, index) => (
                      <div key={index}>
                        <p className={`mb-1 ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>{section.title}</p>
                        <div className={`space-y-0.5 pl-4 ${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`}>
                          {section.content.split('\n').map((line, lineIndex) => (
                            <p key={lineIndex}>{line}</p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </div>
    </div>
  );
}
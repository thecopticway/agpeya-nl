import { useState, useRef, useEffect, useCallback } from "react";
import { Minus, Plus, Sun, Moon, Menu, Home, List, Settings, Wrench, Edit3 } from "lucide-react";
import { useSwipe } from "../hooks/useSwipe";
import { PrayerHour, Prayer } from "../data/prayers-new";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "./ui/sheet";
import { ScrollArea } from "./ui/scroll-area";
import copticCross from "../imports/coptic-cross";

// Koptische termen die vet moeten worden gemaakt
const COPTIC_TERMS = [
  'Ⲁⲙⲏⲛ',
  'Ⲭⲉⲣⲉ',
  'Ⲁⲗⲗⲏⲗⲟⲩⲓⲁ'
];

// Nederlandse termen die vet moeten worden gemaakt
const BOLD_TERMS = [
  'Genade en vrede zij u',
  'Vrede zij met u allen',
  'Met uw geest',
  'En met uw geest',
  'Amen',
  'Alleluia',
  'Kyrie eleison',
  'Heer, ontferm U',
  'Heilig, heilig, heilig',
  'Onze Vader',
  'In de Naam van de Vader',
  'Glorie zij aan de Vader'
];

interface PrayerReaderProps {
  hour: PrayerHour;
  onBack: () => void;
  allHours: PrayerHour[];
  onNavigateToHour: (hour: PrayerHour) => void;
  isDarkMode?: boolean;
  toggleTheme?: () => void;
  onOpenPWATools?: () => void;
}

export function PrayerReader({ hour, onBack, allHours, onNavigateToHour, isDarkMode, toggleTheme, onOpenPWATools }: PrayerReaderProps) {
  const [fontSize, setFontSize] = useState(() => {
    // Laad opgeslagen fontSize uit localStorage, of gebruik 16 als default
    const saved = localStorage.getItem('agpeya-font-size');
    return saved ? parseInt(saved, 10) : 16;
  });
  const [selectedFont, setSelectedFont] = useState(() => {
    // Laad opgeslagen font uit localStorage, of gebruik 'PT Serif' als default
    const saved = localStorage.getItem('agpeya-font-family');
    return saved || 'PT Serif';
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [customPrayers, setCustomPrayers] = useState<Record<string, Prayer>>({});
  const contentRef = useRef<HTMLDivElement>(null);
  const mainViewportRef = useRef<HTMLDivElement | null>(null);

  // Load custom prayers from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('agpeya-custom-prayers');
    if (saved) {
      try {
        setCustomPrayers(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load custom prayers:', e);
      }
    }
  }, []);

  // Get prayer with custom override if exists
  const getPrayer = (prayer: Prayer): Prayer => {
    const customKey = `${hour.id}-${prayer.id}`;
    return customPrayers[customKey] || prayer;
  };

  // Sla fontSize op in localStorage wanneer deze verandert
  useEffect(() => {
    localStorage.setItem('agpeya-font-size', fontSize.toString());
  }, [fontSize]);

  // Sla geselecteerde font op in localStorage wanneer deze verandert
  useEffect(() => {
    localStorage.setItem('agpeya-font-family', selectedFont);
  }, [selectedFont]);

  // Scroll naar boven wanneer het uur verandert
  useEffect(() => {
    console.log('🔄 Uur veranderd naar:', hour.id);
    
    if (contentRef.current) {
      console.log('✅ Scroll naar boven via contentRef');
      contentRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
    
    // Extra fallback: scroll het window ook
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [hour.id]);

  // Swipe handlers met useCallback voor stabiele referenties
  const handleSwipeRight = useCallback(() => {
    if (!isMenuOpen && !isSettingsOpen && !isTocOpen) {
      setIsMenuOpen(true);
    }
  }, [isMenuOpen, isSettingsOpen, isTocOpen]);

  const handleSwipeLeft = useCallback(() => {
    if (!isMenuOpen && !isSettingsOpen && !isTocOpen) {
      setIsTocOpen(true);
    }
  }, [isMenuOpen, isSettingsOpen, isTocOpen]);

  // Swipe functionaliteit
  useSwipe({
    onSwipeRight: handleSwipeRight,
    onSwipeLeft: handleSwipeLeft
  });

  // Functie om specifieke teksten vet te maken en Koptische lettertypen toe te passen
  const formatPrayerContent = (content: string) => {
    let formattedContent = content;
    
    // Pas eerst Koptische lettertypen toe (gewoon vet maken, geen speciale font meer)
    COPTIC_TERMS.forEach(term => {
      const escapedTerm = term.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
      const regex = new RegExp(escapedTerm, 'g');
      formattedContent = formattedContent.replace(regex, (match) => 
        `<strong>${match}</strong>`
      );
    });
    
    // Maak Nederlandse termen vet
    BOLD_TERMS.forEach(term => {
      // Escape speciale regex karakters (zoals haakjes en punten)
      const escapedTerm = term.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
      // Maak HOOFDLETTERGEVOELIGE match (case-sensitive) - alleen 'g' flag, niet 'gi'
      const regex = new RegExp(escapedTerm, 'g');
      formattedContent = formattedContent.replace(regex, (match) => `<strong>${match}</strong>`);
    });

    return formattedContent;
  };

  // Functie voor HSV-stijl versindeling (psalmen en evangelie)
  const formatVerseContent = (content: string, type: 'psalm' | 'gospel' | 'epistle') => {
    // Splits de content op basis van [vers:nummer] markers
    const versePattern = /\[(\d+)\]([^\[]+)/g;
    let formattedHtml = '';
    let match;
    let lastIndex = 0;
    
    // Controleer of er verse markers zijn
    const hasVerseMarkers = content.includes('[');
    
    if (!hasVerseMarkers) {
      // Geen markers, return de normale formattering
      return formatPrayerContent(content);
    }
    
    // Verwerk alle verzen met markers
    while ((match = versePattern.exec(content)) !== null) {
      // Voeg eventuele tekst vóór het eerste vers toe (zoals "Heilig, heilig, heilig")
      if (lastIndex === 0 && match.index > 0) {
        const preText = content.substring(0, match.index).trim();
        if (preText) {
          formattedHtml += `<div class="verse-intro mb-4">${formatPrayerContent(preText)}</div>`;
        }
      }
      
      const verseNumber = match[1];
      const verseText = match[2].trim();
      
      // Format het vers met superscript nummer
      formattedHtml += `<div class="verse-line mb-2">
        <sup class="verse-number mr-1">${verseNumber}</sup><span class="verse-text">${formatPrayerContent(verseText)}</span>
      </div>`;
      
      lastIndex = versePattern.lastIndex;
    }
    
    // Voeg eventuele tekst na het laatste vers toe (zoals "Glorie zij aan God")
    if (lastIndex < content.length) {
      const postText = content.substring(lastIndex).trim();
      if (postText) {
        formattedHtml += `<div class="verse-outro mt-4">${formatPrayerContent(postText)}</div>`;
      }
    }
    
    return formattedHtml;
  };

  const increaseFontSize = () => {
    setFontSize(Math.min(fontSize + 2, 28));
  };

  const decreaseFontSize = () => {
    setFontSize(Math.max(fontSize - 2, 12));
  };

  const scrollToPrayer = (prayerId: string) => {
    console.log('🟢 scrollToPrayer aangeroepen met ID:', prayerId);
    
    const element = document.getElementById(prayerId);
    console.log('🟡 Element gevonden?', element ? 'JA' : 'NEE');
    
    if (element && contentRef.current) {
      console.log('✅ Probeer scroll binnen contentRef...');
      
      // Bereken de daadwerkelijke header hoogte dynamisch
      const header = document.querySelector('.sticky');
      const headerHeight = header ? header.getBoundingClientRect().height + 32 : 180; // +32px extra ruimte
      
      // Bereken positie binnen de scroll container
      const containerTop = contentRef.current.getBoundingClientRect().top;
      const elementTop = element.getBoundingClientRect().top;
      const relativePosition = elementTop - containerTop;
      const currentScroll = contentRef.current.scrollTop;
      const targetScroll = currentScroll + relativePosition - headerHeight;
      
      console.log(`📏 Header hoogte: ${headerHeight}px`);
      console.log(`📍 Huidige scroll: ${currentScroll}px, Doel: ${targetScroll}px`);
      
      // Scroll binnen de content container
      contentRef.current.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
      
      console.log('✅ Scroll uitgevoerd met header offset!');
    } else {
      console.log('❌ Element of contentRef niet gevonden!');
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-amber-50 to-white'}`}>
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
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className={`border-b shadow-sm sticky top-0 z-20 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              {/* Left Menu Sheet */}
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className={`h-12 w-12 p-0 ${isDarkMode ? 'text-white hover:bg-gray-700' : ''}`}>
                    <Menu className="size-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
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
                  <SheetHeader>
                    <SheetTitle className="flex flex-col items-center gap-2 pt-4">
                      <img 
                        src={copticCross} 
                        alt="Koptisch Kruis" 
                        className="size-16" 
                        style={{
                          filter: isDarkMode 
                            ? 'brightness(1.2) drop-shadow(0 2px 4px rgba(251, 191, 36, 0.5))' 
                            : 'drop-shadow(0 2px 4px rgba(180, 83, 9, 0.3))'
                        }}
                      />
                      <span className={isDarkMode ? 'text-amber-400' : 'text-amber-700'}>Menu</span>
                    </SheetTitle>
                    <SheetDescription className="sr-only">
                      Navigeer tussen gebedsuren
                    </SheetDescription>
                  </SheetHeader>
                  <ScrollArea className="h-[calc(100vh-12rem)]">
                    <div className="mt-6 space-y-2">
                      <div className="flex gap-2 ml-[0.25cm]">
                        <Button
                          variant="outline"
                          className={`w-[1.5cm] h-[1.5cm] p-0 flex items-center justify-center shadow-md cursor-pointer ${isDarkMode ? 'bg-gray-700 border-gray-600 hover:bg-amber-600 hover:border-amber-500 text-white' : 'bg-white border-amber-300 hover:bg-amber-200 hover:border-amber-500'}`}
                          style={{ opacity: 0.90 }}
                          onClick={() => {
                            setIsMenuOpen(false);
                            onBack();
                          }}
                        >
                          <Home className="size-6" />
                        </Button>
                        <Button
                          variant="outline"
                          className={`w-[1.5cm] h-[1.5cm] p-0 flex items-center justify-center shadow-md cursor-pointer ${isDarkMode ? 'bg-gray-700 border-gray-600 hover:bg-amber-600 hover:border-amber-500 text-white' : 'bg-white border-amber-300 hover:bg-amber-200 hover:border-amber-500'}`}
                          style={{ opacity: 0.90 }}
                          onClick={() => {
                            setIsMenuOpen(false);
                            setIsSettingsOpen(true);
                          }}
                        >
                          <Settings className="size-6" />
                        </Button>
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button
                              variant="outline"
                              className={`w-[1.5cm] h-[1.5cm] p-0 flex items-center justify-center shadow-md cursor-pointer ${isDarkMode ? 'bg-gray-700 border-gray-600 hover:bg-amber-600 hover:border-amber-500 text-white' : 'bg-white border-amber-300 hover:bg-amber-200 hover:border-amber-500'}`}
                              style={{ opacity: 0.90 }}
                            >
                              <Wrench className="size-6" />
                            </Button>
                          </SheetTrigger>
                          <SheetContent side="left" className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
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
                            <SheetHeader>
                              <SheetTitle className="flex flex-col items-center gap-2 pt-4">
                                <Wrench className="size-10" />
                                <span className={isDarkMode ? 'text-amber-400' : 'text-amber-700'}>Tools</span>
                              </SheetTitle>
                              <SheetDescription className="sr-only">
                                App hulpmiddelen
                              </SheetDescription>
                            </SheetHeader>
                            <div className="mt-8 space-y-4">
                              {/* PWA Tools Button */}
                              <Button
                                variant="outline"
                                size="lg"
                                onClick={() => {
                                  setIsMenuOpen(false);
                                  onOpenPWATools?.();
                                }}
                                className={`w-full h-16 ${isDarkMode ? 'bg-gray-700 border-gray-600 hover:bg-amber-600 hover:border-amber-500 text-white' : 'bg-white border-amber-300 hover:bg-amber-200 hover:border-amber-500'}`}
                                style={{ opacity: 0.90 }}
                              >
                                <Wrench className="size-5 mr-2" />
                                PWA Tools
                              </Button>
                              
                              <div className={`border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`} />
                              
                              {/* Terug naar Menu knop */}
                              <Button
                                variant="outline"
                                size="lg"
                                onClick={() => {
                                  setIsMenuOpen(true);
                                }}
                                className={`w-full h-12 ${isDarkMode ? 'bg-gray-700 border-gray-600 hover:bg-amber-600 hover:border-amber-500 text-white' : 'bg-white border-amber-300 hover:bg-amber-200 hover:border-amber-500'}`}
                                style={{ opacity: 0.90 }}
                              >
                                <Menu className="size-5 mr-2" />
                                Terug naar Menu
                              </Button>
                            </div>
                          </SheetContent>
                        </Sheet>
                      </div>
                      <div className={`border-t ${isDarkMode ? 'border-white' : 'border-gray-300'}`} />
                      {allHours.filter((h) => h.id !== hour.id).map((h) => (
                        <Button
                          key={h.id}
                          variant="outline"
                          className={`w-full justify-start h-14 shadow-md text-base cursor-pointer transition-all ${isDarkMode ? 'bg-gray-700 border-gray-600 hover:bg-amber-600 hover:border-amber-500 text-white' : 'bg-white border-amber-300 hover:bg-amber-200 hover:border-amber-500'}`}
                          style={{ opacity: 0.90 }}
                          onClick={() => {
                            setIsMenuOpen(false);
                            onNavigateToHour(h);
                          }}
                        >
                          {h.name}
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </SheetContent>
              </Sheet>
              
              {/* Title Section */}
              <div className="text-center flex-1 mx-4">
                {hour.copticName && (
                  <h2 className={`text-2xl ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`} style={{ fontFamily: 'Algerian' }}>{hour.copticName}</h2>
                )}
                <p className={`tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} whitespace-nowrap`} style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem' }}>
                  KOPTISCH-ORTHODOX BISDOM NEDERLAND
                </p>
              </div>
              
              {/* Right TOC Sheet */}
              <Sheet open={isTocOpen} onOpenChange={setIsTocOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className={`h-12 w-12 p-0 ${isDarkMode ? 'text-white hover:bg-gray-700' : ''}`}>
                    <List className="size-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} style={{ opacity: 1.0 }}>
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
                  <SheetHeader>
                    <SheetTitle className="flex flex-col items-center gap-2 pt-4">
                      <img 
                        src={copticCross} 
                        alt="Koptisch Kruis" 
                        className="size-16"
                        style={{
                          filter: isDarkMode 
                            ? 'brightness(1.2) drop-shadow(0 2px 4px rgba(251, 191, 36, 0.5))' 
                            : 'drop-shadow(0 2px 4px rgba(180, 83, 9, 0.3))'
                        }}
                      />
                      <span className={isDarkMode ? 'text-amber-400' : 'text-amber-700'}>Inhoud</span>
                    </SheetTitle>
                    <SheetDescription className="sr-only">
                      Inhoudsopgave van gebeden
                    </SheetDescription>
                  </SheetHeader>
                  <div 
                    className="h-[calc(100vh-10rem)] mt-4 overflow-y-auto"
                    style={{
                      msOverflowStyle: 'none',
                      scrollbarWidth: 'none',
                      WebkitOverflowScrolling: 'touch'
                    }}
                  >
                    <style>{`
                      div[class*="overflow-y-auto"]::-webkit-scrollbar {
                        display: none;
                      }
                    `}</style>
                    <div className="space-y-0 pr-4">
                      {hour.prayers.map((prayer, index) => {
                        const actualPrayer = getPrayer(prayer);
                        return (
                          <button
                            key={prayer.id}
                            type="button"
                            className={`w-full py-3 px-3 cursor-pointer rounded border mb-2 hover:bg-opacity-80 transition-colors text-left ${isDarkMode ? 'border-gray-600 hover:bg-gray-600 hover:border-amber-500 text-white' : 'border-amber-200 hover:bg-amber-100 hover:border-amber-400'}`}
                            onClick={(e) => {
                              console.log('🔴 Knop geklikt voor gebed:', prayer.id);
                              e.stopPropagation();
                              
                              // Sluit EERST de sheet
                              setIsTocOpen(false);
                              
                              // Wacht 300ms en scroll DAN
                              setTimeout(() => {
                                scrollToPrayer(prayer.id);
                              }, 300);
                            }}
                          >
                            <span className="text-base" style={{ fontWeight: 'normal' }}>
                              <span className={`${isDarkMode ? 'text-amber-400' : 'text-amber-600'} mr-2`}>{index + 1}.</span>
                              {actualPrayer.title}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Settings Sheet - Separate from menu */}
        <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <SheetContent side="left" className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} style={{ opacity: 1.0 }}>
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
            <SheetHeader>
              <SheetTitle className="flex flex-col items-center gap-2 pt-4">
                <Settings 
                  className="size-12" 
                  style={{
                    filter: isDarkMode 
                      ? 'brightness(1.2) drop-shadow(0 2px 4px rgba(251, 191, 36, 0.5))' 
                      : 'drop-shadow(0 2px 4px rgba(180, 83, 9, 0.3))'
                  }}
                />
                <span className={isDarkMode ? 'text-amber-400' : 'text-amber-700'}>Instellingen</span>
              </SheetTitle>
              <SheetDescription className="sr-only">
                App instellingen
              </SheetDescription>
            </SheetHeader>
            <div className="mt-8 space-y-8">
              {/* Terug naar Menu knop */}
              <div className="text-center">
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => {
                    setIsSettingsOpen(false);
                    setIsMenuOpen(true);
                  }} 
                  className={`w-full h-12 cursor-pointer ${isDarkMode ? 'bg-gray-700 border-gray-600 hover:bg-amber-600 hover:border-amber-500 text-white' : 'bg-white border-amber-300 hover:bg-amber-200 hover:border-amber-500'}`}
                  style={{ opacity: 0.90 }}
                >
                  <Menu className="size-5 mr-2" />
                  Terug naar Menu
                </Button>
              </div>
              
              <div className={`border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`} />
              
              {/* Tekstgrootte */}
              <div className="text-center">
                <h3 className={`mb-3 text-sm ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>Tekstgrootte</h3>
                <div className="flex items-center gap-3 justify-center">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={decreaseFontSize} 
                    className={`h-12 w-12 p-0 cursor-pointer ${isDarkMode ? 'bg-gray-700 border-gray-600 hover:bg-amber-600 hover:border-amber-500 text-white' : 'bg-white border-amber-300 hover:bg-amber-200 hover:border-amber-500'}`}
                    style={{ opacity: 0.90 }}
                  >
                    <Minus className="size-5" />
                  </Button>
                  <span className={`text-lg w-20 text-center ${isDarkMode ? 'text-white' : ''}`}>{fontSize}px</span>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={increaseFontSize} 
                    className={`h-12 w-12 p-0 cursor-pointer ${isDarkMode ? 'bg-gray-700 border-gray-600 hover:bg-amber-600 hover:border-amber-500 text-white' : 'bg-white border-amber-300 hover:bg-amber-200 hover:border-amber-500'}`}
                    style={{ opacity: 0.90 }}
                  >
                    <Plus className="size-5" />
                  </Button>
                </div>
              </div>
              
              <div className={`border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`} />
              
              {/* Theme Toggle */}
              <div className="text-center">
                <h3 className={`mb-3 text-sm ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>Thema</h3>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => {
                    toggleTheme?.();
                  }} 
                  className={`w-full h-12 cursor-pointer ${isDarkMode ? 'bg-gray-700 border-gray-600 hover:bg-amber-600 hover:border-amber-500 text-white' : 'bg-white border-amber-300 hover:bg-amber-200 hover:border-amber-500'}`}
                  style={{ opacity: 0.90 }}
                >
                  {isDarkMode ? (
                    <>
                      <Sun className="size-5 mr-2" />
                      Lichte modus
                    </>
                  ) : (
                    <>
                      <Moon className="size-5 mr-2" />
                      Donkere modus
                    </>
                  )}
                </Button>
              </div>
              
              <div className={`border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`} />
              
              {/* Font Selection */}
              <div className="text-center">
                <h3 className={`mb-3 text-sm ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>Lettertype</h3>
                <div className="space-y-2">
                  <Button 
                    variant={selectedFont === 'PT Serif' ? 'default' : 'outline'}
                    size="lg"
                    onClick={() => setSelectedFont('PT Serif')} 
                    className={`w-full h-12 cursor-pointer ${
                      selectedFont === 'PT Serif' 
                        ? (isDarkMode ? 'bg-amber-600 hover:bg-amber-700 border-amber-500 text-white' : 'bg-amber-600 hover:bg-amber-700 text-white')
                        : (isDarkMode ? 'bg-gray-500 border-gray-400 hover:bg-amber-500 hover:border-amber-400 text-white' : 'hover:bg-amber-100 hover:border-amber-500')
                    }`}
                    style={{ fontFamily: 'PT Serif, serif' }}
                  >
                    PT Serif
                  </Button>
                  <Button 
                    variant={selectedFont === 'Inter' ? 'default' : 'outline'}
                    size="lg"
                    onClick={() => setSelectedFont('Inter')} 
                    className={`w-full h-12 cursor-pointer ${
                      selectedFont === 'Inter' 
                        ? (isDarkMode ? 'bg-amber-600 hover:bg-amber-700 border-amber-500 text-white' : 'bg-amber-600 hover:bg-amber-700 text-white')
                        : (isDarkMode ? 'bg-gray-500 border-gray-400 hover:bg-amber-500 hover:border-amber-400 text-white' : 'hover:bg-amber-100 hover:border-amber-500')
                    }`}
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Inter
                  </Button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Content */}
        <div className="flex-1 relative">
          <div 
            ref={contentRef} 
            className="h-screen overflow-y-auto pb-20"
            style={{
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <style>{`
              div[class*="overflow-y-auto"]::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            <div className={`p-4 rounded-lg shadow-sm mx-4 my-4 border ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'
            }`} style={{ opacity: 1.0 }}>
              {hour.prayers.map((prayer, index) => {
                const actualPrayer = getPrayer(prayer);
                // Bepaal of we verse formatting moeten gebruiken
                const shouldUseVerseFormat = actualPrayer.verseFormat || actualPrayer.type === 'psalm' || actualPrayer.type === 'gospel';
                
                // Format de content
                let formattedContent;
                if (shouldUseVerseFormat) {
                  // Gebruik verse formatting als het een psalm, gospel of epistle is, OF als verseFormat expliciet is ingesteld
                  const verseType = actualPrayer.type as 'psalm' | 'gospel' | 'epistle';
                  formattedContent = formatVerseContent(actualPrayer.content, verseType || 'psalm');
                } else {
                  // Gebruik normale formatting voor gewone gebeden
                  formattedContent = formatPrayerContent(actualPrayer.content);
                }
                
                return (
                  <div key={prayer.id} id={prayer.id} className={index > 0 ? 'mt-8' : ''}>
                    <h3 
                      className={`mb-4 ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`} 
                      style={{ 
                        fontWeight: 'bold',
                        fontSize: `${fontSize}px`
                      }}
                    >
                      {actualPrayer.title}
                    </h3>
                    <div 
                      className={`${shouldUseVerseFormat ? '' : 'whitespace-pre-wrap'} leading-relaxed ${isDarkMode ? 'text-gray-300' : ''}`}
                      style={{ 
                        fontSize: `${fontSize}px`,
                        fontFamily: selectedFont || hour.fontFamily || undefined
                      }}
                      dangerouslySetInnerHTML={{ __html: formattedContent }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
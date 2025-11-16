// Volledig kalender overzicht met alle heiligen, feestdagen en vastenperiodes

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Home, Calendar as CalendarIcon, Cross, Church, Salad } from 'lucide-react';
import { saints } from '../data/calendar/saints';
import { feasts } from '../data/calendar/feasts';
import { fastingPeriods } from '../data/calendar/fasting';
import copticCrossDecorative from '../imports/coptic-cross';

interface CalendarFullProps {
  onBack: () => void;
  onBackToToday?: () => void;
  isDarkMode?: boolean;
}

export function CalendarFull({ onBack, onBackToToday, isDarkMode }: CalendarFullProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear] = useState(new Date().getFullYear());

  const months = [
    'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
    'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'
  ];

  // Filter data per maand
  const getSaintsForMonth = (month: number) => {
    return saints.filter(s => s.month === month).sort((a, b) => a.day - b.day);
  };

  const getFeastsForMonth = (month: number) => {
    return feasts.filter(f => !f.isMoveable && f.month === month).sort((a, b) => a.day - b.day);
  };

  const getFeastTypeLabel = (type: string) => {
    switch (type) {
      case 'lord': return 'Heerlijk Feest';
      case 'major': return 'Groot Feest';
      case 'minor': return 'Klein Feest';
      default: return 'Feest';
    }
  };

  const getFeastTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'lord': 
        return isDarkMode ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-700';
      case 'major':
        return isDarkMode ? 'bg-amber-900/50 text-amber-300' : 'bg-amber-100 text-amber-700';
      case 'minor':
        return isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700';
      default:
        return isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className={`min-h-screen flex flex-col relative ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-amber-50 to-white'}`}>
      {/* Background Pattern */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `url(${copticCrossDecorative})`,
          backgroundRepeat: 'repeat',
          backgroundSize: '300px 300px',
          opacity: isDarkMode ? 0.02 : 0.03,
          zIndex: 0,
          willChange: 'transform'
        }}
      />

      {/* Header */}
      <div className={`border-b shadow-sm sticky top-0 z-10 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className={`h-14 w-14 p-0 ${isDarkMode ? 'text-white hover:bg-gray-700' : ''}`}
            >
              <Home className="size-8" />
            </Button>
            
            <div className="text-center flex-1 mx-4">
              <h2 className={isDarkMode ? 'text-amber-400' : 'text-amber-700'}>Koptische Kalender</h2>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {selectedYear}
              </p>
            </div>

            <div className="w-14" /> {/* Spacer for alignment */}
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 relative z-10">
        <div className="px-4 py-6">
          <Tabs defaultValue="saints" className="w-full">
            <TabsList className={`grid w-full grid-cols-3 mb-6 ${isDarkMode ? 'bg-gray-800' : ''}`}>
              <TabsTrigger value="saints" className={isDarkMode ? 'data-[state=active]:bg-gray-700' : ''}>
                <Cross className="size-4 mr-2" />
                Heiligen
              </TabsTrigger>
              <TabsTrigger value="feasts" className={isDarkMode ? 'data-[state=active]:bg-gray-700' : ''}>
                <Church className="size-4 mr-2" />
                Feesten
              </TabsTrigger>
              <TabsTrigger value="fasting" className={isDarkMode ? 'data-[state=active]:bg-gray-700' : ''}>
                <Salad className="size-4 mr-2" />
                Vasten
              </TabsTrigger>
            </TabsList>

            {/* Heiligen Tab */}
            <TabsContent value="saints" className="space-y-4">
              {/* Month Selector */}
              <div className={`rounded-lg shadow-sm border p-3 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                <label className={`text-sm mb-2 block ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>
                  Selecteer maand
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className={`w-full p-2 rounded border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                >
                  {months.map((month, index) => (
                    <option key={index} value={index + 1}>{month}</option>
                  ))}
                </select>
              </div>

              {/* Saints List */}
              {getSaintsForMonth(selectedMonth).length > 0 ? (
                <div className={`rounded-lg shadow-sm border p-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                  <div className="space-y-3">
                    {getSaintsForMonth(selectedMonth).map(saint => (
                      <div 
                        key={saint.id} 
                        className={`pb-3 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} border-b last:border-b-0`}
                      >
                        <div className="flex items-start gap-3">
                          <span className={`text-sm font-medium px-2 py-1 rounded ${
                            isDarkMode ? 'bg-amber-900/50 text-amber-300' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {saint.day}
                          </span>
                          <div className="flex-1">
                            <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {saint.name}
                            </p>
                            {saint.description && (
                              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {saint.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className={`rounded-lg shadow-sm border p-6 text-center ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Geen heiligen geregistreerd voor {months[selectedMonth - 1]}
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Feesten Tab */}
            <TabsContent value="feasts" className="space-y-4">
              {/* Month Selector */}
              <div className={`rounded-lg shadow-sm border p-3 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                <label className={`text-sm mb-2 block ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>
                  Selecteer maand
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className={`w-full p-2 rounded border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                >
                  {months.map((month, index) => (
                    <option key={index} value={index + 1}>{month}</option>
                  ))}
                </select>
              </div>

              {/* Feasts List */}
              {getFeastsForMonth(selectedMonth).length > 0 ? (
                <div className={`rounded-lg shadow-sm border p-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                  <div className="space-y-3">
                    {getFeastsForMonth(selectedMonth).map(feast => (
                      <div 
                        key={feast.id} 
                        className={`pb-3 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} border-b last:border-b-0`}
                      >
                        <div className="flex items-start gap-3">
                          <span className={`text-sm font-medium px-2 py-1 rounded ${
                            isDarkMode ? 'bg-amber-900/50 text-amber-300' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {feast.day}
                          </span>
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {feast.name}
                              </p>
                              <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${getFeastTypeBadgeColor(feast.type)}`}>
                                {getFeastTypeLabel(feast.type)}
                              </span>
                            </div>
                            {feast.description && (
                              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {feast.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className={`rounded-lg shadow-sm border p-6 text-center ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Geen vaste feestdagen voor {months[selectedMonth - 1]}
                  </p>
                  <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    Bewegelijke feesten (zoals Pasen) worden op het "Vandaag" scherm getoond
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Vasten Tab */}
            <TabsContent value="fasting" className="space-y-4">
              <div className={`rounded-lg shadow-sm border p-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                <h3 className={`mb-4 ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>
                  Vastenperiodes
                </h3>
                <div className="space-y-3">
                  {fastingPeriods.map(fp => (
                    <div 
                      key={fp.id} 
                      className={`pb-3 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} border-b last:border-b-0`}
                    >
                      <div className="flex items-start gap-3">
                        <Salad className={`size-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                        <div className="flex-1">
                          <p className={`font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {fp.name}
                          </p>
                          {fp.description && (
                            <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {fp.description}
                            </p>
                          )}
                          {fp.durationDays && (
                            <p className={`text-sm ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                              Duur: {fp.durationDays} dagen
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vasten Info */}
              <div className={`rounded-lg shadow-sm border p-4 ${isDarkMode ? 'bg-purple-900/30 border-purple-700' : 'bg-purple-50 border-purple-200'}`}>
                <h4 className={`mb-2 ${isDarkMode ? 'text-purple-400' : 'text-purple-700'}`}>
                  Wekelijks Vasten
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-purple-300' : 'text-purple-800'}`}>
                  Elke woensdag en vrijdag zijn vastendagen (behalve tijdens Paastijd en bepaalde feestperiodes).
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
}
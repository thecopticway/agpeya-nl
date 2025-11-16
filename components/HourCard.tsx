import { Card } from "./ui/card";
import { Clock } from "lucide-react";

interface HourCardProps {
  name: string;
  copticName?: string;
  time: string;
  description: string;
  onClick: () => void;
  isDarkMode?: boolean;
}

export function HourCard({ 
  name, 
  copticName, 
  time, 
  description, 
  onClick, 
  isDarkMode
}: HourCardProps) {
  return (
    <Card 
      className={`p-3 transition-shadow border cursor-pointer hover:shadow-md active:scale-[0.98] ${
        isDarkMode 
          ? 'bg-gray-700 border-gray-600 hover:border-amber-500' 
          : 'hover:border-amber-600'
      }`}
      style={{
        opacity: 1.0
      }}
      onClick={onClick}
    >
      <div className="flex flex-col items-center text-center">
        <h3 className={`mb-0.5 text-base ${isDarkMode ? 'text-white' : ''}`} style={{ fontWeight: 700 }}>{name}</h3>
        {copticName && (
          <p className={`mb-1 ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`} style={{ fontFamily: 'serif', fontSize: '0.9rem', fontWeight: 700 }}>{copticName}</p>
        )}
        <div className={`flex items-center gap-1 ${isDarkMode ? 'text-amber-500' : 'text-amber-600'}`}>
          <Clock className="size-3" />
          <span className="text-xs" style={{ fontWeight: 700 }}>{time}</span>
        </div>
      </div>
    </Card>
  );
}
import { useState } from "react";
import { AppIconGenerator } from "./AppIconGenerator";
import { QRCodeGenerator } from "./QRCodeGenerator";
import { Button } from "./ui/button";
import { ArrowLeft, Wrench } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface PWAToolsProps {
  onBack: () => void;
  isDarkMode: boolean;
}

export function PWATools({ onBack, isDarkMode }: PWAToolsProps) {
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-amber-50 to-white'}`}>
      {/* Header */}
      <div className={`border-b shadow-sm sticky top-0 z-10 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
        <div className="px-3 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="flex-shrink-0"
            >
              <ArrowLeft className="size-6" />
            </Button>
            <div className="text-center flex-1 mr-12">
              <div className="flex items-center gap-2 justify-center">
                <Wrench className={`size-6 ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`} />
                <h1 className={`text-xl ${isDarkMode ? 'text-amber-400' : 'text-amber-800'}`} style={{ fontFamily: 'Algerian' }}>PWA Tools</h1>
              </div>
              <p className={`tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} whitespace-nowrap`} style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem' }}>
                KOPTISCH-ORTHODOX BISDOM NEDERLAND
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-20">
        <div className="mb-4">
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Hulpmiddelen om je Agpeya app te deployen als Progressive Web App.
          </p>
        </div>

        <Tabs defaultValue="icons" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="icons">App Icons</TabsTrigger>
            <TabsTrigger value="qr">QR Code</TabsTrigger>
          </TabsList>

          <TabsContent value="icons" className="space-y-4">
            <AppIconGenerator />
          </TabsContent>

          <TabsContent value="qr" className="space-y-4">
            <QRCodeGenerator />
          </TabsContent>
        </Tabs>

        {/* Deployment Instructies Card */}
        <div className={`mt-6 p-6 rounded-lg shadow-lg border-2 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-amber-200'
        }`}>
          <h3 className={`text-xl mb-4 ${isDarkMode ? 'text-amber-400' : 'text-amber-800'}`} style={{ fontFamily: 'Algerian' }}>
            🚀 Volgende Stappen
          </h3>
          
          <div className="space-y-4">
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-amber-50'}`}>
              <h4 className={`mb-2 ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>
                1️⃣ Download de App Icons
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Gebruik het "App Icons" tabblad om beide icons te downloaden (192px en 512px).
                Plaats ze in de <code className="bg-gray-700 text-amber-400 px-1 rounded">/public/</code> map.
              </p>
            </div>

            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-amber-50'}`}>
              <h4 className={`mb-2 ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>
                2️⃣ Build je App
              </h4>
              <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Open je terminal en run:
              </p>
              <code className="block bg-gray-900 text-green-400 p-2 rounded text-sm">
                npm run build
              </code>
            </div>

            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-amber-50'}`}>
              <h4 className={`mb-2 ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>
                3️⃣ Deploy naar Netlify
              </h4>
              <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Ga naar{' '}
                <a 
                  href="https://app.netlify.com/drop" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 underline hover:text-blue-600"
                >
                  netlify.com/drop
                </a>
                {' '}en sleep je <code className="bg-gray-700 text-amber-400 px-1 rounded">dist</code> folder.
              </p>
            </div>

            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-amber-50'}`}>
              <h4 className={`mb-2 ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>
                4️⃣ Maak een QR Code
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Gebruik het "QR Code" tabblad om een scanbare QR code te maken met je app URL.
                Deel deze in de kerk, WhatsApp, of social media!
              </p>
            </div>

            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-amber-50'}`}>
              <h4 className={`mb-2 ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>
                5️⃣ Test de Installatie
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Open de app op je telefoon en installeer:<br />
                📱 <strong>iPhone:</strong> Safari → Deel → Zet in beginscherm<br />
                🤖 <strong>Android:</strong> Chrome → Menu → App installeren
              </p>
            </div>
          </div>

          <div className={`mt-6 p-4 rounded-lg border ${
            isDarkMode 
              ? 'bg-gray-900 border-gray-600' 
              : 'bg-blue-50 border-blue-200'
          }`}>
            <h4 className={`text-sm mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-800'}`}>
              📚 Meer Informatie
            </h4>
            <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Bekijk de volgende bestanden in je project voor gedetailleerde instructies:
            </p>
            <ul className={`text-xs mt-2 space-y-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <li>• <code className="bg-gray-700 text-amber-400 px-1 rounded">INSTALLATIE-INSTRUCTIES.md</code> - Voor je gebruikers</li>
              <li>• <code className="bg-gray-700 text-amber-400 px-1 rounded">DEPLOYMENT.md</code> - Deployment handleiding</li>
              <li>• <code className="bg-gray-700 text-amber-400 px-1 rounded">PWA-SETUP.md</code> - Technische details</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
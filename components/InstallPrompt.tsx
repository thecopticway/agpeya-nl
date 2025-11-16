import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { X, Download, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check of de app al geïnstalleerd is (standalone mode)
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
                               (window.navigator as any).standalone === true;
    setIsStandalone(isInStandaloneMode);

    // Luister naar het beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Wacht 3 seconden voordat we de prompt tonen
      setTimeout(() => {
        const hasSeenPrompt = localStorage.getItem('agpeya-install-prompt-dismissed');
        if (!hasSeenPrompt) {
          setShowPrompt(true);
        }
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Toon de native install prompt
    deferredPrompt.prompt();

    // Wacht op de keuze van de gebruiker
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('Gebruiker heeft de app geïnstalleerd');
    }

    // Reset de prompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('agpeya-install-prompt-dismissed', 'true');
  };

  // Toon niets als:
  // - De app al geïnstalleerd is
  // - Er geen prompt beschikbaar is
  // - De gebruiker de prompt heeft weggedrukt
  if (isStandalone || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom">
      <div className="bg-amber-800 text-white rounded-lg shadow-2xl p-4 border-2 border-amber-600">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 hover:bg-amber-700 rounded-full transition-colors"
          aria-label="Sluiten"
        >
          <X className="size-5" />
        </button>
        
        <div className="flex items-start gap-3 pr-8">
          <div className="bg-amber-700 p-2 rounded-lg flex-shrink-0">
            <Smartphone className="size-6" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-medium mb-1">Installeer Agpeya</h3>
            <p className="text-sm text-amber-100 mb-3">
              Installeer de Agpeya app op je telefoon voor offline toegang en een betere ervaring.
            </p>
            
            <div className="flex gap-2">
              {deferredPrompt ? (
                <Button
                  onClick={handleInstallClick}
                  size="sm"
                  className="bg-white text-amber-800 hover:bg-amber-50"
                >
                  <Download className="size-4 mr-2" />
                  Installeer Nu
                </Button>
              ) : (
                <Button
                  onClick={handleDismiss}
                  size="sm"
                  variant="outline"
                  className="bg-amber-700 text-white border-amber-600 hover:bg-amber-600"
                >
                  Begrepen
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

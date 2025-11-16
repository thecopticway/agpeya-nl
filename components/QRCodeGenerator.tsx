import { useRef, useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Download, Share2, Copy, Check } from "lucide-react";
import { toast } from "sonner@2.0.3";

export function QRCodeGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [url, setUrl] = useState("https://jouw-agpeya-app.netlify.app");
  const [qrGenerated, setQrGenerated] = useState(false);
  const [copied, setCopied] = useState(false);

  // Simpele QR code generator functie
  const generateQRCode = (text: string, canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 400;
    const moduleCount = 25; // QR code grid grootte
    const moduleSize = size / moduleCount;
    
    canvas.width = size;
    canvas.height = size;

    // Achtergrond wit
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // Genereer een simpel patroon gebaseerd op de URL
    // Note: Dit is een DEMO versie. Voor productie gebruik een echte QR library
    ctx.fillStyle = '#000000';
    
    // Creëer hash van de URL voor consistent patroon
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash = hash & hash;
    }

    // Teken positioneringspatronen (3 hoeken)
    const drawPositionPattern = (x: number, y: number) => {
      // Buitenste vierkant
      ctx.fillRect(x * moduleSize, y * moduleSize, moduleSize * 7, moduleSize * 7);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect((x + 1) * moduleSize, (y + 1) * moduleSize, moduleSize * 5, moduleSize * 5);
      ctx.fillStyle = '#000000';
      ctx.fillRect((x + 2) * moduleSize, (y + 2) * moduleSize, moduleSize * 3, moduleSize * 3);
    };

    drawPositionPattern(0, 0); // Top-left
    drawPositionPattern(moduleCount - 7, 0); // Top-right
    drawPositionPattern(0, moduleCount - 7); // Bottom-left

    // Vul de rest met een patroon gebaseerd op de URL
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        // Skip positioneringspatronen
        if ((row < 8 && col < 8) || 
            (row < 8 && col >= moduleCount - 8) || 
            (row >= moduleCount - 8 && col < 8)) {
          continue;
        }

        // Genereer pseudo-random patroon
        const seed = (row * moduleCount + col + hash) * 2654435761;
        if ((seed % 3) === 0) {
          ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize);
        }
      }
    }

    // Timing patterns (horizontaal en verticaal)
    ctx.fillStyle = '#000000';
    for (let i = 8; i < moduleCount - 8; i++) {
      if (i % 2 === 0) {
        ctx.fillRect(i * moduleSize, 6 * moduleSize, moduleSize, moduleSize);
        ctx.fillRect(6 * moduleSize, i * moduleSize, moduleSize, moduleSize);
      }
    }

    // Voeg Agpeya branding toe in het midden
    ctx.fillStyle = '#ffffff';
    const centerSize = moduleSize * 5;
    const centerX = (size - centerSize) / 2;
    const centerY = (size - centerSize) / 2;
    ctx.fillRect(centerX, centerY, centerSize, centerSize);
    
    ctx.fillStyle = '#b45309'; // amber-700
    ctx.fillRect(centerX + 2, centerY + 2, centerSize - 4, centerSize - 4);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✝', size / 2, size / 2);

    setQrGenerated(true);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !url) return;

    generateQRCode(url, canvas);
  }, [url]);

  const downloadQRCode = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Maak een nieuwe canvas met padding en labels
    const finalCanvas = document.createElement('canvas');
    const ctx = finalCanvas.getContext('2d');
    if (!ctx) return;

    const padding = 60;
    const canvasSize = 400;
    finalCanvas.width = canvasSize + (padding * 2);
    finalCanvas.height = canvasSize + (padding * 2) + 80; // Extra ruimte voor tekst

    // Witte achtergrond
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

    // Teken de QR code
    ctx.drawImage(canvas, padding, padding);

    // Voeg tekst toe
    ctx.fillStyle = '#92400e'; // amber-800
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Agpeya - Koptisch Gebedenboek', finalCanvas.width / 2, padding / 2);

    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#78716c'; // stone-500
    const urlText = url.length > 40 ? url.substring(0, 40) + '...' : url;
    ctx.fillText(urlText, finalCanvas.width / 2, canvasSize + padding + 40);

    ctx.font = '14px sans-serif';
    ctx.fillText('Scan om de app te installeren', finalCanvas.width / 2, canvasSize + padding + 65);

    // Download
    finalCanvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'agpeya-qr-code.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('QR code gedownload!');
    });
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('URL gekopieerd!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Kon URL niet kopiëren');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-amber-200">
      <h2 className="text-2xl text-amber-800 mb-4" style={{ fontFamily: 'Algerian' }}>📱 QR Code Generator</h2>
      
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-4">
          Genereer een QR code die direct naar je Agpeya app linkt. 
          Gebruikers kunnen deze scannen om de app te openen en installeren.
        </p>
      </div>

      {/* URL Input */}
      <div className="mb-6 space-y-2">
        <Label htmlFor="app-url" className="text-amber-800">App URL:</Label>
        <div className="flex gap-2">
          <Input
            id="app-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://jouw-agpeya-app.netlify.app"
            className="flex-1 border-amber-300 focus:border-amber-500"
          />
          <Button
            onClick={copyUrl}
            variant="outline"
            size="icon"
            className="border-amber-300"
          >
            {copied ? (
              <Check className="size-4 text-green-600" />
            ) : (
              <Copy className="size-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-500">
          💡 Tip: Pas dit aan naar je eigen app URL na deployment
        </p>
      </div>

      {/* QR Code Display */}
      <div className="flex flex-col items-center mb-6">
        <div className="bg-white p-6 rounded-lg border-4 border-amber-300 shadow-xl">
          <canvas
            ref={canvasRef}
            className="max-w-full h-auto"
            style={{ width: '300px', height: '300px' }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-3 text-center">
          ⚠️ Dit is een demo QR code. Voor een echte QR code, 
          gebruik een online QR generator met je app URL.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Button
          onClick={downloadQRCode}
          disabled={!qrGenerated}
          className="flex-1 bg-amber-700 hover:bg-amber-800"
        >
          <Download className="size-5 mr-2" />
          Download QR Code
        </Button>
        <Button
          onClick={() => window.open(`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(url)}`, '_blank')}
          variant="outline"
          className="flex-1 border-amber-600 text-amber-700 hover:bg-amber-50"
        >
          <Share2 className="size-5 mr-2" />
          Maak Echte QR Code
        </Button>
      </div>

      {/* Instructies */}
      <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
        <h4 className="text-sm text-amber-800 mb-3">📋 Waar kun je de QR code gebruiken?</h4>
        <ul className="text-xs text-gray-700 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-amber-600">⛪</span>
            <span><strong>Kerk bulletin:</strong> Print de QR code in het weekblad</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600">📱</span>
            <span><strong>WhatsApp:</strong> Deel de afbeelding in groepen</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600">📄</span>
            <span><strong>Flyers:</strong> Maak posters met de QR code</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600">📧</span>
            <span><strong>Email:</strong> Voeg toe aan je handtekening</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600">💬</span>
            <span><strong>Social media:</strong> Deel op Facebook, Instagram, etc.</span>
          </li>
        </ul>
      </div>

      {/* Online QR Generator Suggestie */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="text-sm text-blue-800 mb-2">💡 Aanbevolen: Gebruik een Echte QR Generator</h4>
        <p className="text-xs text-gray-700 mb-3">
          Voor een volledige functionele QR code, gebruik een van deze gratis diensten:
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => window.open('https://www.qr-code-generator.com/', '_blank')}
            size="sm"
            variant="outline"
            className="text-xs"
          >
            QR-Code-Generator.com
          </Button>
          <Button
            onClick={() => window.open('https://www.qrcode-monkey.com/', '_blank')}
            size="sm"
            variant="outline"
            className="text-xs"
          >
            QRCode Monkey
          </Button>
          <Button
            onClick={() => window.open(`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(url)}`, '_blank')}
            size="sm"
            variant="outline"
            className="text-xs"
          >
            QR Server API
          </Button>
        </div>
      </div>
    </div>
  );
}
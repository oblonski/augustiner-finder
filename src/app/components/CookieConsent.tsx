'use client'

import React, { useState, useEffect } from 'react';
import { Cookie, X, Check } from 'lucide-react';

const CookieConsent = () => {
    const [showConsent, setShowConsent] = useState(false);

    useEffect(() => {
        // Check if user has already made a choice
        const consentGiven = localStorage.getItem('cookieConsent');
        if (!consentGiven) {
            setShowConsent(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookieConsent', 'accepted');
        setShowConsent(false);
    };

    const handleDecline = () => {
        localStorage.setItem('cookieConsent', 'declined');
        setShowConsent(false);
    };

    if (!showConsent) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
            <div className="bg-white rounded-t-xl shadow-2xl max-w-4xl w-full mx-4 mb-0">
                <div className="p-6 border-b">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Cookie className="w-6 h-6 text-amber-600 mr-3" />
                            <h3 className="text-xl font-semibold text-gray-900">Cookie-Einstellungen</h3>
                        </div>
                    </div>
                </div>
                
                <div className="p-6">
                    <p className="text-gray-700 mb-4">
                        Diese Website verwendet Cookies und lokale Speicherung, um Ihre Benutzererfahrung zu verbessern und die Funktionalität zu gewährleisten. 
                        Wir verwenden:
                    </p>
                    
                    <ul className="text-sm text-gray-600 mb-6 space-y-2">
                        <li>• <strong>Notwendige Cookies:</strong> Für die Grundfunktionen der Anwendung (Ihre Spielerauswahl und Einstellungen)</li>
                        <li>• <strong>API-Aufrufe:</strong> GraphHopper API für Routenberechnung und Nominatim für Geocoding</li>
                        <li>• <strong>Keine Tracking-Cookies:</strong> Wir verwenden keine Analyse- oder Werbe-Cookies</li>
                    </ul>
                    
                    <p className="text-xs text-gray-500 mb-6">
                        Weitere Informationen finden Sie in unserer{' '}
                        <a href="/datenschutz" className="text-amber-600 hover:text-amber-700 underline">
                            Datenschutzerklärung
                        </a>.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={handleAccept}
                            className="flex-1 bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors flex items-center justify-center"
                        >
                            <Check className="w-5 h-5 mr-2" />
                            Alle Cookies akzeptieren
                        </button>
                        <button
                            onClick={handleDecline}
                            className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center"
                        >
                            <X className="w-5 h-5 mr-2" />
                            Nur notwendige Cookies
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CookieConsent;
'use client'

import React, { useState, useEffect } from 'react';
import { Cookie, X, Check } from 'lucide-react';

const CookieConsent = () => {
    const [showConsent, setShowConsent] = useState(false);

    useEffect(() => {
        // Check if user has already made a choice
        const consentGiven = localStorage.getItem('dataConsent');
        if (!consentGiven) {
            setShowConsent(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('dataConsent', 'accepted');
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
                            <h3 className="text-xl font-semibold text-gray-900">Datenschutz-Hinweis</h3>
                        </div>
                    </div>
                </div>
                
                <div className="p-6">
                    <p className="text-gray-700 mb-4">
                        Diese Website verwendet <strong>keine Cookies</strong>, sondern nur lokale Browser-Speicherung (localStorage) für die Funktionalität der Anwendung.
                    </p>
                    
                    <ul className="text-sm text-gray-600 mb-6 space-y-2">
                        <li>• <strong>Lokale Speicherung:</strong> Ihre Spielerauswahl, Einstellungen und Standort-Überschreibungen werden nur in Ihrem Browser gespeichert</li>
                        <li>• <strong>Externe APIs:</strong> Bei der Nutzung werden Anfragen an GraphHopper (Routenberechnung) und Nominatim (Geocoding) gesendet</li>
                        <li>• <strong>Keine Tracking:</strong> Es werden keine Analyse-Tools, Werbe-Cookies oder andere Tracking-Mechanismen verwendet</li>
                        <li>• <strong>Keine Datenübertragung:</strong> Ihre Einstellungen verlassen niemals Ihren Browser</li>
                    </ul>
                    
                    <p className="text-xs text-gray-500 mb-6">
                        Weitere Informationen finden Sie in unserer{' '}
                        <a href="/datenschutz" className="text-amber-600 hover:text-amber-700 underline">
                            Datenschutzerklärung
                        </a>.
                    </p>
                    
                    <div className="flex justify-center">
                        <button
                            onClick={handleAccept}
                            className="bg-amber-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors flex items-center justify-center"
                        >
                            <Check className="w-5 h-5 mr-2" />
                            Verstanden
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CookieConsent;
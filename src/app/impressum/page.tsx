import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, MapPin } from 'lucide-react';

export default function Impressum() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link 
                        href="/" 
                        className="inline-flex items-center text-amber-700 hover:text-amber-800 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Zurück zur Augustiner Finder
                    </Link>
                    <h1 className="text-4xl font-bold text-amber-800 mb-2">Impressum</h1>
                    <p className="text-amber-700">Angaben gemäß § 5 TMG</p>
                </div>

                {/* Content */}
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <div className="prose max-w-none">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                            <MapPin className="w-6 h-6 text-amber-600 mr-2" />
                            Anbieter
                        </h2>
                        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                            <p className="mb-2"><strong>Privater Betreiber</strong></p>
                            <p className="mb-2">München, Deutschland</p>
                            <div className="flex items-center text-amber-700">
                                <Mail className="w-4 h-4 mr-2" />
                                <span>Kontakt über GitHub</span>
                            </div>
                        </div>

                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Zweck der Website</h2>
                        <p className="mb-6 text-gray-700">
                            Diese Website dient ausschließlich privaten, nicht-kommerziellen Zwecken. 
                            Sie hilft dabei, optimale Augustiner-Standorte für Schafkopf-Runden in München zu finden.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Haftungsausschluss</h2>
                        
                        <h3 className="text-xl font-medium text-gray-800 mb-3">Inhalt des Onlineangebotes</h3>
                        <p className="mb-4 text-gray-700">
                            Der Autor übernimmt keinerlei Gewähr für die Aktualität, Korrektheit, Vollständigkeit oder 
                            Qualität der bereitgestellten Informationen. Haftungsansprüche gegen den Autor, welche sich 
                            auf Schäden materieller oder ideeller Art beziehen, die durch die Nutzung oder Nichtnutzung 
                            der dargebotenen Informationen bzw. durch die Nutzung fehlerhafter und unvollständiger 
                            Informationen verursacht wurden, sind grundsätzlich ausgeschlossen.
                        </p>

                        <h3 className="text-xl font-medium text-gray-800 mb-3">Verweise und Links</h3>
                        <p className="mb-4 text-gray-700">
                            Bei direkten oder indirekten Verweisen auf fremde Webseiten (&quot;Hyperlinks&quot;), die außerhalb 
                            des Verantwortungsbereiches des Autors liegen, würde eine Haftungsverpflichtung ausschließlich 
                            in dem Fall in Kraft treten, in dem der Autor von den Inhalten Kenntnis hat und es ihm technisch 
                            möglich und zumutbar wäre, die Nutzung im Falle rechtswidriger Inhalte zu verhindern.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Verwendete Dienste</h2>
                        <div className="mb-6">
                            <h3 className="text-xl font-medium text-gray-800 mb-3">Externe APIs</h3>
                            <ul className="list-disc pl-6 text-gray-700 space-y-1">
                                <li><strong>OpenStreetMap:</strong> Kartendaten und Geocoding-Dienste</li>
                                <li><strong>GraphHopper API:</strong> Routenberechnung und Entfernungsbestimmung</li>
                                <li><strong>CARTO:</strong> Kartendarstellung</li>
                            </ul>
                        </div>

                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Urheberrecht</h2>
                        <p className="mb-6 text-gray-700">
                            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen 
                            dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art 
                            der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen 
                            Zustimmung des jeweiligen Autors bzw. Erstellers.
                        </p>

                        <div className="mt-8 p-4 bg-amber-50 rounded-lg border border-amber-200">
                            <p className="text-sm text-amber-800">
                                <strong>Hinweis:</strong> Dies ist ein privates, nicht-kommerzielles Projekt. 
                                Alle Angaben zu Augustiner-Standorten sind ohne Gewähr.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
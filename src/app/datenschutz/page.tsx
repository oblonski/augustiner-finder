import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, Database, Globe, Cookie } from 'lucide-react';

export default function Datenschutz() {
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
                    <h1 className="text-4xl font-bold text-amber-800 mb-2">Datenschutzerklärung</h1>
                    <p className="text-amber-700">Informationen zum Datenschutz gemäß DSGVO</p>
                </div>

                {/* Content */}
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <div className="prose max-w-none">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                            <Shield className="w-6 h-6 text-amber-600 mr-2" />
                            Allgemeine Hinweise
                        </h2>
                        <p className="mb-6 text-gray-700">
                            Diese Datenschutzerklärung informiert Sie über die Art, den Umfang und Zweck der 
                            Verarbeitung von personenbezogenen Daten auf dieser Website. Personenbezogene Daten 
                            sind alle Daten, mit denen Sie persönlich identifiziert werden können.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                            <Database className="w-6 h-6 text-amber-600 mr-2" />
                            Datenverarbeitung auf dieser Website
                        </h2>
                        
                        <h3 className="text-xl font-medium text-gray-800 mb-3">Lokale Datenspeicherung</h3>
                        <p className="mb-4 text-gray-700">
                            Diese Website speichert folgende Daten lokal in Ihrem Browser:
                        </p>
                        <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-1">
                            <li><strong>Spielerauswahl:</strong> Ihre Auswahl der Schafkopf-Spieler</li>
                            <li><strong>Transportmodus:</strong> Ihre Präferenz für Verkehrsmittel (zu Fuß, Fahrrad, Auto)</li>
                            <li><strong>Berechnungsmethode:</strong> Ihre Wahl zwischen Luftlinie und GraphHopper-Routing</li>
                            <li><strong>Cookie-Einstellungen:</strong> Ihre Zustimmung oder Ablehnung von Cookies</li>
                            <li><strong>Standort-Überschreibungen:</strong> Temporäre alternative Adressen für Spieler</li>
                        </ul>
                        <p className="mb-6 text-gray-700">
                            Diese Daten werden ausschließlich lokal in Ihrem Browser gespeichert und nicht an 
                            unsere Server übertragen.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                            <Globe className="w-6 h-6 text-amber-600 mr-2" />
                            Externe Dienste
                        </h2>
                        
                        <h3 className="text-xl font-medium text-gray-800 mb-3">GraphHopper API</h3>
                        <p className="mb-4 text-gray-700">
                            Für die Berechnung realer Reisezeiten verwenden wir die GraphHopper API. 
                            Dabei werden GPS-Koordinaten der Augustiner-Standorte und Spieler-Adressen 
                            an GraphHopper übertragen.
                        </p>
                        <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-1">
                            <li><strong>Anbieter:</strong> GraphHopper GmbH</li>
                            <li><strong>Übertragene Daten:</strong> GPS-Koordinaten, Verkehrsmittel</li>
                            <li><strong>Zweck:</strong> Routenberechnung und Entfernungsbestimmung</li>
                            <li><strong>Datenschutz:</strong> <a href="https://www.graphhopper.com/privacy/" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-amber-700 underline">GraphHopper Datenschutz</a></li>
                        </ul>

                        <h3 className="text-xl font-medium text-gray-800 mb-3">Nominatim Geocoding (OpenStreetMap)</h3>
                        <p className="mb-4 text-gray-700">
                            Für die Umwandlung von Adressen in GPS-Koordinaten verwenden wir den Nominatim-Dienst 
                            von OpenStreetMap.
                        </p>
                        <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-1">
                            <li><strong>Anbieter:</strong> OpenStreetMap Foundation</li>
                            <li><strong>Übertragene Daten:</strong> Adressinformationen</li>
                            <li><strong>Zweck:</strong> Geocoding (Adresse → GPS-Koordinaten)</li>
                            <li><strong>Datenschutz:</strong> <a href="https://wiki.osmfoundation.org/wiki/Privacy_Policy" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-amber-700 underline">OSM Datenschutz</a></li>
                        </ul>

                        <h3 className="text-xl font-medium text-gray-800 mb-3">CARTO Kartendienst</h3>
                        <p className="mb-4 text-gray-700">
                            Für die Darstellung der Karte verwenden wir Kartenkacheln von CARTO.
                        </p>
                        <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-1">
                            <li><strong>Anbieter:</strong> CARTO</li>
                            <li><strong>Übertragene Daten:</strong> IP-Adresse, Kartenbereich</li>
                            <li><strong>Zweck:</strong> Anzeige der Karte</li>
                            <li><strong>Datenschutz:</strong> <a href="https://carto.com/privacy/" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-amber-700 underline">CARTO Datenschutz</a></li>
                        </ul>

                        <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                            <Cookie className="w-6 h-6 text-amber-600 mr-2" />
                            Keine Cookies - Nur lokale Speicherung
                        </h2>
                        <p className="mb-4 text-gray-700">
                            <strong>Diese Website verwendet KEINE Cookies.</strong> Wir nutzen ausschließlich die lokale Speicherung 
                            Ihres Browsers (localStorage) für die technisch notwendigen Funktionen der Anwendung:
                        </p>
                        <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-1">
                            <li><strong>Technisch notwendige Speicherung:</strong> LocalStorage für Ihre App-Einstellungen</li>
                            <li><strong>Keine Einwilligung erforderlich:</strong> Da wir keine Cookies verwenden und nur technisch notwendige Speicherung nutzen</li>
                            <li><strong>Keine Weitergabe:</strong> Alle Daten bleiben in Ihrem Browser</li>
                        </ul>

                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">SSL-Verschlüsselung</h2>
                        <p className="mb-6 text-gray-700">
                            Diese Website nutzt aus Sicherheitsgründen und zum Schutz der Übertragung eine SSL-Verschlüsselung. 
                            Eine verschlüsselte Verbindung erkennen Sie daran, dass die Adresszeile des Browsers von "http://" 
                            auf "https://" wechselt und an dem Schloss-Symbol in Ihrer Browserzeile.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Ihre Rechte</h2>
                        <p className="mb-4 text-gray-700">
                            Da wir keine personenbezogenen Daten zentral speichern und keine Cookies verwenden, haben Sie folgende Möglichkeiten:
                        </p>
                        <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-1">
                            <li><strong>Löschung:</strong> Löschen Sie die Browser-Daten (localStorage) für diese Website über Ihre Browser-Einstellungen</li>
                            <li><strong>Einsicht:</strong> Alle gespeicherten Daten können Sie in den Browser-Entwicklertools einsehen</li>
                            <li><strong>Kontrolle:</strong> Sie haben jederzeit volle Kontrolle über alle lokal gespeicherten Daten</li>
                        </ul>

                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Hosting und Server-Logs</h2>
                        <p className="mb-4 text-gray-700">
                            Diese Website wird auf Vercel gehostet. Der Hosting-Anbieter erhebt in sog. Server-Log-Dateien 
                            folgende Daten, die Ihr Browser automatisch übermittelt:
                        </p>
                        <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-1">
                            <li>Browser-Typ und Browser-Version</li>
                            <li>Verwendetes Betriebssystem</li>
                            <li>Referrer URL (die zuvor besuchte Seite)</li>
                            <li>Hostname des zugreifenden Rechners (IP-Adresse)</li>
                            <li>Uhrzeit der Serveranfrage</li>
                        </ul>
                        <p className="mb-6 text-gray-700">
                            Diese Daten sind nicht bestimmten Personen zuordenbar. Eine Zusammenführung dieser Daten mit 
                            anderen Datenquellen wird nicht vorgenommen. Die Daten werden nach einer statistischen Auswertung gelöscht.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Änderungen der Datenschutzerklärung</h2>
                        <p className="mb-6 text-gray-700">
                            Wir behalten uns vor, diese Datenschutzerklärung zu aktualisieren, um sie an 
                            geänderte Rechtslage oder Änderungen des Dienstes sowie der Datenverarbeitung anzupassen.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Rechtsgrundlage</h2>
                        <p className="mb-6 text-gray-700">
                            Die Datenverarbeitung erfolgt auf Grundlage unseres berechtigten Interesses an der 
                            Bereitstellung und Optimierung unseres Onlineangebotes gemäß Art. 6 Abs. 1 lit. f DSGVO.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Kinder</h2>
                        <p className="mb-6 text-gray-700">
                            Unser Angebot richtet sich grundsätzlich an Erwachsene. Personen unter 16 Jahren sollten 
                            ohne Zustimmung der Erziehungsberechtigten keine personenbezogenen Daten an uns übermitteln.
                        </p>

                        <div className="mt-8 p-4 bg-amber-50 rounded-lg border border-amber-200">
                            <p className="text-sm text-amber-800">
                                <strong>Stand:</strong> Januar 2025<br />
                                <strong>Kontakt:</strong> Bei Fragen zum Datenschutz kontaktieren Sie uns über GitHub.<br />
                                <strong>Hinweis:</strong> Diese Datenschutzerklärung gilt ausschließlich für diese Website.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
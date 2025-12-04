-- =====================================================
-- DATENSCHUTZERKLÄRUNG UPDATE
-- =====================================================
-- Führe dieses SQL in Supabase aus, um die Datenschutzerklärung zu setzen.
-- WICHTIG: Ersetze alle [PLATZHALTER] mit deinen echten Daten!
-- =====================================================

UPDATE site_settings SET privacy = '
<h2>1. Verantwortlicher</h2>
<p>Verantwortlich für die Datenverarbeitung auf dieser Website ist:</p>
<p><strong>[DEIN VOLLSTÄNDIGER NAME]</strong><br>
[DEINE STRASSE UND HAUSNUMMER]<br>
[PLZ] [STADT]<br>
Deutschland</p>
<p>E-Mail: <a href="mailto:[DEINE-EMAIL@DOMAIN.DE]">[DEINE-EMAIL@DOMAIN.DE]</a></p>

<h2>2. Überblick der Datenverarbeitung</h2>
<h3>Arten der verarbeiteten Daten</h3>
<ul>
<li>Nutzungsdaten (besuchte Seiten, Zugriffszeit)</li>
<li>Meta-/Kommunikationsdaten (IP-Adressen, Browsertyp)</li>
<li>Bei Admin-Nutzung: Authentifizierungsdaten</li>
</ul>

<h3>Zwecke der Verarbeitung</h3>
<ul>
<li>Bereitstellung der Website und ihrer Funktionen</li>
<li>Sicherheit und Missbrauchsprävention</li>
<li>Administrative Verwaltung</li>
</ul>

<h2>3. Rechtsgrundlagen</h2>
<p>Die Verarbeitung personenbezogener Daten erfolgt auf Grundlage von:</p>
<ul>
<li><strong>Art. 6 Abs. 1 lit. a DSGVO</strong> – Einwilligung (z.B. bei Cookie-Consent)</li>
<li><strong>Art. 6 Abs. 1 lit. b DSGVO</strong> – Vertragserfüllung</li>
<li><strong>Art. 6 Abs. 1 lit. f DSGVO</strong> – Berechtigte Interessen (z.B. Sicherheit)</li>
</ul>

<h2>4. Hosting</h2>
<p>Diese Website wird gehostet bei:</p>
<p><strong>Vercel Inc.</strong><br>
340 S Lemon Ave #4133, Walnut, CA 91789, USA</p>
<p>Vercel verarbeitet Zugriffsdaten zur Bereitstellung der Website. Die Datenverarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Vercel ist unter dem EU-US Data Privacy Framework zertifiziert.</p>
<p>Weitere Informationen: <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener">vercel.com/legal/privacy-policy</a></p>

<h2>5. Datenbank</h2>
<p>Für die Speicherung von Website-Inhalten nutzen wir:</p>
<p><strong>Supabase Inc.</strong><br>
970 Toa Payoh North #07-04, Singapore 318992</p>
<p>Supabase speichert Website-Inhalte in einer PostgreSQL-Datenbank. Personenbezogene Daten von Besuchern werden dort nicht gespeichert. Supabase verwendet Standardvertragsklauseln gemäß Art. 46 DSGVO.</p>
<p>Weitere Informationen: <a href="https://supabase.com/privacy" target="_blank" rel="noopener">supabase.com/privacy</a></p>

<h2>6. Cookies</h2>
<h3>6.1 Essentielle Cookies (technisch notwendig)</h3>
<table>
<tr><th>Cookie</th><th>Zweck</th><th>Speicherdauer</th></tr>
<tr><td><code>ap_admin_auth</code></td><td>Admin-Authentifizierung</td><td>7 Tage</td></tr>
<tr><td><code>ap_cookie_consent</code></td><td>Cookie-Einwilligung</td><td>1 Jahr</td></tr>
</table>
<p>Diese Cookies sind für den Betrieb der Website erforderlich. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO.</p>

<h3>6.2 Analyse-Cookies</h3>
<p>Derzeit werden <strong>keine</strong> Analyse- oder Tracking-Cookies verwendet.</p>

<h2>7. Schriftarten</h2>
<p>Diese Website verwendet die Schriftart "Geist" von Vercel, geladen über Google Fonts. Dabei wird Ihre IP-Adresse an Google übermittelt.</p>
<p><strong>Google LLC</strong>, 1600 Amphitheatre Parkway, Mountain View, CA 94043, USA</p>
<p>Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO.</p>

<h2>8. Ihre Rechte</h2>
<p>Sie haben folgende Rechte bezüglich Ihrer personenbezogenen Daten:</p>
<ul>
<li><strong>Auskunftsrecht</strong> (Art. 15 DSGVO)</li>
<li><strong>Berichtigungsrecht</strong> (Art. 16 DSGVO)</li>
<li><strong>Löschungsrecht</strong> (Art. 17 DSGVO)</li>
<li><strong>Einschränkung</strong> (Art. 18 DSGVO)</li>
<li><strong>Datenübertragbarkeit</strong> (Art. 20 DSGVO)</li>
<li><strong>Widerspruchsrecht</strong> (Art. 21 DSGVO)</li>
<li><strong>Widerruf der Einwilligung</strong> (Art. 7 Abs. 3 DSGVO)</li>
</ul>
<p>Zur Ausübung Ihrer Rechte kontaktieren Sie: <a href="mailto:[DEINE-EMAIL@DOMAIN.DE]">[DEINE-EMAIL@DOMAIN.DE]</a></p>

<h2>9. Beschwerderecht</h2>
<p>Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren.</p>
<p>Liste aller deutschen Aufsichtsbehörden: <a href="https://www.bfdi.bund.de/DE/Service/Anschriften/Laender/Laender-node.html" target="_blank" rel="noopener">bfdi.bund.de</a></p>

<h2>10. Speicherdauer</h2>
<ul>
<li><strong>Server-Logs:</strong> 7-30 Tage (Vercel)</li>
<li><strong>Admin-Session:</strong> 7 Tage</li>
<li><strong>Cookie-Consent:</strong> 1 Jahr</li>
</ul>

<h2>11. Sicherheit</h2>
<p>Wir setzen technische Maßnahmen zum Schutz Ihrer Daten ein:</p>
<ul>
<li>HTTPS-Verschlüsselung aller Datenübertragungen</li>
<li>Sichere Passwort-Hashes (SHA-256)</li>
<li>HttpOnly- und Secure-Cookies</li>
<li>Regelmäßige Sicherheitsupdates</li>
</ul>

<h2>12. Änderungen</h2>
<p>Diese Datenschutzerklärung kann bei Bedarf aktualisiert werden.</p>
<p><strong>Stand:</strong> Dezember 2024</p>
' WHERE id = 1;

-- Prüfe ob Update erfolgreich war
SELECT 'Datenschutzerklärung aktualisiert' AS status, 
       LENGTH(privacy) AS zeichen 
FROM site_settings 
WHERE id = 1;


-- =====================================================
-- IMPRESSUM & DATENSCHUTZERKLÄRUNG UPDATE
-- =====================================================
-- Führe dieses SQL in Supabase aus, um Impressum und Datenschutz zu setzen.
-- =====================================================

-- =====================================================
-- 1. IMPRESSUM (Kleingewerbe nach § 5 TMG)
-- =====================================================
UPDATE site_settings SET imprint = '
<h2>Angaben gemäß § 5 TMG</h2>

<p><strong>Hans-Michael Trummer</strong><br>
ArcanePixels<br>
Am Bahnhof Broich 11<br>
45479 Mülheim an der Ruhr<br>
Deutschland</p>

<h3>Kontakt</h3>
<p>E-Mail: <a href="mailto:admin@arcanepixels.de">admin@arcanepixels.de</a></p>

<h3>Umsatzsteuer-ID</h3>
<p>Umsatzsteuerbefreit nach § 19 UStG (Kleinunternehmerregelung).</p>

<h3>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h3>
<p>Hans-Michael Trummer<br>
Am Bahnhof Broich 11<br>
45479 Mülheim an der Ruhr</p>

<h2>Haftungsausschluss</h2>

<h3>Haftung für Inhalte</h3>
<p>Als Diensteanbieter bin ich gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG bin ich als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.</p>
<p>Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werde ich diese Inhalte umgehend entfernen.</p>

<h3>Haftung für Links</h3>
<p>Diese Website enthält Links zu externen Websites Dritter, auf deren Inhalte ich keinen Einfluss habe. Deshalb kann ich für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar.</p>
<p>Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werde ich derartige Links umgehend entfernen.</p>

<h3>Urheberrecht</h3>
<p>Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.</p>
<p>Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitte ich um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werde ich derartige Inhalte umgehend entfernen.</p>

<h2>Streitschlichtung</h2>
<p>Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener">https://ec.europa.eu/consumers/odr/</a></p>
<p>Ich bin nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
' WHERE id = 'default';

-- =====================================================
-- 2. DATENSCHUTZERKLÄRUNG
-- =====================================================

UPDATE site_settings SET privacy = '
<h2>1. Verantwortlicher</h2>
<p>Verantwortlich für die Datenverarbeitung auf dieser Website ist:</p>
<p><strong>Hans-Michael Trummer</strong><br>
Am Bahnhof Broich 11<br>
45479 Mülheim an der Ruhr<br>
Deutschland</p>
<p>E-Mail: <a href="mailto:admin@arcanepixels.de">admin@arcanepixels.de</a></p>

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
<p>Zur Ausübung Ihrer Rechte kontaktieren Sie: <a href="mailto:admin@arcanepixels.de">admin@arcanepixels.de</a></p>

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
' WHERE id = 'default';

-- Prüfe ob Updates erfolgreich waren
SELECT
  'Updates erfolgreich' AS status,
  LENGTH(imprint) AS impressum_zeichen,
  LENGTH(privacy) AS datenschutz_zeichen
FROM site_settings
WHERE id = 'default';


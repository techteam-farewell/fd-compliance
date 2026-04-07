<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>The Farewell Guide – Compliance Check (Auto)</title>  
  <link rel="stylesheet" href="{{ asset('style.css') }}">
</head>
<body>
<header>
  <h1>The Farewell Guide – Compliance Check</h1>
  <p class="subtitle">Type a name → auto‑check → review → export. Google link & score are mandatory.</p>
</header>

<div id="autofetch" class="card banner">
  <label>
    <span><strong>Funeral Director name</strong></span>
    <input id="autoQuery" type="text" placeholder="e.g., A J Brooke, Ascot"/>
    <input id="autoPostcode" type="text" placeholder="Postcode (optional)"/>
    <button id="btnAuto" type="button">Run checks</button>
    <span id="autoStatus"></span>
  </label>
  <small>Set your endpoint in <code>app.js</code> (hydrateFromAuto). Fields stay editable for corrections.</small>
</div>

<main>
  <section class="card" id="firm-section">
    <h2>A) Firm Overview</h2>
    <div class="grid two">
      <label>Firm Name<input id="firmName" type="text" required></label>
      <label>Trading Name(s)<input id="tradingNames" type="text"></label>
      <label>Registered Company Name<input id="registeredName" type="text"></label>
      <label>Company Number<input id="companyNumber" type="text"></label>
      <label>Address<textarea id="address" rows="2"></textarea></label>
      <label>Website<input id="website" type="url" placeholder="https://..."></label>
      <label>Primary Phone<input id="phone" type="tel"></label>
      <label>Primary Email<input id="email" type="email"></label>
      <label>Date Checked<input id="dateChecked" type="date"></label>
    </div>
  </section>

  <section class="card" id="shopfront-section">
    <h2>Shopfront Photo (optional)</h2>
    <div class="grid two">
      <label>Upload image<input id="shopfrontFile" type="file" accept="image/*"/></label>
      <div><label>Preview</label><img id="shopfrontPreview" alt="Shopfront preview"/></div>
    </div>
  </section>

  <section class="card" id="membership-section">
    <h2>B) Trade Association Membership</h2>
    <div class="grid two">
      <label>NAFD Member?<select id="nafdMember"><option>Unknown</option><option>Yes</option><option>No</option></select></label>
      <label>NAFD Membership No.<input id="nafdNumber" type="text"></label>
      <label>SAIF Member?<select id="saifMember"><option>Unknown</option><option>Yes</option><option>No</option></select></label>
      <label>SAIF Membership No.<input id="saifNumber" type="text"></label>
    </div>
    <div class="grid two">
      <label>NAFD Evidence (URL)<input id="nafdEvidence" type="url"></label>
      <label>SAIF Evidence (URL)<input id="saifEvidence" type="url"></label>
    </div>
  </section>

  <section class="card" id="reviews-section">
    <h2>C) Reviews & Public Sentiment (Required)</h2>
    <div class="grid two">
      <label>Google Reviews URL <span class="req">*</span><input id="googleUrl" type="url" required></label>
      <label>Google Rating (★) <span class="req">*</span><input id="googleRating" type="number" min="0" max="5" step="0.1" required></label>
      <label>Total Google Reviews <span class="req">*</span><input id="googleCount" type="number" min="0" step="1" required></label>
      <label>Date Captured <span class="req">*</span><input id="googleDate" type="date" required></label>
    </div>
    <div class="grid two">
      <label>Other review links<textarea id="otherReviews" rows="2"></textarea></label>
      <label>Adverse media check<textarea id="adverse" rows="2"></textarea></label>
    </div>
  </section>

  <section class="card" id="companieshouse-section">
    <h2>D) Companies House & Corporate Status</h2>
    <div class="grid two">
      <label>Status<select id="chStatus"><option>Unknown</option><option>Active</option><option>Dormant</option><option>Other</option></select></label>
      <label>SIC<input id="sic" type="text"></label>
      <label>Registered Office<input id="registeredOffice" type="text"></label>
      <label>Director(s) / PSC(s)<input id="directors" type="text"></label>
      <label>Latest filings summary<textarea id="filings" rows="2"></textarea></label>
      <label>Next accounts due<input id="nextAccounts" type="date"></label>
      <label>Confirmation statement due<input id="nextCS" type="date"></label>
      <label>Gazette notices<textarea id="gazette" rows="2"></textarea></label>
    </div>
    <div class="grid two">
      <label>Companies House URL<input id="chUrl" type="url"/></label>
        <button type="button" class="secondary" id="btnCHOpen">
            Open Companies House
        </button>
    </div>
  </section>

  <section class="card" id="cma-section">
    <h2>E) CMA Order (2021) – Price Transparency</h2>
    <div class="grid two">
      <label>Online pricing present?<select id="cmaOnline"><option>Unknown</option><option>Yes</option><option>No</option></select></label>
      <label>Standardised Price List (SPL) URL<input id="splUrl" type="url"></label>
      <label>In‑branch display verified?<select id="cmaBranch"><option>Unknown</option><option>Yes</option><option>No</option></select></label>
      <label>In‑branch evidence notes<textarea id="branchNotes" rows="2"></textarea></label>
    </div>
  </section>

  <section class="card" id="fca-section">
    <h2>F) FCA Funeral Plan</h2>
    <div class="grid two">
      <label>Sell/arrange funeral plans?<select id="fcaDoPlans"><option>Unknown</option><option>Yes</option><option>No</option></select></label>
      <label>Provider Name<input id="fcaProvider" type="text"></label>
      <label>Provider FCA FRN<input id="fcaFRN" type="text"></label>
      <label>Relationship<select id="fcaRel"><option>—</option><option>Provider</option><option>Appointed Representative</option><option>Introducer</option></select></label>
    </div>
  </section>

  <section class="card" id="auth-section">
    <h2>G) Authorised Contacts</h2>
    <div class="grid two">
      <label>Authorised contact(s)<input id="authContacts" type="text"></label>
      <label>Authorisation email on file?<select id="authOnFile"><option>No</option><option>Yes</option></select></label>
      <label>Authorisation date<input id="authDate" type="date"></label>
    </div>
  </section>

  <section class="card" id="risk-section">
    <h2>H) Traffic‑Light Summary</h2>
    <div class="grid three">
      <label>NAFD<select id="riskNAFD"><option>GREEN</option><option>AMBER</option><option>RED</option></select></label>
      <label>SAIF<select id="riskSAIF"><option>GREEN</option><option>AMBER</option><option>RED</option></select></label>
      <label>Reviews<select id="riskReviews"><option>GREEN</option><option>AMBER</option><option>RED</option></select></label>
      <label>Companies House<select id="riskCH"><option>GREEN</option><option>AMBER</option><option>RED</option></select></label>
      <label>CMA Online<select id="riskCMAOnline"><option>GREEN</option><option>AMBER</option><option>RED</option></select></label>
      <label>CMA In‑Branch<select id="riskCMABranch"><option>GREEN</option><option>AMBER</option><option>RED</option></select></label>
      <label>FCA<select id="riskFCA"><option>GREEN</option><option>AMBER</option><option>RED</option></select></label>
      <label>NAP<select id="riskNAP"><option>GREEN</option><option>AMBER</option><option>RED</option></select></label>
    </div>
  </section>

  <section class="card actions">
    <button id="btnPreview" type="button">Preview Report</button>
    <button id="btnExportJSON" type="button">Export JSON</button>
    <button id="btnCopy" type="button" class="secondary">Copy Summary</button>
    <button id="btnReset" type="button" class="danger">Reset</button>
  </section>

  <section class="card" id="preview" hidden>
    <h2>Report Preview</h2>
    <div id="previewContent"></div>
    <button onclick="window.print()">Print / Save as PDF</button>
  </section>
</main>

<footer>
  <small>© The Farewell Guide, <span id="year"></span>. Drafts stored locally only.</small>
</footer>

<script src="{{ asset('app.js') }}"></script>
</body>
</html>

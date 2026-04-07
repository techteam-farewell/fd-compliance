(function(){
  const $ = (id) => document.getElementById(id);

  // 🔒 Prevent autosave during API hydration
  let isHydrating = false;

  // ✅ Store latest API response globally
  let apiData = null;

  const fields = [
    'firmName','tradingNames','registeredName','companyNumber','address','website','phone','email','dateChecked',
    'nafdMember','nafdNumber','saifMember','saifNumber','nafdEvidence','saifEvidence',
    'googleUrl','googleRating','googleCount','googleDate','otherReviews','adverse',
    'chStatus','sic','registeredOffice','directors','filings','nextAccounts','nextCS','gazette','chUrl',
    'cmaOnline','splUrl','cmaBranch','branchNotes','fcaDoPlans','fcaProvider','fcaFRN','fcaRel',
    'authContacts','authOnFile','authDate',
    'riskNAFD','riskSAIF','riskReviews','riskCH','riskCMAOnline','riskCMABranch','riskFCA','riskNAP',
    'shopfrontData'
  ];

  const ENDPOINT = '/api/compliance/lookup';

  /* -------------------------
     Draft handling
  --------------------------*/
  function loadDraft(){
    const raw = localStorage.getItem('tfg_compliance_draft');
    const data = raw ? JSON.parse(raw) : {};

    fields.forEach(f=>{
      if($(f) && data[f] !== undefined){
        $(f).value = data[f];
      }
    });

    if(data.shopfrontData && $('shopfrontPreview')){
      $('shopfrontPreview').src = data.shopfrontData;
    }

    const today = new Date().toISOString().slice(0,10);
    if(!$('dateChecked').value) $('dateChecked').value = today;
    if(!$('googleDate').value) $('googleDate').value = today;

    $('year').textContent = new Date().getFullYear();
  }

  function collect(){
    const data = {};
    fields.forEach(f => data[f] = $(f)?.value ?? '');
    data.savedAt = new Date().toISOString();
    return data;
  }

  function saveDraft(){
    if(isHydrating) return;
    localStorage.setItem('tfg_compliance_draft', JSON.stringify(collect()));
  }

  /* -------------------------
     Validation
  --------------------------*/
  function validateReviews(){
    const url = $('googleUrl').value.trim();
    const rating = parseFloat($('googleRating').value);
    const count = parseInt($('googleCount').value,10);
    const date = $('googleDate').value;

    if(!url || isNaN(rating) || isNaN(count) || !date){
      alert('Google Reviews URL, Rating, Count, and Date are required.');
      return false;
    }
    return true;
  }

  /* -------------------------
     Preview / Export
  --------------------------*/
  function preview(){
    if(!validateReviews()) return;

    const d = collect();
    const lines = [];

    lines.push(`# Funeral Director Compliance Report — ${d.firmName || 'Unknown Firm'}`);
    lines.push(`Date Checked: ${d.dateChecked || ''}\n`);

    lines.push('**Firm Overview**');
    lines.push(`- Registered Company: ${d.registeredName || '—'} (No. ${d.companyNumber || '—'})`);
    lines.push(`- Address: ${d.address || '—'}`);
    lines.push(`- Website: ${d.website || '—'}`);
    lines.push(`- Phone/Email: ${d.phone || '—'} / ${d.email || '—'}\n`);

    lines.push('**Google Reviews (Required)**');
    lines.push(`- Score: ${d.googleRating}★ from ${d.googleCount} reviews (captured ${d.googleDate})`);
    lines.push(`- Link: ${d.googleUrl}\n`);

    lines.push('**Companies House**');
    lines.push(`- Status: ${d.chStatus || '—'} | SIC: ${d.sic || '—'}`);
    lines.push(`- Registered Office: ${d.registeredOffice || '—'}`);
    lines.push(`- Next accounts due: ${d.nextAccounts || '—'} | CS due: ${d.nextCS || '—'}`);
    lines.push(`- CH URL: ${d.chUrl || '—'}\n`);

    lines.push('**Traffic-Light Summary**');
    lines.push(`- Reviews: ${d.riskReviews} | CH: ${d.riskCH}`);

    $('previewContent').textContent = lines.join('\r\n');
    $('preview').hidden = false;
  }

  function exportJSON(){
    if(!validateReviews()) return;
    const data = collect();
    const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
    const a = document.createElement('a');

    const fname = (data.firmName || 'compliance_record')
      .replace(/[^a-z0-9_-]+/gi,'_') + '_' +
      (data.dateChecked || new Date().toISOString().slice(0,10)) + '.json';

    a.href = URL.createObjectURL(blob);
    a.download = fname;
    a.click();
  }

  function copySummary(){
    if($('preview').hidden) preview();
    navigator.clipboard.writeText($('previewContent').textContent)
      .then(()=>alert('Summary copied.'));
  }

  /* -------------------------
     API hydration
  --------------------------*/
  async function hydrateFromAuto(){
    isHydrating = true;

    const q = $('autoQuery').value.trim();
    const pc = $('autoPostcode').value.trim();
    const status = $('autoStatus');

    if(!q){
      alert('Enter a name.');
      isHydrating = false;
      return;
    }

    status.textContent = 'Looking up…';

    try{
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          'Accept':'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: q, postcode: pc })
      });

      if(!res.ok) throw new Error(res.status);

      const data = await res.json();

      // ✅ store globally for button usage
      apiData = data;

      console.log('API DATA', data);

      Object.entries(data).forEach(([key,value])=>{
        const el = $(key);
        if(!el) return;

        if(value === null || value === undefined) value = '';

        if(el.tagName === 'SELECT'){
          if(Array.from(el.options).some(opt => opt.value === value)){
            el.value = value;
          }
        } else if(el.type === 'date' && value){
          el.value = value.slice(0,10);
        } else {
          el.value = value;
        }
      });

      // optional UX improvement
      $('btnCHOpen').disabled = !data.chUrl;

      saveDraft();
      status.textContent = '✓ Populated — review & save';
    }
    catch(err){
      console.error(err);
      apiData = null;
      status.textContent = 'Lookup error — fill fields manually.';
    }
    finally{
      isHydrating = false;
    }
  }

  /* -------------------------
     Shopfront upload
  --------------------------*/
  const shopfrontFile = $('shopfrontFile');
  const shopfrontPreview = $('shopfrontPreview');

  function handleShopfrontFile(){
    const file = shopfrontFile.files && shopfrontFile.files[0];
    if(!file) return;

    const reader = new FileReader();
    reader.onload = (e)=>{
      const dataUrl = e.target.result;
      shopfrontPreview.src = dataUrl;

      const raw = localStorage.getItem('tfg_compliance_draft');
      const obj = raw ? JSON.parse(raw) : {};
      obj.shopfrontData = dataUrl;

      localStorage.setItem('tfg_compliance_draft', JSON.stringify(obj));
    };
    reader.readAsDataURL(file);
  }

  shopfrontFile && shopfrontFile.addEventListener('change', handleShopfrontFile);

  /* -------------------------
     Events
  --------------------------*/
  window.addEventListener('load', loadDraft);

  $('btnPreview').addEventListener('click', preview);
  $('btnExportJSON').addEventListener('click', exportJSON);
  $('btnCopy').addEventListener('click', copySummary);

  $('btnReset').addEventListener('click', ()=>{
    if(confirm('Clear all fields and local draft?')){
      localStorage.removeItem('tfg_compliance_draft');
      location.reload();
    }
  });

  $('btnAuto').addEventListener('click', hydrateFromAuto);

  // ✅ Companies House button (DYNAMIC FIX)
  $('btnCHOpen')?.addEventListener('click', () => {
    const url = apiData?.chUrl || $('chUrl')?.value;

    if (!url) {
      alert('No Companies House URL found. Run a lookup first.');
      return;
    }

    window.open(url, '_blank');
  });

  setInterval(saveDraft, 1500);

})();
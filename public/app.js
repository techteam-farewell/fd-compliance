(function(){
  const $ = (id) => document.getElementById(id);

  let isHydrating = false;
  let apiData = null;

  const ENDPOINT = '/api/compliance/lookup';

  /* -------------------------
     VALIDATION
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
     PREVIEW
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
    lines.push(`- Filings: ${d.filings || '—'}`);
    lines.push(`- CH URL: ${d.chUrl || '—'}\n`);

    lines.push('**Traffic-Light Summary**');
    lines.push(`- Reviews: ${d.riskReviews} | CH: ${d.riskCH}`);

    $('previewContent').textContent = lines.join('\r\n');
    $('preview').hidden = false;
  }

  function collect(){
    return {
      firmName: $('firmName').value,
      registeredName: $('registeredName').value,
      companyNumber: $('companyNumber').value,
      address: $('address').value,
      website: $('website').value,
      phone: $('phone').value,
      email: $('email').value,
      dateChecked: $('dateChecked').value,
      googleUrl: $('googleUrl').value,
      googleRating: $('googleRating').value,
      googleCount: $('googleCount').value,
      googleDate: $('googleDate').value,
      chStatus: $('chStatus').value,
      sic: $('sic').value,
      registeredOffice: $('registeredOffice').value,
      nextAccounts: $('nextAccounts').value,
      nextCS: $('nextCS').value,
      filings: $('filings').value,
      chUrl: $('chUrl').value,
      riskReviews: $('riskReviews').value,
      riskCH: $('riskCH').value
    };
  }

  /* -------------------------
     EXPORT
  --------------------------*/
  function exportJSON(){
    if(!validateReviews()) return;

    const data = collect();

    const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
    const a = document.createElement('a');

    a.href = URL.createObjectURL(blob);
    a.download = 'compliance_report.json';
    a.click();
  }

  /* -------------------------
     API
  --------------------------*/
  async function hydrateFromAuto(){

    isHydrating = true;

    const q = $('autoQuery').value.trim();
    const pc = $('autoPostcode').value.trim();
    const status = $('autoStatus');

    if(!q){
      alert('Enter a name');
      isHydrating = false;
      return;
    }

    status.textContent = 'Looking up…';

    try{
      const res = await fetch(ENDPOINT,{
        method:'POST',
        headers:{
          'Content-Type':'application/json',
          'Accept':'application/json'
        },
        body: JSON.stringify({query:q, postcode:pc})
      });

      const data = await res.json();
      apiData = data;

      populatePlaces(data.places);

      // ❗ DO NOT auto-apply first result anymore
      // User must choose correct one

      fillFields(data);

      $('btnCHOpen').disabled = !data.chUrl;

      status.textContent = 'Select correct business below';

    }catch(e){
      console.error(e);
      status.textContent = 'Error fetching data';
    }

    isHydrating = false;
  }

  function populatePlaces(places){
    const select = $('placeSelect');
    select.innerHTML = '<option value="">-- Select correct business --</option>';

    if(!places) return;

    places.forEach((p,i)=>{
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = `${p.name} (${p.address || 'No address'})`;
      select.appendChild(opt);
    });
  }

  function applyPlace(place){
    if(!place) return;

    $('firmName').value = place.name || '';
    $('address').value = place.address || '';
    $('googleUrl').value = place.googleMapsUri || '';
    $('googleRating').value = place.rating || '';
    $('googleCount').value = place.userRatingCount || '';
  }

  function fillFields(data){
    Object.entries(data).forEach(([key,value])=>{
      const el = $(key);
      if(!el) return;

      if(value === null) value = '';

      if(el.type === 'date' && value){
        el.value = value.slice(0,10);
      } else {
        el.value = value;
      }
    });

    if(data.shopfrontData){
      $('shopfrontPreview').src = data.shopfrontData;
    }
  }

  /* -------------------------
     EVENTS
  --------------------------*/
  window.addEventListener('load', ()=> {
    $('dateChecked').value = new Date().toISOString().slice(0,10);
    $('googleDate').value = new Date().toISOString().slice(0,10);
  });

  $('btnAuto').addEventListener('click', hydrateFromAuto);

  $('placeSelect').addEventListener('change',(e)=>{
    const index = e.target.value;

    if(index === '') return;

    applyPlace(apiData.places[index]);

    $('autoStatus').textContent = '✓ Correct business selected';
  });

  $('btnCHOpen').addEventListener('click', ()=>{
    const url = apiData?.chUrl || $('chUrl').value;

    if(!url){
      alert('No Companies House URL');
      return;
    }

    window.open(url,'_blank');
  });

  $('btnPreview').addEventListener('click', preview);
  $('btnExportJSON').addEventListener('click', exportJSON);

})();
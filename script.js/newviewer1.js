// newviewer.js — TONO Eczema Visualizer (final merged & fixed)
console.log("newviewer.js loaded");

document.addEventListener('DOMContentLoaded', function () {
  // -------------------------------------------------------------------
  // 1) GLOBAL STATE
  // -------------------------------------------------------------------
  window.state = {
    type: 'atopic',         // change to '' if you prefer a blank start
    region: 'face-neck',    // change to '' if you prefer a blank start
    tone: 'dark',
    severity: 'normal'
  };

  // -------------------------------------------------------------------
  // 2) HELPERS
  // -------------------------------------------------------------------
  function normalizeType(val) {
    // Map UI values to your data/content keys
    const map = {
      neurodermatitis: 'neuro',
      dyshidrotic: 'dyshidrotic',
      nummular: 'nummular',
      seborrheic: 'seborrheic',
      atopic: 'atopic',
      contact: 'contact',
      stasis: 'stasis'
    };
    return map[val] || val;
  }

  function titleizeRegion(slug) {
    return (slug || '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  // If data is missing for some type, use this minimal fallback so UI isn't empty
  const REGION_FALLBACK = {
    atopic: ['face-neck', 'flexural-fold-elbow'],
    contact: ['face', 'hand'],
    seborrheic: ['scalp', 'face'],
    stasis: ['ankles', 'shins'],
    neuro: ['neck', 'wrists'],
    nummular: ['legs', 'arms'],
    dyshidrotic: ['palms', 'soles']
  };

  // -------------------------------------------------------------------
  // 3) DOM REFS
  // -------------------------------------------------------------------
  const menuIcon          = document.getElementById('menuIcon');
  const fullScreenMenu    = document.getElementById('fullScreenMenu');

  const eczemaDropdown    = document.getElementById('eczemaDropdown');
  const dropdownSelected  = eczemaDropdown?.querySelector('.dropdown-selected');
  const dropdownOptionsBx = eczemaDropdown?.querySelector('.dropdown-options');

  const skinToneOptions   = document.querySelectorAll('#skinTones .swatch');
  const severityOptions   = document.querySelectorAll('#severities .severity-btn');
  const regionsContainer  = document.getElementById('regions');

  const visualizerImage   = document.getElementById('visualizerImage');
  const compareBtn        = document.getElementById('compareBtn');

  // -------------------------------------------------------------------
  // 4) MOBILE MENU (unchanged)
  // -------------------------------------------------------------------
  if (menuIcon && fullScreenMenu) {
    menuIcon.onclick = () => {
      menuIcon.classList.toggle('open');
      const opening = !fullScreenMenu.classList.contains('show');
      if (opening) {
        fullScreenMenu.style.display = 'flex';
        setTimeout(() => {
          fullScreenMenu.classList.add('show');
          document.body.classList.add('no-scroll');
        }, 10);
      } else {
        fullScreenMenu.classList.remove('show');
        document.body.classList.remove('no-scroll');
        setTimeout(() => { fullScreenMenu.style.display = 'none'; }, 400);
      }
    };
  }

  // -------------------------------------------------------------------
  // 5) TABS
  // -------------------------------------------------------------------
  (function initTabs(){
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels  = document.querySelectorAll('.tab-panel');
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const target = button.getAttribute('data-tab');
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabPanels.forEach(panel => panel.classList.remove('active'));
        button.classList.add('active');
        document.getElementById(target)?.classList.add('active');
      });
    });
  })();

  // -------------------------------------------------------------------
  // 6) ABOUT / DIFFERENTIAL
  // -------------------------------------------------------------------
  function updateConditionText(type) {
    const aboutTab = document.getElementById('about');
    const diffTab  = document.getElementById('differential');
    if (!aboutTab || !diffTab) return;

    const content = (window.eczemaContent || {}); // conditionContent.js should set window.eczemaContent
    const candidates = [type, normalizeType(type)];

    let entry = null;
    for (const key of candidates) {
      if (key && content[key]) { entry = content[key]; break; }
    }

    // final fuzzy match, just in case keys differ
    if (!entry) {
      const t = (type || '').toLowerCase();
      const keys = Object.keys(content);
      const k = keys.find(k => k.toLowerCase() === t || k.toLowerCase().includes(t) || t.includes(k.toLowerCase()));
      if (k) entry = content[k];
    }

    if (entry) {
      aboutTab.innerHTML = `
        <h3>Condition</h3>
        <p>${entry.about || ''}</p>
      `;
      const list = Array.isArray(entry.differential) ? entry.differential : [];
      diffTab.innerHTML = `
        <h3>Differential Diagnosis</h3>
        <ul>${list.map(i => `<li>${i}</li>`).join('')}</ul>
      `;
    } else {
      aboutTab.innerHTML = "<p>No information available for this condition.</p>";
      diffTab.innerHTML = "";
    }
  }

  // -------------------------------------------------------------------
  // 7) REGIONS
  // -------------------------------------------------------------------
  function updateRegionsForType(type) {
    if (!regionsContainer) return;
    const t = normalizeType(type);

    // collect regions from window.eczemaImages (data.js)
    let validRegions = [];
    if (Array.isArray(window.eczemaImages)) {
      validRegions = [...new Set(
        window.eczemaImages.filter(img => img.type === t).map(img => img.region)
      )];
    }
    if (!validRegions.length) validRegions = REGION_FALLBACK[t] || [];

    regionsContainer.innerHTML = '';
    validRegions.forEach(region => {
      const btn = document.createElement('button');
      btn.type = 'button';                // prevent form submit
      btn.className = 'region-btn';
      btn.setAttribute('data-region', region);
      btn.textContent = titleizeRegion(region);
      if (region === window.state.region) btn.classList.add('selected');
      regionsContainer.appendChild(btn);
    });
  }

  // one robust, delegated click handler works even after rebuilds
  if (regionsContainer) {
    regionsContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('button.region-btn');
      if (!btn || !regionsContainer.contains(btn)) return;

      e.preventDefault();
      e.stopPropagation();

      regionsContainer.querySelectorAll('button.region-btn')
        .forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      window.state.region = btn.getAttribute('data-region') || '';
      updateImage();
    });
  }

  // -------------------------------------------------------------------
  // 8) DROPDOWN (open/close + select)
  // -------------------------------------------------------------------
  if (eczemaDropdown && dropdownSelected && dropdownOptionsBx) {
    dropdownSelected.addEventListener('click', (e) => {
      e.stopPropagation();
      const willOpen = !eczemaDropdown.classList.contains('active');
      eczemaDropdown.classList.toggle('active', willOpen);
    });

    dropdownOptionsBx.addEventListener('click', (e) => {
      const option = e.target.closest('div[data-value]');
      if (!option) return;

      const rawVal = option.getAttribute('data-value'); // e.g. "neurodermatitis"
      const val    = normalizeType(rawVal);             // → "neuro"
      const label  = option.textContent;

      dropdownSelected.textContent = label;
      dropdownSelected.setAttribute('data-value', rawVal);

      window.state.type = val;

      updateRegionsForType(val);
      // clear region selection if it's not valid for the new type
      const stillValid = !!document.querySelector(`#regions .region-btn[data-region="${window.state.region}"]`);
      if (!stillValid) window.state.region = '';

      updateConditionText(val);
      updateImage();

      eczemaDropdown.classList.remove('active');
    });

    document.addEventListener('click', () => {
      eczemaDropdown.classList.remove('active');
    }, { capture: true });
  }

  // -------------------------------------------------------------------
  // 9) TONE / SEVERITY
  // -------------------------------------------------------------------
  skinToneOptions.forEach(option => {
    option.addEventListener('click', () => {
      skinToneOptions.forEach(opt => opt.classList.remove('selected'));
      option.classList.add('selected');
      window.state.tone = option.getAttribute('data-tone') || '';
      updateImage();
    });
  });

  severityOptions.forEach(option => {
    option.addEventListener('click', () => {
      severityOptions.forEach(opt => opt.classList.remove('selected'));
      option.classList.add('selected');
      window.state.severity = option.getAttribute('data-severity') || '';
      updateImage();
    });
  });

  // -------------------------------------------------------------------
  // 10) IMAGE RENDER
  // -------------------------------------------------------------------
  function updateImage() {
    const { type, region, tone, severity } = window.state;
    if (type && region && tone && severity) {
      const t = normalizeType(type);
      const src = `../images/eczema/${t}/${t}-${region}-${tone}-${severity}.jpg`;
      if (visualizerImage) visualizerImage.src = src;
      localStorage.setItem('lastViewedImage', `${t}/${t}-${region}-${tone}-${severity}.jpg`);
    } else {
      if (visualizerImage) visualizerImage.src = '../images/eczema/placeholder.png';
    }
  }

  // -------------------------------------------------------------------
  // 11) COMPARE BUTTON → compare.html
  // -------------------------------------------------------------------
  if (compareBtn) {
    const basePath = './compare.html'; // your file is in /pages/ relative to viewer.html

    function buildURLFromState() {
      const { type, region, tone, severity } = window.state || {};
      const sel = {
        type: type || 'atopic',
        region: region || 'face-neck',
        tone: tone || 'dark',
        severity: severity || 'normal'
      };
      const q = new URLSearchParams(sel).toString();
      return `${basePath}?${q}`;
    }

    compareBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.viewerSelection = { ...window.state }; // fast path
      window.location.href = buildURLFromState();   // refresh/share proof
    });
  }

  // -------------------------------------------------------------------
  // 12) INITIAL UI SYNC
  // -------------------------------------------------------------------
  // Make the dropdown label match default state
  if (dropdownSelected) {
    const labelMap = {
      atopic: 'Atopic Dermatitis',
      contact: 'Contact Dermatitis',
      dyshidrotic: 'Dyshidrotic Eczema',
      neuro: 'Neurodermatitis',
      nummular: 'Nummular Eczema',
      seborrheic: 'Seborrheic Dermatitis',
      stasis: 'Stasis Dermatitis'
    };
    const lbl = labelMap[normalizeType(window.state.type)] || 'Select Type of Eczema';
    dropdownSelected.textContent = lbl;
    // store the raw UI value that corresponds to current normalized type
    const uiRaw = (window.state.type === 'neuro') ? 'neurodermatitis' : window.state.type;
    dropdownSelected.setAttribute('data-value', uiRaw);
  }

  // Build region buttons for the default type and highlight selected region
  updateRegionsForType(window.state.type);
  regionsContainer?.querySelector(`.region-btn[data-region="${window.state.region}"]`)?.classList.add('selected');

  // Mark default tone/severity in UI
  document.querySelector(`#skinTones .swatch[data-tone="${window.state.tone}"]`)?.classList.add('selected');
  document.querySelector(`#severities .severity-btn[data-severity="${window.state.severity}"]`)?.classList.add('selected');

  // Fill content + image
  updateConditionText(window.state.type);
  updateImage();
});

//--- checkmark js 
// --- Gooey Skin Tone Swatches: Single-Select (Radio Behavior) ---
(function toneRadioBehavior() {
    const swatchNodes = Array.from(document.querySelectorAll('.swatch'));
    const inputs = swatchNodes
      .map(s => s.querySelector('.checkbox-wrapper-12 input[type="checkbox"]'))
      .filter(Boolean);
  
    if (!swatchNodes.length || !inputs.length) return;
  
    function activate(targetInput) {
      inputs.forEach(i => {
        const sw = i.closest('.swatch');
        const isActive = i === targetInput;
        i.checked = isActive;
        if (sw) {
          sw.classList.toggle('selected', isActive);
          sw.setAttribute('aria-checked', String(isActive));
        }
      });
  
      const activeSwatch = targetInput.closest('.swatch');
      if (activeSwatch) {
        activeSwatch.dispatchEvent(
          new CustomEvent('tonechange', { bubbles: true, detail: { tone: activeSwatch.dataset.tone } })
        );
      }
    }
  
    // Click anywhere on swatch → select it
    swatchNodes.forEach(swatch => {
      swatch.addEventListener('click', (e) => {
        const withinControl = e.target.closest && e.target.closest('.checkbox-wrapper-12');
        if (withinControl) return; // let input/label handle
        const input = swatch.querySelector('.checkbox-wrapper-12 input[type="checkbox"]');
        if (input) activate(input);
      });
    });
  
    // Direct checkbox changes → enforce single-select
    inputs.forEach(input => {
      input.addEventListener('change', () => {
        if (!input.checked) input.checked = true; // never allow none selected
        activate(input);
      });
    });
  
    // Default: first tone if none pre-checked
    const alreadyChecked = inputs.find(i => i.checked);
    activate(alreadyChecked || inputs[0]);
  })();
  
  (function(){
    // Helpers
    const $ = sel => document.querySelector(sel);
    const $$ = sel => Array.from(document.querySelectorAll(sel));
    const titleCase = s => (s||'').replace(/[-_]/g,' ').replace(/\b\w/g,c=>c.toUpperCase()).trim();
  
    const TYPE_LABELS = {
      atopic: 'Atopic Dermatitis',
      contact: 'Contact Dermatitis',
      dyshidrotic: 'Dyshidrotic Eczema',
      neurodermatitis: 'Neurodermatitis',
      neuro: 'Neurodermatitis',
      nummular: 'Nummular Dermatitis',
      seborrheic: 'Seborrheic Dermatitis',
      stasis: 'Stasis Dermatitis'
    };
  
    function getSelectedType(){
      // read from the custom dropdown
      const dd = $('#eczemaDropdown .dropdown-selected');
      // your custom dropdown stores the selected label in the element text
      // and the value in the clicked option's data-value.
      // We'll try to read the current value from a data attr the script sets,
      // or fall back to text matching.
      const selectedOpt = $('#eczemaDropdown .dropdown-options [data-selected="true"]');
      if (selectedOpt) return selectedOpt.getAttribute('data-value') || 'atopic';
  
      // Fallback: try to infer from visible text (robust to your current UI)
      const t = (dd?.textContent || '').toLowerCase();
      if (t.includes('atopic')) return 'atopic';
      if (t.includes('contact')) return 'contact';
      if (t.includes('dyshid')) return 'dyshidrotic';
      if (t.includes('neuro')) return 'neuro';
      if (t.includes('nummular')) return 'nummular';
      if (t.includes('seborrheic')) return 'seborrheic';
      if (t.includes('stasis')) return 'stasis';
      return 'atopic';
    }
  
    function getSelectedRegion(){
      const active = $('#regions .region-btn.is-active') || $('#regions .region-btn[aria-pressed="true"]');
      if (active) return active.getAttribute('data-region');
      // fallback to first button’s data-region
      const first = $('#regions .region-btn');
      return first ? first.getAttribute('data-region') : 'face-neck';
    }
  
    function getSelectedSeverity(){
      const active = $('#severities .severity-btn.is-active') || $('#severities .severity-btn[aria-pressed="true"]');
      if (active) return active.getAttribute('data-severity');
      // fallback: default "normal"
      return 'normal';
    }
  
    function getSelectedTone(){
      // your tones are checkboxes inside .swatch elements, only one should be checked at a time
      const checked = $('#skinTones input[type="checkbox"]:checked');
      if (checked) {
        // id pattern: tone-light / tone-medium / tone-olive / tone-dark
        const id = checked.id || '';
        const m = id.match(/^tone-(.+)$/);
        if (m) return m[1];
      }
      // fallback: look for aria-checked "true" on the swatch radiogroup
      const aria = $('#skinTones [role="radio"][aria-checked="true"]');
      if (aria) return aria.getAttribute('data-tone');
      return 'light';
    }
  
    // Build label like: "Atopic Dermatitis • Face Neck • Light • Mild"
    function buildLabel(){
      const type = getSelectedType();
      const region = getSelectedRegion();
      const tone = getSelectedTone();
      const severity = getSelectedSeverity();
  
      const typeLabel = TYPE_LABELS[type] || titleCase(type);
      const regionLabel = titleCase(region);
      return `${typeLabel} • ${titleCase(regionLabel)} • ${titleCase(tone)} • ${titleCase(severity)}`;
    }
  
    function updateImageMeta(){
      const el = document.getElementById('imageMeta');
      if (!el) return;
      el.textContent = buildLabel();
    }
  
    // Wire up listeners (lightweight & resilient)
    function onClickUpdate(containerSel){
      const c = $(containerSel);
      if (!c) return;
      c.addEventListener('click', updateImageMeta, true);
      c.addEventListener('change', updateImageMeta, true);
    }
  
    // Run once on load and then on every interaction
    document.addEventListener('DOMContentLoaded', updateImageMeta);
    onClickUpdate('#eczemaDropdown');
    onClickUpdate('#skinTones');
    onClickUpdate('#severities');
    onClickUpdate('#regions');
  
    // Optional: expose for your existing code if you want to call it after you swap the image
    window.updateViewerMetaBadge = updateImageMeta;
  })();
  
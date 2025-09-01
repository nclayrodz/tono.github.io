// viewer.js — TONO Eczema Visualizer (merged + fixed)
console.log("viewer.js is running");

document.addEventListener('DOMContentLoaded', function () {

  // -------------------------------------------------------------------
  // 1) GLOBAL STATE (single source of truth)
  //    If you want a blank start, set each field to ''.
  // -------------------------------------------------------------------
  window.state = {
    type: 'atopic',
    region: 'face-neck',
    tone: 'dark',
    severity: 'normal'
  };

  // -------------------------------------------------------------------
  // 2) Helpers
  // -------------------------------------------------------------------
  function normalizeType(val) {
    const map = {
      neurodermatitis: 'neuro', // UI label → data key
      dyshidrotic: 'dyshidrotic',
      nummular: 'nummular',
      seborrheic: 'seborrheic',
      atopic: 'atopic',
      contact: 'contact',
      stasis: 'stasis'
    };
    return map[val] || val;
  }

  // If data.js doesn't return regions for a type, use this safety net:
const REGION_FALLBACK = {
    atopic:       ['face-neck', 'flexural-fold-elbow'],
    contact:      ['face', 'hand'],
    dyshidrotic:  ['palms', 'soles'],
    neuro:        ['neck', 'wrists'],
    nummular:     ['legs', 'arms'],
    seborrheic:   ['scalp', 'face'],
    stasis:       ['ankles', 'shins']
  };
  

  function titleizeRegion(slug) {
    return slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  // -------------------------------------------------------------------
  // 3) DOM refs (declare ONCE!)
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
  // 4) Mobile menu
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
  // 5) Tabs
  // -------------------------------------------------------------------
  (function initTabs() {
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
  // 6) Condition content (About / Differential)
  // -------------------------------------------------------------------
  function updateConditionText(type) {
    const t = normalizeType(type);
    const aboutTab = document.getElementById("about");
    const diffTab  = document.getElementById("differential");
    if (!aboutTab || !diffTab) return;
  
    // Be robust about where the content lives
    const content = window.eczemaContent || window.conditionContent || window.CONTENT || {};
    const entry = content[t];
  
    if (entry) {
      aboutTab.innerHTML = `
        <h3>Condition</h3>
        <p>${entry.about}</p>
      `;
      diffTab.innerHTML = `
        <h3>Differential Diagnosis</h3>
        <ul>${(entry.differential || []).map(item => `<li>${item}</li>`).join('')}</ul>
      `;
    } else {
      console.warn('[TONO] No eczemaContent entry for key:', t,
                   'Available keys:', Object.keys(content || {}));
      aboutTab.innerHTML = "<p>No information available for this condition.</p>";
      diffTab.innerHTML = "";
    }
  }
  
  // -------------------------------------------------------------------
  // 7) Regions: rebuild based on selected type
  // -------------------------------------------------------------------
  function updateRegionsForType(type) {
    if (!regionsContainer) return;
    const t = normalizeType(type);
  
    // Try to pull from eczemaImages; fall back if empty
    let validRegions = [];
    if (Array.isArray(window.eczemaImages)) {
      validRegions = [...new Set(
        eczemaImages
          .filter(img => img.type === t)
          .map(img => img.region)
      )];
    }
  
    if (!validRegions.length) {
      validRegions = REGION_FALLBACK[t] || [];
      console.warn('[TONO] No regions found in eczemaImages for type=', t,
                   '→ using fallback:', validRegions);
    }
  
    regionsContainer.innerHTML = '';
    validRegions.forEach(region => {
      const btn = document.createElement("button");
      btn.className = "region-btn";
      btn.setAttribute("data-region", region);
      btn.textContent = region.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      if (region === window.state.region) btn.classList.add('selected');
      regionsContainer.appendChild(btn);
    });
  }
  
  // -------------------------------------------------------------------
  // 8) Dropdown (open/close + select)
  // -------------------------------------------------------------------
  if (eczemaDropdown && dropdownSelected && dropdownOptionsBx) {
    // open/close
    dropdownSelected.addEventListener('click', (e) => {
      e.stopPropagation();
      const willOpen = !eczemaDropdown.classList.contains('active');
      eczemaDropdown.classList.toggle('active', willOpen);
      // CSS handles display via .active, but you can force it too:
      // dropdownOptionsBx.style.display = willOpen ? 'flex' : 'none';
    });

    // choose an option
    dropdownOptionsBx.addEventListener('click', (e) => {
      const option = e.target.closest('div[data-value]');
      if (!option) return;

      const rawVal = option.getAttribute('data-value'); // e.g. "neurodermatitis"
      const val    = normalizeType(rawVal);             // → "neuro"
      const label  = option.textContent;

      dropdownSelected.textContent = label;
      dropdownSelected.setAttribute('data-value', rawVal);

      window.state.type = val;

      // refresh dependent UI
      updateRegionsForType(val);
      const stillValid = !!document.querySelector(`#regions .region-btn[data-region="${window.state.region}"]`);
      if (!stillValid) window.state.region = '';
      updateConditionText(val);
      updateImage();

      eczemaDropdown.classList.remove('active');
      // dropdownOptionsBx.style.display = 'none';
    });

    // click outside closes
    document.addEventListener('click', () => {
      eczemaDropdown.classList.remove('active');
      // dropdownOptionsBx.style.display = 'none';
    }, { capture: true });
  }

  // -------------------------------------------------------------------
  // 9) Tone / Severity controls
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
  // 10) Update visualizer image from state
  // -------------------------------------------------------------------
  function updateImage() {
    const { type, region, tone, severity } = window.state;

    if (type && region && tone && severity) {
      const t = normalizeType(type);
      const filename = `../images/eczema/${t}/${t}-${region}-${tone}-${severity}.jpg`;
      console.log("Trying to load:", filename);
      if (visualizerImage) visualizerImage.src = filename;

      localStorage.setItem('lastViewedImage', `${t}/${t}-${region}-${tone}-${severity}.jpg`);
    } else {
      if (visualizerImage) visualizerImage.src = '../images/eczema/placeholder.png';
    }
  }

  // -------------------------------------------------------------------
  // 11) Compare button → compare.html (with URL params + session handoff)
  // -------------------------------------------------------------------
  if (compareBtn) {
    const basePath = './compare.html'; // adjust if needed

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
      window.viewerSelection = { ...window.state }; // fast path for same session
      window.location.href = buildURLFromState();   // refresh/share proof
    });
  }

  // -------------------------------------------------------------------
  // 12) Initial UI sync with defaults
  // -------------------------------------------------------------------
  // Dropdown label matching default type
  if (dropdownSelected) {
    const typeLabelMap = {
      atopic: 'Atopic Dermatitis',
      contact: 'Contact Dermatitis',
      dyshidrotic: 'Dyshidrotic Eczema',
      neuro: 'Neurodermatitis',
      nummular: 'Nummular Eczema',
      seborrheic: 'Seborrheic Dermatitis',
      stasis: 'Stasis Dermatitis'
    };
    const label = typeLabelMap[normalizeType(window.state.type)] || 'Select Type of Eczema';
    dropdownSelected.textContent = label;
    // store the UI raw value that maps back to this normalized type
    const uiRawValueMap = { neuro:'neurodermatitis' };
    dropdownSelected.setAttribute('data-value', uiRawValueMap[window.state.type] || window.state.type);
  }

  // Build regions for default type and reflect selected region
  updateRegionsForType(window.state.type);
  const preselectRegionBtn = regionsContainer?.querySelector(`.region-btn[data-region="${window.state.region}"]`);
  if (preselectRegionBtn) preselectRegionBtn.classList.add('selected');

  // Mark default tone/severity in UI
  document.querySelector(`#skinTones .swatch[data-tone="${window.state.tone}"]`)?.classList.add('selected');
  document.querySelector(`#severities .severity-btn[data-severity="${window.state.severity}"]`)?.classList.add('selected');

  // Fill content + image
  updateConditionText(window.state.type);
  updateImage();
});
// -------------------------------------------------------------------
// 13) Initial UI sync with defaults
// -------------------------------------------------------------------
updateRegionsForType(window.state.type);
updateConditionText(window.state.type);
updateImage();

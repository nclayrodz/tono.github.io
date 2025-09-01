// newviewer.js — TONO Eczema Visualizer (final, unified, de-lagged)
console.log("newviewer.js loaded");

document.addEventListener('DOMContentLoaded', () => {
  // -------------------------------------------------------------------
  // 1) SINGLE SOURCE OF TRUTH (no reading back from DOM)
  // -------------------------------------------------------------------
  const state = {
    type: 'atopic',         // normalized keys used by your image folders (e.g., 'neuro')
    region: 'face-neck',
    tone: 'dark',
    severity: 'normal'
  };

  // -------------------------------------------------------------------
  // 2) HELPERS
  // -------------------------------------------------------------------
  function normalizeType(val) {
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

  const TYPE_LABELS = {
    atopic: 'Atopic Dermatitis',
    contact: 'Contact Dermatitis',
    dyshidrotic: 'Dyshidrotic Eczema',
    neuro: 'Neurodermatitis',
    nummular: 'Nummular Eczema',
    seborrheic: 'Seborrheic Dermatitis',
    stasis: 'Stasis Dermatitis'
  };

  const REGION_FALLBACK = {
    atopic: ['face-neck', 'flexural-fold-elbow'],
    contact: ['face', 'hand'],
    seborrheic: ['scalp', 'face'],
    stasis: ['ankles', 'shins'],
    neuro: ['neck', 'wrists'],
    nummular: ['legs', 'arms'],
    dyshidrotic: ['palms', 'soles']
  };

  const titleCase = (s) => (s || '').replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).trim();
  const prettyRegion = (r) => titleCase(r);

  // Prefer your resolver if present to avoid path mismatches
  function resolveImagePath(type, region, tone, severity) {
    if (typeof getImagePath === 'function') {
      return getImagePath(type, region, tone, severity);
    }
    // Default path pattern (matches prior convention)
    return `../images/eczema/${type}/${type}-${region}-${tone}-${severity}.jpg`;
  }

  // -------------------------------------------------------------------
  // 3) DOM
  // -------------------------------------------------------------------
  const els = {
    menuIcon: document.getElementById('menuIcon'),
    fullScreenMenu: document.getElementById('fullScreenMenu'),

    dropdown: document.getElementById('eczemaDropdown'),
    dropdownSelected: document.querySelector('#eczemaDropdown .dropdown-selected'),
    dropdownOptions: document.querySelector('#eczemaDropdown .dropdown-options'),

    tones: document.getElementById('skinTones'),
    severities: document.getElementById('severities'),
    regions: document.getElementById('regions'),

    img: document.getElementById('visualizerImage'),
    meta: document.getElementById('imageMeta'),
    compareBtn: document.getElementById('compareBtn')
  };

  // -------------------------------------------------------------------
  // 4) MOBILE MENU (as-is)
  // -------------------------------------------------------------------
  if (els.menuIcon && els.fullScreenMenu) {
    els.menuIcon.onclick = () => {
      els.menuIcon.classList.toggle('open');
      const opening = !els.fullScreenMenu.classList.contains('show');
      if (opening) {
        els.fullScreenMenu.style.display = 'flex';
        setTimeout(() => {
          els.fullScreenMenu.classList.add('show');
          document.body.classList.add('no-scroll');
        }, 10);
      } else {
        els.fullScreenMenu.classList.remove('show');
        document.body.classList.remove('no-scroll');
        setTimeout(() => { els.fullScreenMenu.style.display = 'none'; }, 400);
      }
    };
  }

  // -------------------------------------------------------------------
  // 5) TABS (as-is)
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
  // 6) ABOUT / DIFFERENTIAL (reads window.eczemaContent if present)
  // -------------------------------------------------------------------
  function updateConditionText(type) {
    const aboutTab = document.getElementById('about');
    const diffTab  = document.getElementById('differential');
    if (!aboutTab || !diffTab) return;

    const content = (window.eczemaContent || {});
    const candidates = [type, normalizeType(type)];

    let entry = null;
    for (const key of candidates) {
      if (key && content[key]) { entry = content[key]; break; }
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
  // 7) REGIONS (build from data.js if available; fallback otherwise)
  // -------------------------------------------------------------------
  function buildRegionsForType(typeNorm) {
    const t = normalizeType(typeNorm);
    let validRegions = [];
    if (Array.isArray(window.eczemaImages)) {
      validRegions = [...new Set(
        window.eczemaImages.filter(img => img.type === t).map(img => img.region)
      )];
    }
    if (!validRegions.length) validRegions = REGION_FALLBACK[t] || [];

    els.regions.innerHTML = '';
    validRegions.forEach(region => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'region-btn';
      btn.dataset.region = region;
      btn.textContent = prettyRegion(region);
      if (region === state.region) btn.classList.add('selected');
      els.regions.appendChild(btn);
    });
  }

  els.regions?.addEventListener('click', (e) => {
    const btn = e.target.closest('button.region-btn');
    if (!btn || !els.regions.contains(btn)) return;
    els.regions.querySelectorAll('button.region-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    state.region = btn.dataset.region;
    updateImage();
  });

  // -------------------------------------------------------------------
  // 8) TYPE DROPDOWN
  // -------------------------------------------------------------------
  if (els.dropdown && els.dropdownSelected && els.dropdownOptions) {
    els.dropdownSelected.addEventListener('click', (e) => {
      e.stopPropagation();
      els.dropdown.classList.toggle('active');
    });

    els.dropdownOptions.addEventListener('click', (e) => {
      const opt = e.target.closest('[data-value]');
      if (!opt) return;
      const rawVal = opt.getAttribute('data-value'); // may be 'neurodermatitis'
      const norm   = normalizeType(rawVal);          // -> 'neuro'

      // UI label + state
      els.dropdownSelected.textContent = TYPE_LABELS[norm] || titleCase(norm);
      els.dropdownSelected.setAttribute('data-value', rawVal);

      state.type = norm;

      // Rebuild regions & keep selection only if still valid
      buildRegionsForType(norm);
      if (!els.regions.querySelector(`.region-btn[data-region="${state.region}"]`)) {
        state.region = ''; // force user to pick a valid region for this type
      }

      updateConditionText(norm);
      updateImage();

      els.dropdown.classList.remove('active');
    });

    document.addEventListener('click', () => {
      els.dropdown.classList.remove('active');
    }, { capture: true });
  }

  // -------------------------------------------------------------------
  // 9) TONES (treat fancy checkboxes as radios; no DOM reads for state)
  // -------------------------------------------------------------------
  function setActiveTone(tone) {
    // Update state first
    state.tone = tone;

    // Reflect in UI (checked + aria)
    els.tones.querySelectorAll('.swatch').forEach(sw => {
      const isMatch = sw.dataset.tone === tone;
      sw.classList.toggle('selected', isMatch);
      sw.setAttribute('aria-checked', String(isMatch));
      const input = sw.querySelector('input[type="checkbox"]');
      if (input) input.checked = isMatch; // visually sync the gooey check
    });
  }

  els.tones?.addEventListener('click', (e) => {
    const swatch = e.target.closest('.swatch');
    if (!swatch) return;
    const tone = swatch.dataset.tone;
    if (!tone || tone === state.tone) return;
    setActiveTone(tone);
    updateImage();
  });

  // -------------------------------------------------------------------
  // 10) SEVERITIES (simple pill buttons)
  // -------------------------------------------------------------------
  function setActiveSeverity(sev) {
    state.severity = sev;
    els.severities.querySelectorAll('.severity-btn')
      .forEach(b => b.classList.toggle('selected', b.dataset.severity === sev));
  }

  els.severities?.addEventListener('click', (e) => {
    const btn = e.target.closest('.severity-btn');
    if (!btn) return;
    const sev = btn.dataset.severity;
    if (!sev || sev === state.severity) return;
    setActiveSeverity(sev);
    updateImage();
  });

  // -------------------------------------------------------------------
  // 11) META BADGE (always render from state)
  // -------------------------------------------------------------------
  function renderMeta() {
    if (!els.meta) return;
    const rows = [
      `<div class="meta-row"> ${TYPE_LABELS[state.type] || titleCase(state.type)}</div>`,
      `<div class="meta-row"><strong>•</strong> ${prettyRegion(state.region || '—')}</div>`,
      `<div class="meta-row"><strong>•</strong> ${titleCase(state.tone)}</div>`,
      `<div class="meta-row"><strong>•</strong> ${titleCase(state.severity)}</div>`
    ];
    els.meta.innerHTML = rows.join('');
  }

  // -------------------------------------------------------------------
  // 12) IMAGE RENDER (atomic; no DOM reads)
  // -------------------------------------------------------------------
  function updateImage() {
    const { type, region, tone, severity } = state;
    // If required fields missing (e.g., user changed type -> region reset), show placeholder
    if (!type || !region || !tone || !severity) {
      if (els.img) els.img.src = '../images/eczema-images/placeholder.png';
      renderMeta();
      return;
    }

    const src = resolveImagePath(type, region, tone, severity);
    if (els.img) els.img.src = src;
    try {
      localStorage.setItem('lastViewedImage', `${type}/${type}-${region}-${tone}-${severity}.jpg`);
    } catch {}
    renderMeta();
  }

  // -------------------------------------------------------------------
  // 13) COMPARE (carry selection → querystring)
  // -------------------------------------------------------------------
  if (els.compareBtn) {
    const basePath = './compare.html';
    function buildURLFromState() {
      const q = new URLSearchParams({
        type: state.type || 'atopic',
        region: state.region || 'face-neck',
        tone: state.tone || 'dark',
        severity: state.severity || 'normal'
      }).toString();
      return `${basePath}?${q}`;
    }
    els.compareBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.viewerSelection = { ...state };
      window.location.href = buildURLFromState();
    });
  }

  // -------------------------------------------------------------------
  // 14) INITIALIZE UI FROM DEFAULT STATE
  // -------------------------------------------------------------------
  // Type dropdown label
  if (els.dropdownSelected) {
    els.dropdownSelected.textContent = TYPE_LABELS[state.type] || titleCase(state.type);
    els.dropdownSelected.setAttribute('data-value', state.type === 'neuro' ? 'neurodermatitis' : state.type);
  }

  // Regions
  buildRegionsForType(state.type);
  els.regions?.querySelector(`.region-btn[data-region="${state.region}"]`)?.classList.add('selected');

  // Tone & Severity pills
  setActiveTone(state.tone);
  setActiveSeverity(state.severity);

  // Condition text + first paint
  updateConditionText(state.type);
  updateImage();
});

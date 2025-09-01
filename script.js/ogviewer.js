// viewer.js — TONO Eczema Visualizer (clean stateful version)
console.log("viewer.js is running");

window.onload = function () {
  // -------------------------------------------------------------------
  // 1) GLOBAL STATE (single source of truth)
  //    Change these if you want to start blank: set '' for each field.
  // -------------------------------------------------------------------

  window.state = {
    type: 'atopic',
    region: 'face-neck',
    tone: 'light',
    severity: 'mild'
  };
  function normalizeType(val) {
    const map = {
      neurodermatitis: 'neuro',    // <-- key fix
      dyshidrotic: 'dyshidrotic',
      nummular: 'nummular',
      seborrheic: 'seborrheic',
      atopic: 'atopic',
      contact: 'contact',
      stasis: 'stasis'
    };
    return map[val] || val;
  }
  

  // -------------------------------------------------------------------
  // 2) DOM refs
  // -------------------------------------------------------------------
  const menuIcon        = document.getElementById('menuIcon');
  const fullScreenMenu  = document.getElementById('fullScreenMenu');

  const eczemaDropdown  = document.getElementById('eczemaDropdown');
  const dropdownSelected = eczemaDropdown?.querySelector('.dropdown-selected');
  const dropdownOptions  = eczemaDropdown?.querySelectorAll('.dropdown-options div');

  const skinToneOptions = document.querySelectorAll('#skinTones .swatch');
  const severityOptions = document.querySelectorAll('#severities .severity-btn');
  const regionsContainer = document.getElementById('regions');

  const visualizerImage = document.getElementById('visualizerImage');
  const compareBtn      = document.getElementById('compareBtn');

  // -------------------------------------------------------------------
  // 3) Mobile menu
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
  // 4) Condition content (About / Differential) binding
  // -------------------------------------------------------------------
  function updateConditionText(type) {
    const aboutTab = document.getElementById("about");
    const diffTab  = document.getElementById("differential");
    if (!aboutTab || !diffTab) return;

    if (window.eczemaContent && eczemaContent[type]) {
      aboutTab.innerHTML = `
        <h3>Condition</h3>
        <p>${eczemaContent[type].about}</p>
      `;
      diffTab.innerHTML = `
        <h3>Differential Diagnosis</h3>
        <ul>${eczemaContent[type].differential.map(item => `<li>${item}</li>`).join("")}</ul>
      `;
    } else {
      aboutTab.innerHTML = "<p>No information available for this condition.</p>";
      diffTab.innerHTML = "";
    }
  }

  // -------------------------------------------------------------------
  // 5) Regions: rebuild buttons based on selected type
  // -------------------------------------------------------------------
  function titleizeRegion(slug) {
    return slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  function updateRegionsForType(type) {
    if (!regionsContainer) return;

    // Build unique regions for this type from eczemaImages (from data.js)
    const validRegions = window.eczemaImages
      ? [...new Set(eczemaImages.filter(img => img.type === type).map(img => img.region))]
      : ['face-neck']; // fallback if data.js not loaded

    regionsContainer.innerHTML = '';

    validRegions.forEach(region => {
      const btn = document.createElement("button");
      btn.className = "region-btn";
      btn.setAttribute("data-region", region);
      btn.textContent = titleizeRegion(region);
      if (region === window.state.region) btn.classList.add('selected');
      regionsContainer.appendChild(btn);
    });
  }

  // Event delegation for dynamic region buttons
  if (regionsContainer) {
    regionsContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.region-btn');
      if (!btn) return;

      regionsContainer.querySelectorAll('.region-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      window.state.region = btn.getAttribute('data-region') || '';
      updateImage();
    });
  }

  // -------------------------------------------------------------------
  // 6) Custom dropdown (eczema type)
  // -------------------------------------------------------------------
  if (eczemaDropdown && dropdownSelected && dropdownOptions) {
    dropdownSelected.addEventListener('click', () => {
      eczemaDropdown.classList.toggle('active');
    });

    dropdownOptions.forEach(option => {
      option.addEventListener('click', () => {
        const val   = option.getAttribute('data-value'); // 'atopic', etc.
        const label = option.textContent;                // 'Atopic Dermatitis'

        dropdownSelected.textContent = label;
        dropdownSelected.setAttribute('data-value', val);
        eczemaDropdown.classList.remove('active');

        window.state.type = val;
        // When type changes, clear region (until user picks a valid one for this type)
        // or keep current if still valid. Here we'll rebuild and keep if possible.
        updateRegionsForType(val);
        const stillValid = !!regionsContainer.querySelector(`.region-btn[data-region="${window.state.region}"]`);
        if (!stillValid) window.state.region = '';

        updateConditionText(val);
        updateImage();
      });
    });

    // close dropdown if clicking outside
    document.addEventListener('click', (evt) => {
      if (!eczemaDropdown.contains(evt.target)) {
        eczemaDropdown.classList.remove('active');
      }
    });
  }

  // -------------------------------------------------------------------
  // 7) Tone / Severity controls
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
  // 8) Update visualizer image from state
  // -------------------------------------------------------------------
  function updateImage() {
    const { type, region, tone, severity } = window.state;

    if (type && region && tone && severity) {
      const filename = `../images/eczema/${type}/${type}-${region}-${tone}-${severity}.jpg`;
      console.log("Trying to load:", filename);
      if (visualizerImage) visualizerImage.src = filename;

      // store for later if useful
      localStorage.setItem('lastViewedImage', `${type}/${type}-${region}-${tone}-${severity}.jpg`);
    } else {
      if (visualizerImage) visualizerImage.src = '../images/eczema/placeholder.png';
    }
  }

  // -------------------------------------------------------------------
  // 9) Tabs
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
  // 10) Compare button (viewer → compare.html)
  //     Uses both window.viewerSelection (fast) + URL params (refresh/share)
  // -------------------------------------------------------------------
  if (compareBtn) {
    const basePath = './compare.html'; // adjust if compare.html is elsewhere

    function buildURLFromState() {
      const { type, region, tone, severity } = window.state || {};
      const sel = {
        type: type || 'atopic',
        region: region || 'face-neck',
        tone: tone || 'light',
        severity: severity || 'mild'
      };
      const q = new URLSearchParams(sel).toString();
      return `${basePath}?${q}`;
    }

    compareBtn.addEventListener('click', (e) => {
      e.preventDefault();
      // Make state available to the next page immediately
      window.viewerSelection = { ...window.state };
      // Navigate with URL params so refresh/share keeps context
      window.location.href = buildURLFromState();
    });
  }

  // -------------------------------------------------------------------
  // 11) Initial UI sync with defaults
  // -------------------------------------------------------------------
  // Set dropdown label to match default type
  if (dropdownSelected) {
    const typeLabelMap = {
      atopic: 'Atopic Dermatitis',
      contact: 'Contact Dermatitis',
      dyshidrotic: 'Dyshidrotic Eczema',
      neurodermatitis: 'Neurodermatitis',
      nummular: 'Nummular Eczema',
      seborrheic: 'Seborrheic Dermatitis',
      stasis: 'Stasis Dermatitis'
    };
    const label = typeLabelMap[window.state.type] || 'Select Type of Eczema';
    dropdownSelected.textContent = label;
    dropdownSelected.setAttribute('data-value', window.state.type);
  }

  // Build region buttons for the default type and mark selected region if it exists
  updateRegionsForType(window.state.type);
  const preselectRegionBtn = regionsContainer?.querySelector(`.region-btn[data-region="${window.state.region}"]`);
  if (preselectRegionBtn) preselectRegionBtn.classList.add('selected');

  // Mark default tone/severity
  document.querySelector(`.#skinTones .swatch[data-tone="${window.state.tone}"]`)?.classList.add('selected');
  document.querySelector(`#severities .severity-btn[data-severity="${window.state.severity}"]`)?.classList.add('selected');

  // Render initial image/content
  updateConditionText(window.state.type);
  updateImage();
};

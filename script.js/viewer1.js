//Viewer
console.log("viewer.js is running");

window.onload = function() {
    // --- Mobile Menu (Hamburger) ---
    const menuIcon = document.getElementById('menuIcon');
    const fullScreenMenu = document.getElementById('fullScreenMenu');
  
    menuIcon.onclick = () => {
      menuIcon.classList.toggle('open');
      const menuIsOpening = !fullScreenMenu.classList.contains('show');
  
      if (menuIsOpening) {
        fullScreenMenu.style.display = 'flex';
        setTimeout(() => {
          fullScreenMenu.classList.add('show');
          document.body.classList.add('no-scroll');
        }, 10);
      } else {
        fullScreenMenu.classList.remove('show');
        document.body.classList.remove('no-scroll');
        setTimeout(() => {
          fullScreenMenu.style.display = 'none';
        }, 400);
      }
    };
  
    // --- Custom Dropdown for Eczema Type ---
    const eczemaDropdown = document.getElementById('eczemaDropdown');
    const dropdownSelected = eczemaDropdown.querySelector('.dropdown-selected');
    const dropdownOptions = eczemaDropdown.querySelectorAll('.dropdown-options div');
  
    dropdownSelected.addEventListener('click', () => {
      eczemaDropdown.classList.toggle('active');
    });
  
    dropdownOptions.forEach(option => {
        option.addEventListener('click', () => {
          selectedType = option.getAttribute('data-value');
          dropdownSelected.textContent = option.textContent;
          eczemaDropdown.classList.remove('active');
      
          updateRegionsForType(selectedType); // 🆕 this replaces hardcoded region options
          updateConditionText(selectedType); // 🆕 This line updates the tab content
          updateImage(); // still updates the image
        });
      });
      
  
    document.addEventListener('click', function(event) {
      if (!eczemaDropdown.contains(event.target)) {
        eczemaDropdown.classList.remove('active');
      }
    });
    function updateRegionsForType(type) {
        const regionContainer = document.getElementById("regions");
        regionContainer.innerHTML = "";
      
        const validRegions = [...new Set(
          eczemaImages
            .filter(img => img.type === type)
            .map(img => img.region)
        )];
      
        validRegions.forEach(region => {
          const btn = document.createElement("button");
          btn.className = "region-btn";
          btn.setAttribute("data-region", region);
          btn.textContent = region.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase());
      
          btn.addEventListener("click", () => {
            document.querySelectorAll(".region-btn").forEach(b => b.classList.remove("selected"));
            btn.classList.add("selected");
            selectedRegion = region;
            updateImage();
          });
      
          regionContainer.appendChild(btn);
        });
      
        selectedRegion = "";
      }
      function updateConditionText(type) {
        const aboutTab = document.getElementById("about");
        const diffTab = document.getElementById("differential");
      
        if (eczemaContent[type]) {
          aboutTab.innerHTML = `
            <h3>Condition</h3>
            <p>${eczemaContent[type].about}</p>
          `;
      
          diffTab.innerHTML = `
            <h3>Differential Diagnosis</h3>
            <ul>
              ${eczemaContent[type].differential.map(item => `<li>${item}</li>`).join("")}
            </ul>
          `;
        } else {
          aboutTab.innerHTML = "<p>No information available for this condition.</p>";
          diffTab.innerHTML = "";
        }
      }
      
  
    // --- Skin Tone, Severity, Region Selection ---
    const skinToneOptions = document.querySelectorAll('.swatch');
    const severityOptions = document.querySelectorAll('.severity-btn');
    const regionOptions = document.querySelectorAll('.region-btn');
    const visualizerImage = document.getElementById('visualizerImage');
  
    let selectedType = '';
    let selectedTone = '';
    let selectedSeverity = '';
    let selectedRegion = '';
  
    skinToneOptions.forEach(option => {
      option.addEventListener('click', () => {
        skinToneOptions.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        selectedTone = option.getAttribute('data-tone');
        updateImage();
      });
    });
  
    severityOptions.forEach(option => {
      option.addEventListener('click', () => {
        severityOptions.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        selectedSeverity = option.getAttribute('data-severity');
        updateImage();
      });
    });
  
    regionOptions.forEach(option => {
      option.addEventListener('click', () => {
        regionOptions.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        selectedRegion = option.getAttribute('data-region');
        updateImage();
      });
    });
  
    // --- Update the Visualizer Image ---
    function updateImage() {
      if (selectedType && selectedTone && selectedSeverity && selectedRegion) {
        const filename = `../images/eczema/${selectedType}/${selectedType}-${selectedRegion}-${selectedTone}-${selectedSeverity}.jpg`;
        console.log("Trying to load:", filename); // ← ADD THIS
        visualizerImage.src = filename;
      } else {
        visualizerImage.src = '../images/eczema/placeholder.png';
      }
    }
    };
        localStorage.setItem(
          'lastViewedImage',
          visualizerImage.src.replace('../images/eczema/', '')
        );
    
    
  
        // --- Tabs functionality ---
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const target = button.getAttribute('data-tab');

        console.log("Tab clicked:", target);

        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabPanels.forEach(panel => panel.classList.remove('active'));

        button.classList.add('active');
        document.getElementById(target).classList.add('active');
    });
    });
    //--This is for compare button, so you keep thecurrent image u are viewing--//

  function saveCurrentImage() {
    const currentImage = document.getElementById("visualizerImage").src;
    localStorage.setItem("imageToCompare", currentImage);
  }

//CAN BE REMOVEDAdded thing from comparison, used in viewer copy html//
    function getImagePath(type, region, tone, severity) {
      const match = imageData.find(item =>
        item.type === type &&
        item.region === region &&
        item.tone === tone &&
        item.severity === severity
      );
      return match ? match.src : "../images/eczema-images/placeholder.png";
    }
    function enableComparison() {
      document.getElementById("viewerMode").style.display = "none";
      document.getElementById("comparisonContainer").style.display = "block";

      // Grab selected values from current viewer
      const selectedType = document.querySelector('#eczemaDropdown .dropdown-selected').dataset.value;
      const selectedRegion = document.querySelector('#regions .region-btn.selected')?.dataset.region;
      const selectedTone = document.querySelector('#skinTones .swatch.selected')?.dataset.tone;
      const selectedSeverity = document.querySelector('#severities .severity-btn.selected')?.dataset.severity;

      // Image A = current viewer image
      const imageAPath = getImagePath(selectedType, selectedRegion, selectedTone, selectedSeverity);
      document.getElementById("imageA").src = imageAPath;

      // Image B = same tone/region/type, but DIFFERENT severity
      const fallbackSeverity = selectedSeverity === "mild" ? "severe" : "mild"; // just an example switch
      const imageBPath = getImagePath(selectedType, selectedRegion, selectedTone, fallbackSeverity);
      document.getElementById("imageB").src = imageBPath;

      // Enable dragging
      const slider = document.getElementById('slider');
      const imageB = document.getElementById('imageB');
      const wrapper = slider.parentElement;

      const onMouseMove = (e) => {
        const rect = wrapper.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const percent = (offsetX / rect.width) * 100;
        imageB.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
        slider.style.left = `${percent}%`;
      };

      const stopDrag = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', stopDrag);
      };

      slider.addEventListener('mousedown', () => {
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', stopDrag);
      });
    }

    function disableComparison() {
      document.getElementById("viewerMode").style.display = "block";
      document.getElementById("comparisonContainer").style.display = "none";
    }
    document.getElementById('toneBSelect').addEventListener('change', updateImageB);
    document.getElementById('severityBSelect').addEventListener('change', updateImageB);

    function updateImageB() {
      const selectedType = document.querySelector('#eczemaDropdown .dropdown-selected').dataset.value;
      const selectedRegion = document.querySelector('#regions .region-btn.selected')?.dataset.region;

      const toneB = document.getElementById('toneBSelect').value;
      const severityB = document.getElementById('severityBSelect').value;

      const newImageBPath = getImagePath(selectedType, selectedRegion, toneB, severityB);
      document.getElementById('imageB').src = newImageBPath;
    }
// Image B tone selection
    document.querySelectorAll('#skinTonesB .swatch').forEach(swatch => {
      swatch.addEventListener('click', () => {
        document.querySelectorAll('#skinTonesB .swatch').forEach(s => s.classList.remove('selected'));
        swatch.classList.add('selected');
        updateImageB();
      });
    });

    // Image B severity selection
    document.querySelectorAll('#severitiesB .severity-btn').forEach(button => {
      button.addEventListener('click', () => {
        document.querySelectorAll('#severitiesB .severity-btn').forEach(b => b.classList.remove('selected'));
        button.classList.add('selected');
        updateImageB();
      });
    });

    function updateImageB() {
      const selectedType = document.querySelector('#eczemaDropdown .dropdown-selected').dataset.value;
      const selectedRegion = document.querySelector('#regions .region-btn.selected')?.dataset.region;

      const toneB = document.querySelector('#skinTonesB .swatch.selected')?.dataset?.tone;
      const severityB = document.querySelector('#severitiesB .severity-btn.selected')?.dataset?.severity;

      const newImageBPath = getImagePath(selectedType, selectedRegion, toneB, severityB);
      document.getElementById('imageB').src = newImageBPath;
    }

 
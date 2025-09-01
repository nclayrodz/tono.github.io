
window.onload = function () {
  const imageA = document.getElementById("imageA");
  const imageB = document.getElementById("imageB");
  const sliderHandle = document.getElementById("sliderHandle");
  const comparisonContainer = document.getElementById("comparisonContainer");
  const toneSelector = document.getElementById("toneSelector");
  const severitySelector = document.getElementById("severitySelector");

  const savedImage = localStorage.getItem("imageToCompare");

  let dragging = false;

  if (savedImage) {
    imageA.src = savedImage;

    const filename = savedImage.split("/").pop().replace(".jpg", "").replace(".png", "");
    const [condition, region, originalTone, originalSeverity] = filename.split("-");

    toneSelector.value = originalTone;
    severitySelector.value = originalSeverity;

    function updateImageB() {
      const tone = toneSelector.value;
      const severity = severitySelector.value;
      const path = `../images/eczema/${condition}/${condition}-${region}-${tone}-${severity}.jpg`;
      imageB.src = path;
    }

    updateImageB();

    toneSelector.addEventListener("change", updateImageB);
    severitySelector.addEventListener("change", updateImageB);

    // Handle slider drag
    sliderHandle.addEventListener("mousedown", () => dragging = true);
    window.addEventListener("mouseup", () => dragging = false);

    window.addEventListener("mousemove", (e) => {
      if (!dragging) return;
      const rect = comparisonContainer.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));

      imageB.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
      sliderHandle.style.left = `${percent}%`;
    });

    // Optional: touch support for mobile
    sliderHandle.addEventListener("touchstart", () => dragging = true);
    window.addEventListener("touchend", () => dragging = false);
    window.addEventListener("touchmove", (e) => {
      if (!dragging) return;
      const touch = e.touches[0];
      const rect = comparisonContainer.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));

      imageB.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
      sliderHandle.style.left = `${percent}%`;
    });
  }
};
      const toneSwatches = document.querySelectorAll(".compare-tone-swatch");
      const severityButtons = document.querySelectorAll(".compare-severity-btn");

      let selectedTone = originalTone;
      let selectedSeverity = originalSeverity;

      function updateImageB() {
        const path = `../images/eczema/${condition}/${condition}-${region}-${selectedTone}-${selectedSeverity}.jpg`;
        imageB.src = path;
      }

      toneSwatches.forEach(swatch => {
        swatch.addEventListener("click", () => {
          toneSwatches.forEach(s => s.classList.remove("selected"));
          swatch.classList.add("selected");
          selectedTone = swatch.getAttribute("data-tone");
          updateImageB();
        });

        if (swatch.getAttribute("data-tone") === selectedTone) {
          swatch.classList.add("selected");
        }
      });

      severityButtons.forEach(button => {
        button.addEventListener("click", () => {
          severityButtons.forEach(b => b.classList.remove("selected"));
          button.classList.add("selected");
          selectedSeverity = button.getAttribute("data-severity");
          updateImageB();
        });

        if (button.getAttribute("data-severity") === selectedSeverity) {
          button.classList.add("selected");
        }
      });


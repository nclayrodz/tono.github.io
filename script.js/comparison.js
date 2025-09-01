
window.onload = function () {
  const imageA = document.getElementById("imageA");
  const imageB = document.getElementById("imageB");
  const slider = document.getElementById("compareSlider");
  const toneSelector = document.getElementById("toneSelector");
  const severitySelector = document.getElementById("severitySelector");

  const savedImage = localStorage.getItem("imageToCompare");

  if (savedImage) {
    imageA.src = savedImage;

    // Extract condition and region from filename
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

    slider.addEventListener("input", () => {
      const percent = slider.value;
      imageB.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
    });
  } else {
    imageA.alt = "No image selected.";
    imageB.alt = "No comparison image.";
  }
};

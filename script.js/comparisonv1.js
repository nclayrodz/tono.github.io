console.log("comparison.js loaded");

let editingSide = 'right'; // Default to right side

document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM fully loaded");

  // Load last viewed image
  const lastImage = localStorage.getItem('lastViewedImage');
  const imageA = document.getElementById('imgLeft');
  if (lastImage && imageA) {
    imageA.src = `images/eczema-images/${lastImage}`;
  }

  // Bind edit button for right side
  const editButton = document.getElementById('editB');
  if (editButton) {
    console.log("Edit button found");
    editButton.addEventListener('click', () => {
      console.log("Edit button clicked");
      openEditor('right');
    });
  }
});

function applySelection() {
  console.log("Apply button clicked");

  const tone = document.getElementById('toneSelect').value;
  const severity = document.getElementById('severitySelect').value;
  const region = document.getElementById('regionSelect').value;

  const match = eczemaImages.find(img =>
    img.tone === tone &&
    img.severity === severity &&
    img.region === region
  );

  console.log("Matching image:", match);

  if (match) {
    const imgId = editingSide === 'left' ? 'imageA' : 'imageB';
    document.getElementById(imgId).src = match.src;
  } else {
    alert('No matching image found.');
  }
}

  if (match) {
    const imgId = editingSide === 'right' ? 'imgLeft' : 'imgRight';
    document.getElementById(imgId).src = match.src;
  } else {
    alert('No matching image found.');
  }

// Slider logic (basic horizontal drag handle)
const sliderHandle = document.getElementById('sliderHandle');
const compSlider = document.querySelector('.comparison-slider');
let isDragging = false;

sliderHandle.addEventListener('mousedown', () => isDragging = true);
document.addEventListener('mouseup', () => isDragging = false);
document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  const rect = compSlider.getBoundingClientRect();
  let offsetX = e.clientX - rect.left;
  offsetX = Math.max(0, Math.min(offsetX, rect.width));
  sliderHandle.style.left = `${offsetX}px`;
  compSlider.style.setProperty('--slider-position', `${offsetX}px`);
});

function toggleComparison(show = true) {
  const viewer = document.getElementById('mainViewer');
  const comparison = document.getElementById('comparisonMode');
  viewer.style.display = show ? 'none' : 'block';
  comparison.style.display = show ? 'block' : 'none';
}

window.onload = function () {
  const sliderHandle = document.getElementById("sliderHandle");
  const imageB = document.getElementById("imageB");
  const comparisonContainer = document.getElementById("comparisonContainer");

  let dragging = false;

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
};

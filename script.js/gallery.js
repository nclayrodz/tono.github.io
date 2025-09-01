      // --- Toggle Filter Dropdowns ---
      const filterHeaders = document.querySelectorAll('.filter-header');

      filterHeaders.forEach(header => {
      header.addEventListener('click', () => {
          const section = header.parentElement;
          section.classList.toggle('active');
      });
      });
      // --- Reset Filters ---
      const resetBtn = document.querySelector('.reset-btn');
  
      resetBtn.addEventListener('click', () => {
      const checkboxes = document.querySelectorAll('.filter-content input[type="checkbox"]');
      checkboxes.forEach(checkbox => {
          checkbox.checked = false;
      });
        // --- Update Result Count ---
      const resultCount = document.getElementById('resultCount');
      resultCount.textContent = `Showing ${items.length} results`;
    });
      
  
      // --- Filter Gallery ---
      const filterBtn = document.querySelector('.filter-btn');
  
      filterBtn.addEventListener('click', () => {
        const checkedTones = Array.from(document.querySelectorAll('[data-filter="tone"] input[type="checkbox"]:checked')).map(cb => cb.value);
        const checkedSeverities = Array.from(document.querySelectorAll('[data-filter="severity"] input[type="checkbox"]:checked')).map(cb => cb.value);
        const checkedRegions = Array.from(document.querySelectorAll('[data-filter="region"] input[type="checkbox"]:checked')).map(cb => cb.value);
        
  
      const items = document.querySelectorAll('.gallery-item');
  
      items.forEach(item => {
          const tone = item.getAttribute('data-tone');
          const severity = item.getAttribute('data-severity');
          const region = item.getAttribute('data-region');
  
          const matchesTone = checkedTones.length === 0 || checkedTones.includes(tone);
          const matchesSeverity = checkedSeverities.length === 0 || checkedSeverities.includes(severity);
          const matchesRegion = checkedRegions.length === 0 || checkedRegions.includes(region);
  
          if (matchesTone && matchesSeverity && matchesRegion) {
          item.style.display = 'block';
          } else {
          item.style.display = 'none';
          }
      });
        // --- Update Result Count ---
      const visibleItems = document.querySelectorAll('.gallery-item[style*="display: block"]');
      const resultCount = document.getElementById('resultCount');
      resultCount.textContent = `Showing ${visibleItems.length} result${visibleItems.length !== 1 ? 's' : ''}`;
    });
  
    // --- dynamically display the images for gallery pages  --- 
      const galleryGrid = document.querySelector('.gallery-grid');
  
      eczemaImages.forEach(image => {
        const div = document.createElement('div');
        div.className = 'gallery-item fade-in';
        div.setAttribute('data-tone', image.tone);
        div.setAttribute('data-severity', image.severity);
        div.setAttribute('data-region', image.region);
        div.innerHTML = `<img src="${image.src}" alt="${image.type}" />`;
        galleryGrid.appendChild(div);
      });
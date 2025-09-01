// === MENU FUNCTIONALITY ===
const menuIcon = document.getElementById('menuIcon');
const fullScreenMenu = document.getElementById('fullScreenMenu');

if (menuIcon && fullScreenMenu) {
  menuIcon.onclick = () => {
    menuIcon.classList.toggle('open');

    if (fullScreenMenu.classList.contains('show')) {
      // Fading out
      fullScreenMenu.classList.remove('show');
      document.body.classList.remove('no-scroll');
      setTimeout(() => {
        fullScreenMenu.style.display = 'none';
      }, 400);
    } else {
      // Fading in
      fullScreenMenu.style.display = 'flex';
      setTimeout(() => {
        fullScreenMenu.classList.add('show');
        document.body.classList.add('no-scroll');
      }, 10);
    }
  };
}

// === FADE-IN ON SCROLL ===
document.addEventListener("DOMContentLoaded", () => {
  console.log("✨ Fade-in logic running");
  const faders = document.querySelectorAll('.fade-in');

  const appearOptions = { threshold: 0.1 };

  const appearOnScroll = new IntersectionObserver(function(entries, observer) {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('show');
      observer.unobserve(entry.target);
    });
  }, appearOptions);

  faders.forEach(fader => {
    appearOnScroll.observe(fader);
  });
});

// === CAROUSEL (optional, if used on this page) ===
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');

if (slides.length > 0 && dots.length > 0) {
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const slideIndex = dot.getAttribute('data-slide');
      showSlide(slideIndex);
    });
  });

  function showSlide(index) {
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    slides[index].classList.add('active');
    dots[index].classList.add('active');
  }
}

  
   


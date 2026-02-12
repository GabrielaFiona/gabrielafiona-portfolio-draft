// Smooth scroll for any [data-scroll-to] element
(function () {
  var scroller = document.querySelector(".page-wrapper") || window;

  document.querySelectorAll("[data-scroll-to]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var targetSelector = btn.getAttribute("data-scroll-to");
      var target = document.querySelector(targetSelector);
      if (!target) return;

      var rect = target.getBoundingClientRect();
      var currentScroll =
        scroller === window ? window.scrollY || window.pageYOffset : scroller.scrollTop;
      var offset = currentScroll + rect.top - 40;

      if (typeof scroller.scrollTo === "function") {
        scroller.scrollTo({
          top: offset,
          behavior: "smooth"
        });
      } else {
        scroller.scrollTop = offset;
      }
    });
  });
})();

// UPDATED: Scroll-Snap Carousel Logic
(function () {
  var track = document.querySelector(".carousel-track");
  var slides = Array.from(document.querySelectorAll(".carousel-item"));
  var prevBtn = document.querySelector("[data-carousel-prev]");
  var nextBtn = document.querySelector("[data-carousel-next]");
  var dotsContainer = document.querySelector("[data-carousel-dots]");
  
  if (!track || slides.length === 0 || !dotsContainer) return;

  var autoInterval = null;
  var AUTO_DELAY = 6000;

  // Create dots
  slides.forEach(function (_, index) {
    var dot = document.createElement("button");
    dot.className = "carousel-dot" + (index === 0 ? " is-active" : "");
    dot.setAttribute("type", "button");
    dot.setAttribute("aria-label", "Go to slide " + (index + 1));
    dot.dataset.index = index;
    dotsContainer.appendChild(dot);
  });

  var dots = Array.from(dotsContainer.querySelectorAll(".carousel-dot"));

  // Helper: Get current slide index based on scroll position
  function getCurrentIndex() {
    var scrollLeft = track.scrollLeft;
    var width = track.offsetWidth;
    return Math.round(scrollLeft / width);
  }

  // Helper: Update active dot
  function updateDots() {
    var idx = getCurrentIndex();
    dots.forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === idx);
    });
  }

  // Scroll to specific index
  function scrollToIndex(index) {
    var width = track.offsetWidth;
    track.scrollTo({
      left: width * index,
      behavior: 'smooth'
    });
  }

  // Button Listeners
  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      var current = getCurrentIndex();
      var next = (current + 1) % slides.length; // Loop to start
      scrollToIndex(next);
      resetAuto();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      var current = getCurrentIndex();
      var prev = (current - 1 + slides.length) % slides.length; // Loop to end
      scrollToIndex(prev);
      resetAuto();
    });
  }

  // Dot Listeners
  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      var idx = parseInt(dot.dataset.index, 10);
      scrollToIndex(idx);
      resetAuto();
    });
  });

  // Listen for scroll events (updates dots on swipe)
  track.addEventListener("scroll", function() {
    // Debounce dot update slightly for performance
    if(track.scrollTimeout) clearTimeout(track.scrollTimeout);
    track.scrollTimeout = setTimeout(updateDots, 100);
  });

  // Auto Scroll Logic
  function startAuto() {
    if (autoInterval) return;
    autoInterval = setInterval(function() {
      var current = getCurrentIndex();
      var next = (current + 1) % slides.length;
      scrollToIndex(next);
    }, AUTO_DELAY);
  }

  function stopAuto() {
    if (!autoInterval) return;
    clearInterval(autoInterval);
    autoInterval = null;
  }

  function resetAuto() {
    stopAuto();
    startAuto();
  }

  // Pause on hover (desktop) or touch (mobile)
  var carouselShell = document.querySelector(".carousel-shell");
  if (carouselShell) {
    carouselShell.addEventListener("mouseenter", stopAuto);
    carouselShell.addEventListener("mouseleave", startAuto);
    carouselShell.addEventListener("touchstart", stopAuto, { passive: true });
    carouselShell.addEventListener("touchend", startAuto);
  }

  // Initialize
  startAuto();
})();

// Logo scroller logic (same as before, preserved)
var logoScroller = document.querySelector("[data-logo-scroller]");
if (logoScroller) {
  var logoTrack = logoScroller.querySelector(".logo-track");
  if (logoTrack) {
    function pauseLogoAnimation() { logoTrack.style.animationPlayState = "paused"; }
    function resumeLogoAnimation() { logoTrack.style.animationPlayState = "running"; }

    logoScroller.addEventListener("mouseenter", pauseLogoAnimation);
    logoScroller.addEventListener("mouseleave", resumeLogoAnimation);

    var touchActive = false;
    var resumeTimeout = null;

    function queueResume() {
      if (resumeTimeout) clearTimeout(resumeTimeout);
      resumeTimeout = setTimeout(function () {
        if (!touchActive) resumeLogoAnimation();
      }, 1500);
    }

    logoScroller.addEventListener("touchstart", function () {
      touchActive = true;
      pauseLogoAnimation();
      if (resumeTimeout) {
        clearTimeout(resumeTimeout);
        resumeTimeout = null;
      }
    }, { passive: true });

    logoScroller.addEventListener("touchend", function () {
      touchActive = false;
      queueResume();
    });
  }
}

// Year in footer
var yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

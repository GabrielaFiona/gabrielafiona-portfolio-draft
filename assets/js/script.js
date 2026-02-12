// Smooth scroll for any [data-scroll-to] element
// Updated so it scrolls inside .page-wrapper (our main scroll container)
// instead of the browser window. This plays nicer inside Google Sites embeds.
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

// Carousel logic
(function () {
  var track = document.querySelector(".carousel-track");
  var slides = Array.from(document.querySelectorAll(".carousel-item"));
  var prevBtn = document.querySelector("[data-carousel-prev]");
  var nextBtn = document.querySelector("[data-carousel-next]");
  var dotsContainer = document.querySelector("[data-carousel-dots]");
  if (!track || slides.length === 0 || !dotsContainer) return;

  var currentIndex = 0;
  var slideCount = slides.length;
  var autoInterval = null;
  var AUTO_DELAY = 8000;

  // Create dots
  slides.forEach(function (_, index) {
    var dot = document.createElement("button");
    dot.className = "carousel-dot" + (index === 0 ? " is-active" : "");
    dot.setAttribute("type", "button");
    dot.dataset.index = index;
    dotsContainer.appendChild(dot);
  });

  var dots = Array.from(dotsContainer.querySelectorAll(".carousel-dot"));

  function goToSlide(index) {
    currentIndex = (index + slideCount) % slideCount;
    var offset = -currentIndex * 100;
    track.style.transform = "translateX(" + offset + "%)";
    dots.forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === currentIndex);
    });
  }

  function next() {
    goToSlide(currentIndex + 1);
  }

  function prev() {
    goToSlide(currentIndex - 1);
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      var idx = parseInt(dot.dataset.index, 10);
      goToSlide(idx);
      resetAuto();
    });
  });

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      next();
      resetAuto();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      prev();
      resetAuto();
    });
  }

  function startAuto() {
    if (autoInterval) return;
    autoInterval = setInterval(next, AUTO_DELAY);
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

  // Pause autoplay on hover
  var carouselShell = document.querySelector(".carousel-shell");
  if (carouselShell) {
    carouselShell.addEventListener("mouseenter", stopAuto);
    carouselShell.addEventListener("mouseleave", startAuto);
  }

  // Initialize
  goToSlide(0);
  startAuto();
})();

// Logo scroller: pause on hover, make it touch-interactive on mobile
var logoScroller = document.querySelector("[data-logo-scroller]");
if (logoScroller) {
  var logoTrack = logoScroller.querySelector(".logo-track");

  if (logoTrack) {
    function pauseLogoAnimation() {
      logoTrack.style.animationPlayState = "paused";
    }

    function resumeLogoAnimation() {
      logoTrack.style.animationPlayState = "running";
    }

    // Desktop hover
    logoScroller.addEventListener("mouseenter", pauseLogoAnimation);
    logoScroller.addEventListener("mouseleave", resumeLogoAnimation);

    // Touch interaction (mobile / touchscreens)
    var touchActive = false;
    var resumeTimeout = null;

    function queueResume() {
      if (resumeTimeout) {
        clearTimeout(resumeTimeout);
      }
      resumeTimeout = setTimeout(function () {
        if (!touchActive) {
          resumeLogoAnimation();
        }
      }, 1500); // resume 1.5s after user stops touching
    }

    logoScroller.addEventListener(
      "touchstart",
      function () {
        touchActive = true;
        pauseLogoAnimation();
        if (resumeTimeout) {
          clearTimeout(resumeTimeout);
          resumeTimeout = null;
        }
      },
      { passive: true }
    );

    logoScroller.addEventListener("touchend", function () {
      touchActive = false;
      queueResume();
    });

    logoScroller.addEventListener("touchcancel", function () {
      touchActive = false;
      queueResume();
    });
  }
}

// Year in footer
var yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

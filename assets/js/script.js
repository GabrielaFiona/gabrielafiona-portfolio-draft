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

// UPDATED: Interactive Timeline Logic
(function() {
  var slides = document.querySelectorAll(".timeline-slide");
  var dots = document.querySelectorAll(".t-dot");
  var btnFuture = document.getElementById("tl-btn-left"); // Newer items
  var btnPast = document.getElementById("tl-btn-right");  // Older items
  
  if (!slides.length) return;

  var currentIndex = 0; // 0 = Most recent (Present), increases as we go "Back in time"

  function updateTimeline(index) {
    // Hide all
    slides.forEach(function(s) { s.classList.remove("active"); });
    dots.forEach(function(d) { d.classList.remove("active"); });
    
    // Show active
    slides[index].classList.add("active");
    dots[index].classList.add("active");
    
    currentIndex = index;
  }

  // Button Logic
  // "Future" button goes to lower index (Newer items)
  if(btnFuture) {
    btnFuture.addEventListener("click", function() {
      var nextIndex = currentIndex - 1;
      if (nextIndex < 0) nextIndex = slides.length - 1; // Loop to end
      updateTimeline(nextIndex);
    });
  }

  // "Back in time" button goes to higher index (Older items)
  if(btnPast) {
    btnPast.addEventListener("click", function() {
      var nextIndex = currentIndex + 1;
      if (nextIndex >= slides.length) nextIndex = 0; // Loop to start
      updateTimeline(nextIndex);
    });
  }

  // Dot Click Logic
  dots.forEach(function(dot) {
    dot.addEventListener("click", function() {
      var idx = parseInt(dot.getAttribute("data-index"), 10);
      updateTimeline(idx);
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

  function getCurrentIndex() {
    var scrollLeft = track.scrollLeft;
    var width = track.offsetWidth;
    return Math.round(scrollLeft / width);
  }

  function updateDots() {
    var idx = getCurrentIndex();
    dots.forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === idx);
    });
  }

  function scrollToIndex(index) {
    var width = track.offsetWidth;
    track.scrollTo({
      left: width * index,
      behavior: 'smooth'
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      var current = getCurrentIndex();
      var next = (current + 1) % slides.length; 
      scrollToIndex(next);
      resetAuto();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      var current = getCurrentIndex();
      var prev = (current - 1 + slides.length) % slides.length; 
      scrollToIndex(prev);
      resetAuto();
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      var idx = parseInt(dot.dataset.index, 10);
      scrollToIndex(idx);
      resetAuto();
    });
  });

  track.addEventListener("scroll", function() {
    if(track.scrollTimeout) clearTimeout(track.scrollTimeout);
    track.scrollTimeout = setTimeout(updateDots, 100);
  });

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

  var carouselShell = document.querySelector(".carousel-shell");
  if (carouselShell) {
    carouselShell.addEventListener("mouseenter", stopAuto);
    carouselShell.addEventListener("mouseleave", startAuto);
    carouselShell.addEventListener("touchstart", stopAuto, { passive: true });
    carouselShell.addEventListener("touchend", startAuto);
  }

  startAuto();
})();

// Logo scroller logic
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

var yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

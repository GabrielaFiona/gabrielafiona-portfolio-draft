// 1. SMOOTH SCROLLING
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
        scroller.scrollTo({ top: offset, behavior: "smooth" });
      } else {
        scroller.scrollTop = offset;
      }
    });
  });
})();

// 2. TIMELINE: WRAPPED STEPPING LOGIC
(function() {
  var slides = Array.from(document.querySelectorAll(".timeline-slide"));
  var dotsContainer = document.getElementById("timeline-dots-container");
  var btnFuture = document.getElementById("tl-btn-left");
  var btnPast = document.getElementById("tl-btn-right");
  
  if (!slides.length || !dotsContainer) return;

  var currentIndex = 0; // 0 is 2026
  var TOTAL_UI_DOTS = 5;

  function initDots() {
    dotsContainer.innerHTML = "";
    for (var i = 0; i < TOTAL_UI_DOTS; i++) {
      var wrapper = document.createElement("div");
      wrapper.className = "t-dot-wrapper";
      var dot = document.createElement("div");
      dot.className = "t-dot";
      wrapper.appendChild(dot);
      dotsContainer.appendChild(wrapper);
    }
  }

  function updateUI() {
    // 1. Update Slide Visibility
    slides.forEach(function(s, idx) {
      s.classList.toggle("active", idx === currentIndex);
    });

    // 2. Wrapped Stepping Logic
    var dotIndex;
    var N = slides.length;

    if (currentIndex === N - 1) {
      // Final Year (2016) always uses the 5th dot
      dotIndex = 4;
    } else {
      // Step number is 1-based (currentIndex + 1)
      // Cycle through dots 1-4 using: ((stepNumber - 1) % 4)
      dotIndex = (currentIndex % 4);
    }

    var dotWrappers = dotsContainer.querySelectorAll(".t-dot-wrapper");
    dotWrappers.forEach(function(d, idx) {
      d.classList.toggle("active", idx === dotIndex);
    });

    // 3. Update Button Text
    if (btnPast) {
      btnPast.innerHTML = (currentIndex === N - 1) ? "Jump to Now &uarr;" : "&rarr; Back in time";
    }
  }

  function goToSlide(index) {
    if (index < 0) index = 0;
    if (index >= slides.length) index = slides.length - 1;
    currentIndex = index;
    updateUI();
  }

  btnFuture?.addEventListener("click", function() { goToSlide(currentIndex - 1); });
  btnPast?.addEventListener("click", function() {
    if (currentIndex === slides.length - 1) goToSlide(0);
    else goToSlide(currentIndex + 1);
  });

  initDots();
  updateUI();
})();

// 3. DRAGGABLE LOGO SCROLLER
(function() {
  var slider = document.querySelector('.logo-scroller');
  var track = document.querySelector('.logo-track');
  if(!slider || !track) return;

  var isDown = false, startX, scrollLeft, autoScrollSpeed = 0.8, isAutoScrolling = true;

  function autoScroll() {
    if(isAutoScrolling && !isDown) {
      slider.scrollLeft += autoScrollSpeed;
      if(slider.scrollLeft >= (slider.scrollWidth - slider.clientWidth)) slider.scrollLeft = 0;
    }
    requestAnimationFrame(autoScroll);
  }
  requestAnimationFrame(autoScroll);

  slider.addEventListener('mousedown', function(e) {
    isDown = true; isAutoScrolling = false;
    slider.classList.add('active');
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
  });

  slider.addEventListener('mouseleave', function() { isDown = false; isAutoScrolling = true; });
  slider.addEventListener('mouseup', function() { isDown = false; isAutoScrolling = true; });

  slider.addEventListener('mousemove', function(e) {
    if(!isDown) return;
    e.preventDefault();
    var x = e.pageX - slider.offsetLeft;
    slider.scrollLeft = scrollLeft - (x - startX) * 2;
  });

  slider.addEventListener('touchstart', function(e) {
    isDown = true; isAutoScrolling = false;
    startX = e.touches[0].pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
  }, { passive: true });

  slider.addEventListener('touchend', function() { isDown = false; isAutoScrolling = true; });

  slider.addEventListener('touchmove', function(e) {
    if(!isDown) return;
    var x = e.touches[0].pageX - slider.offsetLeft;
    slider.scrollLeft = scrollLeft - (x - startX) * 2;
  }, { passive: true });
})();

// 4. PROJECT CAROUSEL
(function () {
  var track = document.querySelector(".carousel-track");
  var slides = Array.from(document.querySelectorAll(".carousel-item"));
  var dotsContainer = document.querySelector("[data-carousel-dots]");
  if (!track || slides.length === 0 || !dotsContainer) return;

  slides.forEach(function (_, index) {
    var dot = document.createElement("button");
    dot.className = "carousel-dot" + (index === 0 ? " is-active" : "");
    dot.addEventListener("click", function() {
      track.scrollTo({ left: track.offsetWidth * index, behavior: 'smooth' });
    });
    dotsContainer.appendChild(dot);
  });

  track.addEventListener("scroll", function() {
    var idx = Math.round(track.scrollLeft / track.offsetWidth);
    Array.from(dotsContainer.children).forEach(function(d, i) {
      d.classList.toggle("is-active", i === idx);
    });
  });
})();

var yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

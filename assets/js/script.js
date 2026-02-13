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

// ----------------------------------------------------
// UPDATED: Interactive Timeline (2026 - 2016 Logic)
// ----------------------------------------------------
(function() {
  var slides = Array.from(document.querySelectorAll(".timeline-slide"));
  var dotsContainer = document.getElementById("timeline-dots-container");
  var btnFuture = document.getElementById("tl-btn-left");
  var btnPast = document.getElementById("tl-btn-right");
  
  if (!slides.length || !dotsContainer) return;

  // Configuration
  var VISIBLE_DOTS = 5; 
  var currentIndex = 0; // 0 is the newest year (2026)
  var dotWindowStart = 0; // The index of the first visible dot

  // Render Dots based on the current window
  function renderDots() {
    dotsContainer.innerHTML = ""; // Clear existing
    
    // Determine which dots to show
    var end = Math.min(dotWindowStart + VISIBLE_DOTS, slides.length);
    
    for (var i = dotWindowStart; i < end; i++) {
      var slide = slides[i];
      var year = slide.getAttribute("data-year");
      
      var wrapper = document.createElement("div");
      wrapper.className = "t-dot-wrapper" + (i === currentIndex ? " active" : "");
      wrapper.dataset.index = i;
      
      var dot = document.createElement("div");
      dot.className = "t-dot";
      
      var label = document.createElement("span");
      label.className = "t-year-text";
      label.innerText = year;
      
      wrapper.appendChild(dot);
      wrapper.appendChild(label);
      
      // Click event
      wrapper.addEventListener("click", function() {
        var idx = parseInt(this.dataset.index, 10);
        goToSlide(idx);
      });
      
      dotsContainer.appendChild(wrapper);
    }
  }

  function goToSlide(index) {
    // Bounds check
    if (index < 0) index = 0;
    if (index >= slides.length) index = slides.length - 1;
    
    currentIndex = index;

    // Logic: If we hit the 2nd to last dot in current view, shift window forward
    // If we hit 2nd dot from start, shift window backward
    var relativePos = currentIndex - dotWindowStart;
    
    // Shift logic (Moving into the past)
    if (relativePos >= VISIBLE_DOTS - 2) { 
      // Shift so current becomes the 2nd item (context)
      dotWindowStart = Math.min(currentIndex - 1, slides.length - VISIBLE_DOTS);
    }
    
    // Shift logic (Moving into the future)
    if (relativePos <= 1) {
      dotWindowStart = Math.max(currentIndex - 3, 0);
    }
    
    // Safety clamp
    if (dotWindowStart < 0) dotWindowStart = 0;
    if (dotWindowStart > slides.length - VISIBLE_DOTS) dotWindowStart = slides.length - VISIBLE_DOTS;

    // Update UI
    slides.forEach(function(s) { s.classList.remove("active"); });
    slides[currentIndex].classList.add("active");
    
    renderDots();
  }

  // Button Listeners
  if(btnFuture) {
    btnFuture.addEventListener("click", function() {
      goToSlide(currentIndex - 1);
    });
  }

  if(btnPast) {
    btnPast.addEventListener("click", function() {
      goToSlide(currentIndex + 1);
    });
  }

  // Initialize
  renderDots();
})();


// ----------------------------------------------------
// UPDATED: Draggable Logo Scroller (Interactive + Auto)
// ----------------------------------------------------
(function() {
  var slider = document.querySelector('.logo-scroller');
  var track = document.querySelector('.logo-track');
  
  if(!slider || !track) return;

  var isDown = false;
  var startX;
  var scrollLeft;
  var autoScrollSpeed = 0.8; // px per frame
  var isAutoScrolling = true;
  var animationId;

  // Auto Scroll Function
  function autoScroll() {
    if(isAutoScrolling && !isDown) {
      slider.scrollLeft += autoScrollSpeed;
      // Note: For true infinite looping, you'd need to duplicate items. 
      // This simple version just scrolls until the end.
    }
    animationId = requestAnimationFrame(autoScroll);
  }

  // Start Auto Scroll
  animationId = requestAnimationFrame(autoScroll);

  // Stop auto scroll on interaction
  function stopAuto() { isAutoScrolling = false; }
  function startAuto() { isAutoScrolling = true; }

  // Mouse/Touch Events
  slider.addEventListener('mousedown', function(e) {
    isDown = true;
    stopAuto();
    slider.classList.add('active');
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
  });

  slider.addEventListener('mouseleave', function() {
    isDown = false;
    slider.classList.remove('active');
    startAuto();
  });

  slider.addEventListener('mouseup', function() {
    isDown = false;
    slider.classList.remove('active');
    startAuto();
  });

  slider.addEventListener('mousemove', function(e) {
    if(!isDown) return;
    e.preventDefault();
    var x = e.pageX - slider.offsetLeft;
    var walk = (x - startX) * 2; // Scroll-fast multiplier
    slider.scrollLeft = scrollLeft - walk;
  });

  // Touch Support
  slider.addEventListener('touchstart', function(e) {
    isDown = true;
    stopAuto();
    startX = e.touches[0].pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
  }, { passive: true });

  slider.addEventListener('touchend', function() {
    isDown = false;
    startAuto();
  });

  slider.addEventListener('touchmove', function(e) {
    if(!isDown) return;
    var x = e.touches[0].pageX - slider.offsetLeft;
    var walk = (x - startX) * 2;
    slider.scrollLeft = scrollLeft - walk;
  }, { passive: true });

})();


// ----------------------------------------------------
// CAROUSEL LOGIC (Project Library)
// ----------------------------------------------------
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
    dot.dataset.index = index;
    dotsContainer.appendChild(dot);
  });

  var dots = Array.from(dotsContainer.querySelectorAll(".carousel-dot"));

  function getCurrentIndex() {
    return Math.round(track.scrollLeft / track.offsetWidth);
  }

  function updateDots() {
    var idx = getCurrentIndex();
    dots.forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === idx);
    });
  }

  function scrollToIndex(index) {
    track.scrollTo({ left: track.offsetWidth * index, behavior: 'smooth' });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      var next = (getCurrentIndex() + 1) % slides.length; 
      scrollToIndex(next);
      resetAuto();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      var prev = (getCurrentIndex() - 1 + slides.length) % slides.length; 
      scrollToIndex(prev);
      resetAuto();
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      scrollToIndex(parseInt(dot.dataset.index, 10));
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
      var next = (getCurrentIndex() + 1) % slides.length;
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

var yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

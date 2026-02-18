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
// UPDATED: Interactive Timeline (Looping Logic)
// ----------------------------------------------------
(function() {
  var slides = Array.from(document.querySelectorAll(".timeline-slide"));
  var dotsContainer = document.getElementById("timeline-dots-container");
  var btnFuture = document.getElementById("tl-btn-left");
  var btnPast = document.getElementById("tl-btn-right");
  
  if (!slides.length || !dotsContainer) return;

  var currentIndex = 0; // 0 is the newest year (2026)
  var TOTAL_DOTS = 5;

  // 1. Initial Render of Fixed Dots
  function initDots() {
    dotsContainer.innerHTML = "";
    
    // Create exactly 5 dots
    for (var i = 0; i < TOTAL_DOTS; i++) {
      var wrapper = document.createElement("div");
      wrapper.className = "t-dot-wrapper";
      
      var dot = document.createElement("div");
      dot.className = "t-dot";
      
      wrapper.appendChild(dot);
      dotsContainer.appendChild(wrapper);
    }
  }

  // 2. Update UI based on Current Index
  function updateUI() {
    // A. Show Correct Slide
    slides.forEach(function(s) { s.classList.remove("active"); });
    slides[currentIndex].classList.add("active");

    // B. Handle Dots Logic
    var dotIndex;
    if (currentIndex === slides.length - 1) {
      dotIndex = 4;
    } else {
      dotIndex = currentIndex % 4;
    }

    var dotWrappers = dotsContainer.querySelectorAll(".t-dot-wrapper");
    dotWrappers.forEach(function(d, idx) {
      if (idx === dotIndex) d.classList.add("active");
      else d.classList.remove("active");
    });

    // C. Handle Button Text & Logic
    if (btnPast) {
      if (currentIndex === slides.length - 1) {
        btnPast.innerHTML = "Jump to Now &uarr;";
      } else {
        btnPast.innerHTML = "&rarr; Back in time";
      }
    }
  }

  function goToSlide(index) {
    if (index < 0) index = 0;
    if (index >= slides.length) index = slides.length - 1;
    
    currentIndex = index;
    updateUI();
  }

  if(btnFuture) {
    btnFuture.addEventListener("click", function() {
      goToSlide(currentIndex - 1);
    });
  }

  if(btnPast) {
    btnPast.addEventListener("click", function() {
      if (currentIndex === slides.length - 1) {
        goToSlide(0);
      } else {
        goToSlide(currentIndex + 1);
      }
    });
  }

  initDots();
  updateUI();
})();


// ----------------------------------------------------
// UPDATED: Draggable Logo Scroller (Seamless Auto-Loop)
// ----------------------------------------------------
(function() {
  var slider = document.querySelector('.logo-scroller');
  var track = document.querySelector('.logo-track');
  
  if(!slider || !track) return;

  // Clone nodes for seamless looping
  var items = Array.from(track.children);
  items.forEach(function(item) {
    var clone = item.cloneNode(true);
    track.appendChild(clone);
  });

  var isDown = false;
  var startX;
  var scrollLeft;
  var autoScrollSpeed = 0.8; 
  var isAutoScrolling = true;

  function autoScroll() {
    if(isAutoScrolling && !isDown) {
      slider.scrollLeft += autoScrollSpeed;
      
      // If we've scrolled past the first set of logos, reset to start
      if(slider.scrollLeft >= track.scrollWidth / 2) {
         slider.scrollLeft = 0;
      }
    }
    requestAnimationFrame(autoScroll);
  }

  // Start immediately
  requestAnimationFrame(autoScroll);

  function stopAuto() { isAutoScrolling = false; }
  function startAuto() { isAutoScrolling = true; }

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
    var walk = (x - startX) * 2; 
    slider.scrollLeft = scrollLeft - walk;
  });

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

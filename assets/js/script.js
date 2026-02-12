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

// Updated Carousel logic with Touch & Drag
(function () {
  var track = document.querySelector(".carousel-track");
  var slides = Array.from(document.querySelectorAll(".carousel-item"));
  var windowEl = document.querySelector(".carousel-window");
  var prevBtn = document.querySelector("[data-carousel-prev]");
  var nextBtn = document.querySelector("[data-carousel-next]");
  var dotsContainer = document.querySelector("[data-carousel-dots]");
  if (!track || slides.length === 0 || !dotsContainer || !windowEl) return;

  var currentIndex = 0;
  var slideCount = slides.length;
  var autoInterval = null;
  var AUTO_DELAY = 8000;

  // Touch/Drag Variables
  var isDragging = false;
  var startPos = 0;
  var currentTranslate = 0;
  var prevTranslate = 0;
  var animationID = 0;

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
    currentTranslate = -currentIndex * windowEl.offsetWidth;
    prevTranslate = currentTranslate;
    setSliderPosition();
    updateDots();
  }

  function updateDots() {
    dots.forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === currentIndex);
    });
  }

  function setSliderPosition() {
    track.style.transform = "translateX(" + currentTranslate + "px)";
  }

  // Interaction Logic (Touch & Mouse)
  windowEl.addEventListener('mousedown', dragStart);
  windowEl.addEventListener('touchstart', dragStart);
  windowEl.addEventListener('mouseup', dragEnd);
  windowEl.addEventListener('touchend', dragEnd);
  windowEl.addEventListener('mousemove', dragAction);
  windowEl.addEventListener('touchmove', dragAction);
  windowEl.addEventListener('mouseleave', dragEnd);

  function dragStart(e) {
    isDragging = true;
    startPos = getPositionX(e);
    stopAuto();
    track.style.transition = 'none';
  }

  function dragAction(e) {
    if (!isDragging) return;
    var currentPosition = getPositionX(e);
    var diff = currentPosition - startPos;
    currentTranslate = prevTranslate + diff;
    setSliderPosition();
  }

  function dragEnd() {
    isDragging = false;
    track.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
    var movedBy = currentTranslate - prevTranslate;

    if (movedBy < -100 && currentIndex < slideCount - 1) currentIndex += 1;
    if (movedBy > 100 && currentIndex > 0) currentIndex -= 1;

    goToSlide(currentIndex);
    startAuto();
  }

  function getPositionX(e) {
    return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
  }

  // Buttons
  if (nextBtn) nextBtn.addEventListener("click", function () { goToSlide(currentIndex + 1); resetAuto(); });
  if (prevBtn) prevBtn.addEventListener("click", function () { goToSlide(currentIndex - 1); resetAuto(); });

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      goToSlide(parseInt(dot.dataset.index, 10));
      resetAuto();
    });
  });

  function startAuto() { if (!autoInterval) autoInterval = setInterval(function() { goToSlide(currentIndex + 1); }, AUTO_DELAY); }
  function stopAuto() { clearInterval(autoInterval); autoInterval = null; }
  function resetAuto() { stopAuto(); startAuto(); }

  window.addEventListener('resize', function() { goToSlide(currentIndex); });
  goToSlide(0);
  startAuto();
})();

// Logo scroller: pause on hover
var logoScroller = document.querySelector("[data-logo-scroller]");
if (logoScroller) {
  var logoTrack = logoScroller.querySelector(".logo-track");
  if (logoTrack) {
    logoScroller.addEventListener("mouseenter", function() { logoTrack.style.animationPlayState = "paused"; });
    logoScroller.addEventListener("mouseleave", function() { logoTrack.style.animationPlayState = "running"; });
  }
}

// Year in footer
var yearEl = document.getElementById("year");
if (yearEl) { yearEl.textContent = new Date().getFullYear(); }

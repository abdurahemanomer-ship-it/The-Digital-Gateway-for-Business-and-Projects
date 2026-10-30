const slides = Array.from(document.querySelectorAll(".slide"));
const projectSlides = Array.from(document.querySelectorAll(".project-slide"));
const currentSlideLabel = document.querySelector("#current-slide");
const totalSlidesLabel = document.querySelector("#total-slides");
const progressBar = document.querySelector("#progress-bar");
const previousButton = document.querySelector("#previous-slide");
const nextButton = document.querySelector("#next-slide");
let activeIndex = 0;
let touchStartX = null;

function showImageFallback(image) {
  const figure = image.closest(".project-image");
  if (!figure || figure.classList.contains("image-unavailable")) {
    return;
  }

  figure.classList.add("image-unavailable");
  const fallback = document.createElement("div");
  fallback.className = "image-fallback";
  fallback.setAttribute("role", "status");

  const marker = document.createElement("span");
  marker.className = "fallback-marker";
  marker.setAttribute("aria-hidden", "true");
  marker.textContent = "—";

  const message = document.createElement("span");
  message.className = "fallback-message";
  message.textContent = "تعذّر تحميل صورة هذا المشروع";

  fallback.append(marker, message);
  figure.append(fallback);
}

document.querySelectorAll(".project-image img").forEach((image) => {
  image.addEventListener("error", () => showImageFallback(image), { once: true });
  if (image.complete && image.naturalWidth === 0) {
    showImageFallback(image);
  }
});

function showSlide(target) {
  const targetIndex = typeof target === "number"
    ? target
    : slides.findIndex((slide) => slide.id === target);

  if (targetIndex < 0 || targetIndex >= slides.length) {
    return;
  }

  activeIndex = targetIndex;
  slides.forEach((slide, index) => {
    const isActive = index === activeIndex;
    slide.classList.toggle("is-active", isActive);
    slide.setAttribute("aria-hidden", String(!isActive));
    slide.inert = !isActive;
  });

  const isDark = slides[activeIndex].classList.contains("slide-cover")
    || slides[activeIndex].classList.contains("slide-outro");
  document.body.classList.toggle("dark-slide", isDark);
  currentSlideLabel.textContent = String(activeIndex + 1).padStart(2, "0");
  progressBar.style.width = `${((activeIndex + 1) / slides.length) * 100}%`;
  history.replaceState(null, "", `#${slides[activeIndex].id}`);
}

function stepProject(direction) {
  const currentProjectIndex = projectSlides.findIndex(
    (slide) => slides[activeIndex] === slide,
  );

  if (currentProjectIndex === -1) {
    showSlide(activeIndex + direction);
    return;
  }

  const nextProjectIndex = (currentProjectIndex + direction + projectSlides.length)
    % projectSlides.length;
  showSlide(projectSlides[nextProjectIndex].id);
}

document.addEventListener("click", (event) => {
  const gotoButton = event.target.closest("[data-goto]");
  const projectStepButton = event.target.closest("[data-project-step]");

  if (gotoButton) {
    showSlide(gotoButton.dataset.goto);
  } else if (projectStepButton) {
    stepProject(Number(projectStepButton.dataset.projectStep));
  }
});

previousButton.addEventListener("click", () => showSlide(activeIndex - 1));
nextButton.addEventListener("click", () => showSlide(activeIndex + 1));

document.addEventListener("keydown", (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.repeat) {
    return;
  }

  const target = event.target;
  const isInteractive = target instanceof Element
    && target.closest("a, button, input, textarea, select, [contenteditable='true']");
  if (isInteractive) {
    return;
  }

  if (event.key === "ArrowRight" || event.key === " ") {
    event.preventDefault();
    showSlide(activeIndex + 1);
  } else if (event.key === "ArrowLeft") {
    event.preventDefault();
    showSlide(activeIndex - 1);
  } else if (event.key === "Home") {
    showSlide(0);
  } else if (event.key === "End") {
    showSlide(slides.length - 1);
  }
});

document.addEventListener("touchstart", (event) => {
  const target = event.target;
  if (target instanceof Element && target.closest("a, button")) {
    touchStartX = null;
    return;
  }

  touchStartX = event.changedTouches[0].clientX;
}, { passive: true });

document.addEventListener("touchend", (event) => {
  if (touchStartX === null) {
    return;
  }

  const distance = event.changedTouches[0].clientX - touchStartX;
  touchStartX = null;
  if (Math.abs(distance) < 60) {
    return;
  }

  showSlide(activeIndex + (distance < 0 ? 1 : -1));
}, { passive: true });

window.addEventListener("hashchange", () => {
  const targetIndex = slides.findIndex((slide) => `#${slide.id}` === location.hash);
  if (targetIndex >= 0 && targetIndex !== activeIndex) {
    showSlide(targetIndex);
  }
});

totalSlidesLabel.textContent = String(slides.length).padStart(2, "0");
const initialSlide = slides.findIndex((slide) => `#${slide.id}` === location.hash);
showSlide(initialSlide >= 0 ? initialSlide : 0);

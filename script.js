const toggle = document.querySelector(".menu-toggle");
const drawer = document.querySelector(".drawer");
const backdrop = document.querySelector(".drawer-backdrop");
const closeButton = document.querySelector(".drawer-close");

function setDrawer(open) {
  drawer.classList.toggle("open", open);
  backdrop.classList.toggle("open", open);
  drawer.setAttribute("aria-hidden", String(!open));
  toggle.setAttribute("aria-expanded", String(open));
}

toggle.addEventListener("click", () => setDrawer(true));
closeButton.addEventListener("click", () => setDrawer(false));
backdrop.addEventListener("click", () => setDrawer(false));

document.querySelectorAll("[data-slider]").forEach(slider => {
  const slides = [...slider.querySelectorAll(".slide")];
  const dots = slider.querySelector(".slider-dots");
  let current = 0;

  slides.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `Show slide ${index + 1}`);
    dot.addEventListener("click", () => show(index));
    dots.appendChild(dot);
  });

  const dotButtons = [...dots.children];

  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => slide.classList.toggle("active", slideIndex === current));
    dotButtons.forEach((dot, dotIndex) => dot.classList.toggle("active", dotIndex === current));
  }

  slider.querySelector("[data-prev]").addEventListener("click", () => show(current - 1));
  slider.querySelector("[data-next]").addEventListener("click", () => show(current + 1));
  show(0);
});

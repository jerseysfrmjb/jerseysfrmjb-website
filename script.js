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

document.querySelectorAll(".inventory-filter").forEach(filterGroup => {
  const buttons = [...filterGroup.querySelectorAll("[data-filter]")];
  const cards = [...document.querySelectorAll("[data-inventory-grid] article[data-stock]")];

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      buttons.forEach(item => item.classList.toggle("active", item === button));
      cards.forEach(card => {
        card.hidden = filter !== "all" && card.dataset.stock !== filter;
      });
    });
  });
});
const contactForm = document.querySelector("[data-contact-form]");
if (contactForm) {
  const status = contactForm.querySelector("[data-form-status]");
  const button = contactForm.querySelector("button[type='submit']");
  const endpoint = "https://formsubmit.co/ajax/ea2a0d2ec2d90eeae272b9a983fa788c";

  contactForm.addEventListener("submit", async event => {
    event.preventDefault();
    status.textContent = "Sending...";
    status.className = "form-status";
    button.disabled = true;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: new FormData(contactForm)
      });

      if (!response.ok) throw new Error("Message failed");
      contactForm.reset();
      status.textContent = "Thanks! Your message has been sent. I'll get back to you as soon as possible.";
      status.classList.add("success");
    } catch (error) {
      status.textContent = "Message could not send right now. Please try again or DM @jerseysfrmjb on Instagram.";
      status.classList.add("error");
    } finally {
      button.disabled = false;
    }
  });
}

const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");

if (contactForm && formStatus) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    formStatus.textContent = "هذا نموذج تجريبي؛ لم تُرسل بياناتك أو تُحفظ.";
  });
}
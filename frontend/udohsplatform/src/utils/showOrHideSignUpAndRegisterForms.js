const showForm = (form) => {
  if (form) {
    const form_div = document.querySelector(form);
    form_div.classList.remove("hidden");
    document.querySelector("body").classList.add("menuOpen");

    setTimeout(() => {
      form_div.classList.remove("scale-[0]");
      form_div.classList.remove("rounded-full");

      form_div.classList.add("scale-[1]");
      form_div.classList.add("rounded-none");
    }, 0.05);
  }
};

const hideForm = (form) => {
  if (form) {
    const form_div = document.querySelector(form);
    form_div.classList.remove("scale-[1]");
    form_div.classList.remove("rounded-none");

    form_div.classList.add("scale-[0]");
    form_div.classList.add("rounded-full");

    document.querySelector("body").classList.remove("menuOpen");

    setTimeout(() => {
      form_div.classList.add("hidden");
    }, 500);
  }
};

export { showForm, hideForm };

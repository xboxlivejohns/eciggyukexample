document.getElementById("year").textContent = new Date().getFullYear();

(function () {
  const gate = document.getElementById("ageGate");
  const confirmBtn = document.getElementById("ageGateConfirm");
  const exitBtn = document.getElementById("ageGateExit");

  if (!gate || !confirmBtn || !exitBtn) {
    return;
  }

  const storageKey = "eciggy-age-verified";
  const hasVerified = window.localStorage.getItem(storageKey) === "true";

  const showGate = () => {
    gate.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
    confirmBtn.focus();
  };

  const hideGate = () => {
    gate.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
  };

  if (!hasVerified) {
    showGate();
  }

  confirmBtn.addEventListener("click", () => {
    window.localStorage.setItem(storageKey, "true");
    hideGate();
  });

  exitBtn.addEventListener("click", () => {
    window.location.href = "https://www.google.com";
  });
})();


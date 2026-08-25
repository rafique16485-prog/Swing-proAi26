const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [
  ...parent.querySelectorAll(selector),
];
const toast = $("#toast");
const sheet = $("#action-sheet");
const overlay = $("#overlay");
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function toggleSheet(show = !sheet.classList.contains("open")) {
  sheet.classList.toggle("open", show);
  overlay.classList.toggle("open", show);
}

function openView(viewId) {
  $$(".view").forEach((view) =>
    view.classList.toggle("active", view.id === viewId),
  );
  $$(".nav-item[data-view]").forEach((button) =>
    button.classList.toggle("active", button.dataset.view === viewId),
  );
  window.scrollTo({ top: 0, behavior: "smooth" });
}

const transactions = $("#transactions").innerHTML;
$(".clone-transactions").innerHTML = transactions + transactions;

$$(".nav-item").forEach((button) =>
  button.addEventListener("click", () => {
    button.dataset.view ? openView(button.dataset.view) : toggleSheet(true);
  }),
);

$$(".quick-action").forEach((button) =>
  button.addEventListener("click", () => {
    if (button.dataset.action === "more")
      showToast("More tools are on their way.");
    else toggleSheet(true);
  }),
);

$("#sheet-close").addEventListener("click", () => toggleSheet(false));
overlay.addEventListener("click", () => toggleSheet(false));
$$("[data-toast]").forEach((button) =>
  button.addEventListener("click", () => {
    showToast(button.dataset.toast);
    toggleSheet(false);
  }),
);

$("#visibility-button").addEventListener("click", (event) => {
  const value = $("#balance-value");
  const hidden = value.textContent.includes("•");
  value.textContent = hidden ? "$12,480.50" : "••••••••";
  event.currentTarget.textContent = hidden ? "◉" : "◌";
  event.currentTarget.setAttribute(
    "aria-label",
    hidden ? "Hide balance" : "Show balance",
  );
});

$("#month-switch").addEventListener("click", () =>
  showToast("Showing August 2026."),
);
$("#details-button").addEventListener("click", () =>
  showToast("Balance details opened."),
);
$("#insights-button").addEventListener("click", () =>
  showToast("Your insights are looking great."),
);
$("#see-all-button").addEventListener("click", () => openView("activity-view"));
$("#profile-button").addEventListener("click", () => openView("profile-view"));
$("#notification-button").addEventListener("click", () =>
  showToast("You are all caught up."),
);
$("#filter-button").addEventListener("click", () =>
  showToast("Filters are ready to customize."),
);
$("#card-add-button").addEventListener("click", () =>
  showToast("Card application started."),
);
$("#goal-add-button").addEventListener("click", () =>
  showToast("Let’s create a new goal."),
);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") toggleSheet(false);
});

// Create Machine instance on page load
document.addEventListener("DOMContentLoaded", () => {
	window.machine = new Machine();
	window.machine.addRack();
});

// Initialize tab switching
const tabButtons = document.querySelectorAll(".tab-btn");
const tabPanes = document.querySelectorAll(".tab-pane");

tabButtons.forEach((button) => {
	button.addEventListener("click", () => {
		tabButtons.forEach((btn) => btn.classList.remove("active"));
		tabPanes.forEach((pane) => pane.classList.remove("active"));
		button.classList.add("active");
		document.getElementById(button.dataset.tab).classList.add("active");
	});
});

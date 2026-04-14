import { getHelpContent } from "./content.js";

export function createModalMarkup() {
  return `
    <div class="modal-shell" hidden data-modal-shell>
      <div class="modal-backdrop" data-close-modal></div>
      <div class="modal-panel" role="dialog" aria-modal="true" aria-live="polite">
        <header class="modal-header">
          <div>
            <p class="eyebrow" data-modal-eyebrow></p>
            <h2 data-modal-title></h2>
          </div>
          <button class="icon-button" data-close-modal aria-label="Close modal">Close</button>
        </header>
        <div class="modal-body" data-modal-body></div>
      </div>
    </div>
  `;
}

export function openHelp(modalElements) {
  modalElements.eyebrow.textContent = "Guide";
  modalElements.title.textContent = "Help, Fairness, and Strategy";
  modalElements.body.innerHTML = getHelpContent();
  modalElements.shell.hidden = false;
}

export function openStats(modalElements, statsMarkup) {
  modalElements.eyebrow.textContent = "Session Stats";
  modalElements.title.textContent = "Performance and Analysis";
  modalElements.body.innerHTML = statsMarkup;
  modalElements.shell.hidden = false;
}

export function closeModal(modalElements) {
  modalElements.shell.hidden = true;
}

// showPlayerSelectionModal.js
export function showPlayerSelectionModal(missingPlayer, allNamesFromDB, onConfirm, onCancel) {
  const modal = document.createElement('div');
  modal.classList.add('custom-modal-overlay');
  modal.innerHTML = `
    <div class="custom-modal">
      <h3>Select correct name for "<b>${missingPlayer}</b>"</h3>
      <select id="nameDropdown">
        <option value="">-- Select a name --</option>
        ${allNamesFromDB.map(name => `<option value="${name}">${name}</option>`).join('')}
      </select>
      <div class="button-group">
        <button id="confirmBtn">Confirm</button>
        <button id="cancelBtn">Cancel</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector('#confirmBtn')?.addEventListener('click', () => {
    const value = modal.querySelector('#nameDropdown')?.value;
    document.body.removeChild(modal);
    onConfirm(value);
  });

  modal.querySelector('#cancelBtn')?.addEventListener('click', () => {
    document.body.removeChild(modal);
    onCancel();
  });
}

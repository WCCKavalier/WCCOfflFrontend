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
        <button id="newPlayerBtn">Add as New Player</button>
        <button id="cancelBtn">Cancel</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const cleanup = () => {
    if (document.body.contains(modal)) {
      document.body.removeChild(modal);
    }
  };

  modal.querySelector('#confirmBtn')?.addEventListener('click', () => {
    const value = modal.querySelector('#nameDropdown')?.value;
    cleanup();
    onConfirm(value);  // Continue with the next validation or confirm
  });

  modal.querySelector('#cancelBtn')?.addEventListener('click', () => {
    cleanup();
    onCancel();  // Cancel action
  });

  modal.querySelector('#newPlayerBtn')?.addEventListener('click', async () => {
    try {
      const res = await fetch('https://wccbackendoffl.onrender.com/api/uploadScorecard/playerstatadd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: missingPlayer }), // Send the new player name
      });

      const data = await res.json();

      if (res.ok && data.added?.length) {
        alert(`✅ "${missingPlayer}" added as a new player.`);

        // Proceed with the next missing player or confirm
        cleanup();
        onConfirm(missingPlayer); // Treat as confirmed name for this player
      } else {
        const reason = data.skipped?.[0]?.reason || data.message || 'Unknown error';
        alert(`❌ Could not add new player: ${reason}`);
      }
    } catch (err) {
      alert(`❌ Error adding new player: ${err.message}`);
    }
  });
}

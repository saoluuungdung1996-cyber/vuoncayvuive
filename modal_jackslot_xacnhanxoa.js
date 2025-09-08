/* START OF FILE JS/modal_jackslot_xacnhanxoa.js */

document.addEventListener('DOMContentLoaded', () => {
    let modal = null;

    function createConfirmModal() {
        if (document.getElementById('jackslot-confirm-delete-overlay')) return;

        const modalHTML = `
            <div id="jackslot-confirm-delete-overlay" class="jackslot-confirm-delete-overlay">
                <div class="jackslot-confirm-delete-content">
                    <h2>Xác Nhận Xóa</h2>
                    <p id="confirm-delete-message">Bạn có chắc chắn muốn xóa không?</p>
                    <div class="jackslot-confirm-delete-buttons">
                        <button id="cancel-delete-history-btn">Hủy</button>
                        <button id="confirm-delete-history-btn">Xóa</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        modal = document.getElementById('jackslot-confirm-delete-overlay');

        modal.querySelector('#confirm-delete-history-btn').addEventListener('click', () => {
            if (typeof window.confirmClearHistory === 'function') {
                window.confirmClearHistory();
            }
            hideConfirmModal();
        });
        modal.querySelector('#cancel-delete-history-btn').addEventListener('click', hideConfirmModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) hideConfirmModal();
        });
    }

    window.showClearHistoryConfirmModal = function(count) {
        createConfirmModal();
        document.getElementById('confirm-delete-message').textContent = `Bạn có chắc chắn muốn xóa ${count} kết quả quay gần nhất không? Hành động này không thể hoàn tác.`;
        modal.classList.add('visible');
    };

    function hideConfirmModal() {
        if (modal) modal.classList.remove('visible');
    }
});

/* END OF FILE JS/modal_jackslot_xacnhanxoa.js */
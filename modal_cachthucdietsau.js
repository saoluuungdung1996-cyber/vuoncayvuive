/* START OF FILE JS/modal_cachthucdietsau.js */

document.addEventListener('DOMContentLoaded', () => {
    let modal = null;
    let currentPlotNumber = null;

    // Hàm tạo modal (chỉ chạy 1 lần)
    function createPestChoiceModal() {
        if (document.getElementById('pest-choice-modal')) return;

        const modalHTML = `
        <div id="pest-choice-modal" class="pest-choice-modal">
            <div class="pest-choice-content">
                <img src="Pics/nut-dong.png" alt="Đóng" class="pest-choice-close-button">
                <h2>Chọn cách thức diệt sâu</h2>
                <div class="pest-choice-buttons">
                    <button id="spray-pesticide-btn">
                        <img src="Pics/Cuahang/Vatpham/thuoctrusau-icon.png" alt="Phun thuốc">
                        <span>Phun thuốc</span>
                    </button>
                    <button id="manual-pest-btn">
                        <img src="Pics/consau.png" alt="Bắt sâu">
                        <span>Bắt sâu thủ công</span>
                    </button>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        modal = document.getElementById('pest-choice-modal');
        addEventListenersToModal();
    }

    // Gán sự kiện
    function addEventListenersToModal() {
        const closeBtn = modal.querySelector('.pest-choice-close-button');
        const sprayBtn = document.getElementById('spray-pesticide-btn');
        const manualBtn = document.getElementById('manual-pest-btn');

        closeBtn.addEventListener('click', hidePestChoiceModal);
        modal.addEventListener('click', (e) => { if (e.target === modal) hidePestChoiceModal(); });

        // Sự kiện cho nút "Phun thuốc"
        sprayBtn.addEventListener('click', () => {
            if (sprayBtn.disabled) return;
            if (currentPlotNumber && typeof window.applyPesticide === 'function') {
                window.applyPesticide(currentPlotNumber);
                hidePestChoiceModal(); // Đóng modal sau khi thực hiện
            }
        });

        // Sự kiện cho nút "Bắt sâu thủ công"
        manualBtn.addEventListener('click', () => {
            if (manualBtn.disabled) return;
            hidePestChoiceModal(); // Đóng modal lựa chọn
            // Mở modal mini-game
            if (typeof window.showManualPestModal === 'function') {
                setTimeout(() => {
                    window.showManualPestModal(currentPlotNumber);
                }, 200);
            } else {
                console.error("Hàm showManualPestModal không tồn tại!");
            }
        });
    }

    // Hàm hiển thị modal (sẽ được gọi từ file khác)
    window.showPestChoiceModal = (plotNumber) => {
        createPestChoiceModal();
        currentPlotNumber = plotNumber;

        const sprayBtn = document.getElementById('spray-pesticide-btn');
        const manualBtn = document.getElementById('manual-pest-btn');
        const sprayBtnText = sprayBtn.querySelector('span');

        // Cập nhật trạng thái nút "Phun thuốc"
        const pesticideAmount = playerData.inventory.items['thuoc-tru-sau'] || 0;
        if (pesticideAmount > 0) {
            sprayBtnText.textContent = `Phun thuốc (${pesticideAmount})`;
            sprayBtn.disabled = false;
        } else {
            sprayBtnText.textContent = 'Phun thuốc (Hết)';
            sprayBtn.disabled = true;
        }

        // Cập nhật trạng thái nút "Bắt sâu thủ công"
        // Hiện tại luôn bật nút này để người chơi biết có lựa chọn
        manualBtn.disabled = false;

        modal.classList.add('visible');
    };

    // Hàm ẩn modal
    function hidePestChoiceModal() {
        if (modal) modal.classList.remove('visible');
    }
});
/* END OF FILE JS/modal_cachthucdietsau.js */
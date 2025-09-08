/* START OF FILE JS/modal_jackslot_banghuongdan.js */

document.addEventListener('DOMContentLoaded', () => {
    let modal = null;

    // Hàm tạo modal hướng dẫn (chỉ chạy 1 lần)
    function createHelpModal() {
        if (document.getElementById('jackslot-help-modal-overlay')) return;

        const modalHTML = `
            <div id="jackslot-help-modal-overlay" class="jackslot-help-modal-overlay">
                <div class="jackslot-help-modal-content">
                    <button class="jackslot-help-close-button">&times;</button>
                    <h2>Hướng Dẫn & Thưởng</h2>
                    <div class="jackslot-help-scrollable-area">
                        <div class="jackslot-help-section">
                            <h3>Cách Chơi:</h3>
                            <ul>
                                <li>Dùng nút <strong>+/-</strong> hoặc nhập trực tiếp vào ô <strong>"CƯỢC"</strong>.</li>
                                <li>Nhấn giữ nút <strong>"QUAY"</strong>. Giữ càng lâu, vòng quay càng dài.</li>
                                <li>Thả nút để các ô quay và dừng lại.</li>
                                <li>Trúng thưởng nếu có 2 hoặc 3 biểu tượng giống nhau!</li>
                                <li>Để có lượt quay, hãy thu hoạch 5 cây bất kì để đổi 1 lượt quay</li>
                            </ul>
                        </div>
                        <div class="jackslot-help-section">
                            <h3>Bảng Trả Thưởng:</h3>
                            <p>(Tiền thắng = Tỷ lệ x Mức cược)</p>
                            <div id="jackslot-payout-table"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        modal = document.getElementById('jackslot-help-modal-overlay');
        
        // Gán sự kiện đóng
        modal.querySelector('.jackslot-help-close-button').addEventListener('click', hideHelpModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) hideHelpModal();
        });
    }

    // Hàm điền dữ liệu vào bảng trả thưởng
    function populatePayoutTable() {
        const payouts3 = { '💎': 100, '⭐': 50, '🔔': 25, '🍉': 20, '🍊': 15, '🍋': 10, '🍒': 5 };
        const payouts2 = { '💎': 20, '⭐': 10, '🔔': 8, '🍉': 6, '🍊': 4, '🍋': 3, '🍒': 2 };
        const payoutContainer = document.getElementById('jackslot-payout-table');
        if (!payoutContainer) return;

        let tableHTML = `
            <div class="payout-category">
                <h4>Thắng 3 Biểu Tượng</h4>
                <div class="payout-grid">
        `;
        Object.entries(payouts3).sort(([,a],[,b]) => b-a).forEach(([symbol, payout]) => {
            tableHTML += `<div>${symbol.repeat(3)}</div><div>x${payout}</div>`;
        });
        tableHTML += `</div></div>`;

        tableHTML += `
            <div class="payout-category">
                <h4>Thắng 2 Biểu Tượng</h4>
                <div class="payout-grid">
        `;
        Object.entries(payouts2).sort(([,a],[,b]) => b-a).forEach(([symbol, payout]) => {
            tableHTML += `<div>${symbol.repeat(2)}-</div><div>x${payout}</div>`;
        });
        tableHTML += `</div></div>`;

        payoutContainer.innerHTML = tableHTML;
    }

    // Hàm hiển thị modal (hàm chính, được gọi từ file khác)
    window.showJackslotHelpModal = function() {
        createHelpModal();
        populatePayoutTable();
        modal.classList.add('visible');
    };

    // Hàm ẩn modal
    function hideHelpModal() {
        if (modal) modal.classList.remove('visible');
    }
});

/* END OF FILE JS/modal_jackslot_banghuongdan.js */
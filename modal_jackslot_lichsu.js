/* START OF FILE JS/modal_jackslot_lichsu.js - PHIÊN BẢN NÂNG CẤP */

document.addEventListener('DOMContentLoaded', () => {
    let modal = null;
    let currentLimit = 10; // Mặc định hiển thị 10 kết quả

    function createHistoryModal() {
        if (document.getElementById('jackslot-history-overlay')) return;

        const modalHTML = `
            <div id="jackslot-history-overlay" class="jackslot-history-overlay">
                <div class="jackslot-history-content">
                    <button class="jackslot-history-close-button">&times;</button>
                    <h2>Lịch Sử Quay</h2>
                    
                    <!-- START: Bổ sung các nút điều khiển -->
                    <div class="jackslot-history-controls">
                        <select id="history-limit-select">
                            <option value="10">10 kết quả gần nhất</option>
                            <option value="20">20 kết quả gần nhất</option>
                        </select>
                        <button id="clear-history-btn" title="Xóa các kết quả đang hiển thị">Xóa kết quả</button>
                    </div>
                    <!-- END: Bổ sung các nút điều khiển -->

                    <div class="jackslot-history-table-container">
                        <table class="jackslot-history-table">
                            <thead>
                                <tr>
                                    <th>Thời gian</th>
                                    <th>Cược</th>
                                    <th>Thắng</th>
                                    <th>Kết quả</th>
                                </tr>
                            </thead>
                            <tbody id="jackslot-history-tbody"></tbody>
                        </table>
                        <p id="jackslot-history-empty" class="jackslot-history-empty" style="display: none;">Chưa có lịch sử nào.</p>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        modal = document.getElementById('jackslot-history-overlay');
        
        // Gán sự kiện
        modal.querySelector('.jackslot-history-close-button').addEventListener('click', hideHistoryModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) hideHistoryModal();
        });

        // Sự kiện cho các nút điều khiển mới
        document.getElementById('history-limit-select').addEventListener('change', (e) => {
            currentLimit = parseInt(e.target.value, 10);
            populateHistoryTable();
        });
        document.getElementById('clear-history-btn').addEventListener('click', () => {
             // Gọi hàm hiển thị modal xác nhận từ file mới
            if (typeof window.showClearHistoryConfirmModal === 'function') {
                const historyCount = Math.min(playerData.jacksot?.history?.length || 0, currentLimit);
                if (historyCount > 0) {
                    window.showClearHistoryConfirmModal(historyCount);
                } else {
                    showGeneralNotification("Không có lịch sử để xóa!", "info");
                }
            }
        });
    }

    // --- CÁC HÀM XỬ LÝ ---

    function populateHistoryTable() {
        const historyData = playerData.jacksot?.history || [];
        const tbody = document.getElementById('jackslot-history-tbody');
        const emptyMsg = document.getElementById('jackslot-history-empty');
        if (!tbody || !emptyMsg) return;

        const sortedHistory = historyData.sort((a, b) => b.timestamp - a.timestamp);
        const limitedHistory = sortedHistory.slice(0, currentLimit);

        if (limitedHistory.length === 0) {
            tbody.innerHTML = '';
            emptyMsg.style.display = 'block';
        } else {
            emptyMsg.style.display = 'none';
            tbody.innerHTML = limitedHistory.map(item => {
                const date = new Date(item.timestamp);
                
                // START: Định dạng thời gian mới
                const h = String(date.getHours()).padStart(2, '0');
                const min = String(date.getMinutes()).padStart(2, '0');
                const s = String(date.getSeconds()).padStart(2, '0');
                const d = String(date.getDate()).padStart(2, '0');
                const m = String(date.getMonth() + 1).padStart(2, '0');
                const y = String(date.getFullYear()).slice(-2); // Lấy 2 số cuối của năm
                const timeStr = `${h}:${min}:${s} ${d}/${m}/${y}`;
                // END: Định dạng thời gian mới
                
                const winClass = item.winnings > 0 ? 'win-amount' : 'no-win';
                const winText = item.winnings > 0 ? `+${item.winnings.toLocaleString('vi-VN')}` : '---';

                return `
                    <tr>
                        <td>${timeStr}</td>
                        <td>${item.bet.toLocaleString('vi-VN')}</td>
                        <td class="${winClass}">${winText}</td>
                        <td>${item.result.join(' ')}</td>
                    </tr>
                `;
            }).join('');
        }
    }

    // Hàm này sẽ được gọi từ modal xác nhận để thực hiện việc xóa
    window.confirmClearHistory = function() {
        const historyData = playerData.jacksot?.history || [];
        if (historyData.length === 0) return;

        // Sắp xếp để đảm bảo xóa đúng những cái mới nhất
        const sortedHistory = historyData.sort((a, b) => b.timestamp - a.timestamp);
        const numberToDelete = Math.min(sortedHistory.length, currentLimit);
        
        // Xóa các phần tử đầu tiên (mới nhất) khỏi mảng đã sắp xếp
        sortedHistory.splice(0, numberToDelete);

        // Gán lại mảng đã được xóa vào playerData
        playerData.jacksot.history = sortedHistory;
        
        showGeneralNotification(`Đã xóa ${numberToDelete} kết quả quay gần nhất.`, 'success');
        
        // Cập nhật lại bảng
        populateHistoryTable();
    };

    window.showJackslotHistoryModal = function() {
        createHistoryModal();
        currentLimit = parseInt(document.getElementById('history-limit-select').value, 10);
        populateHistoryTable();
        modal.classList.add('visible');
    };

    function hideHistoryModal() {
        if (modal) modal.classList.remove('visible');
    }
});

/* END OF FILE JS/modal_jackslot_lichsu.js */
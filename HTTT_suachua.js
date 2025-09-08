/* START OF FILE JS/HTTT_suachua.js */

document.addEventListener('DOMContentLoaded', () => {
    let modal = null;
    let currentPlotNumber = null;
    let repairCostPerPercent = 5;

    // Hàm tạo modal (chỉ chạy 1 lần)
    function createRepairModal() {
        if (document.getElementById('repair-modal-overlay')) return;

        const modalHTML = `
        <div id="repair-modal-overlay" class="repair-modal-overlay">
            <div class="repair-modal-content">
                <img src="Pics/nut-dong.png" alt="Đóng" class="repair-close-button">
                <h2 id="repair-modal-title">Sửa chữa hệ thống</h2>
                <div class="repair-info-section">
                    <p>Độ hư hao hiện tại: <strong id="current-damage-percent">0%</strong></p>
                    <p>Chi phí sửa mỗi 1%: <strong id="repair-cost-per-percent">0$</strong></p>
                    <hr>
                    <p class="repair-total-cost">Tổng thanh toán: <strong id="total-repair-payment">0$</strong></p>
                </div>
                <div class="repair-buttons">
                    <button id="cancel-repair-btn">Hủy bỏ</button>
                    <button id="confirm-repair-btn">Thanh toán</button>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        modal = document.getElementById('repair-modal-overlay');
        addEventListenersToRepairModal();
    }

    // Gán sự kiện cho các nút trong modal
    function addEventListenersToRepairModal() {
        modal.querySelector('.repair-close-button').addEventListener('click', hideRepairModal);
        modal.addEventListener('click', (e) => { if (e.target === modal) hideRepairModal(); });

        document.getElementById('cancel-repair-btn').addEventListener('click', hideRepairModal);
        document.getElementById('confirm-repair-btn').addEventListener('click', handleRepairPayment);
    }

    // Hàm xử lý thanh toán sửa chữa
    function handleRepairPayment() {
        if (!currentPlotNumber) return;
        
        const plotData = playerData.farmPlots[currentPlotNumber];
        const durability = plotData.irrigationDurability ?? 100;
        const damagePercent = 100 - Math.round(durability);
        
        const totalCost = damagePercent * repairCostPerPercent;

        if (playerData.money < totalCost) {
            showGeneralNotification("Bạn không đủ tiền để sửa chữa!", "warning");
            return;
        }

        // Trừ tiền
        playerData.money -= totalCost;
        document.getElementById('so-tien-hien-tai').textContent = playerData.money;
        
        // Phục hồi độ bền
        plotData.irrigationDurability = 100;
        
        markDataAsDirty();
        
        showGeneralNotification(`Đã sửa chữa thành công hệ thống tại ô ${currentPlotNumber}!`, "success");
        
        // Cập nhật lại modal quản lý HTTT
        if (typeof window.renderIrrigationModal === 'function') {
            window.renderIrrigationModal();
        }
        
        hideRepairModal();
    }

    // Hàm hiển thị modal (hàm chính)
    window.showRepairModal = async function(plotNumber) {
        createRepairModal();
        currentPlotNumber = plotNumber;
         // Lấy giá sửa chữa từ Firebase
        try {
            const doc = await db.collection('settings').doc('energy').get();
            if (doc.exists && doc.data().HTTT_repair) {
                repairCostPerPercent = doc.data().HTTT_repair;
            }
        } catch (error) {
            console.error("Không thể tải giá sửa chữa, sử dụng giá mặc định:", error);
        }

        const plotData = playerData.farmPlots[plotNumber];
        const durability = plotData.irrigationDurability ?? 100;
        const damagePercent = 100 - Math.round(durability);

        const totalCost = damagePercent * repairCostPerPercent;

        // Cập nhật giao diện modal
        document.getElementById('repair-modal-title').textContent = `Sửa chữa hệ thống [Ô ${plotNumber}]`;
        document.getElementById('current-damage-percent').textContent = `${damagePercent}%`;
        document.getElementById('repair-cost-per-percent').textContent = `${repairCostPerPercent.toLocaleString('vi-VN')}$`;
        document.getElementById('total-repair-payment').textContent = `${totalCost.toLocaleString('vi-VN')}$`;
        
        // Vô hiệu hóa nút nếu không đủ tiền hoặc không có gì để sửa
        const confirmBtn = document.getElementById('confirm-repair-btn');
        if (playerData.money < totalCost || damagePercent <= 0) {
            confirmBtn.disabled = true;
            if (damagePercent <= 0) confirmBtn.textContent = 'Đã tốt';
        } else {
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Thanh toán';
        }

        modal.classList.add('visible');
    };

    // Hàm ẩn modal
    function hideRepairModal() {
        if (modal) modal.classList.remove('visible');
    }
});

/* END OF FILE JS/HTTT_suachua.js */
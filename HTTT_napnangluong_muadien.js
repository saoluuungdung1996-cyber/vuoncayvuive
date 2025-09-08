/* START OF FILE JS/HTTT_napnangluong_muadien.js */

document.addEventListener('DOMContentLoaded', () => {
    let modal = null;
    let energyPricePerPercent = 10; // Giá mặc định nếu không tải được từ Firebase

    // Hàm tạo modal (chỉ chạy 1 lần)
    function createBuyEnergyModal() {
        if (document.getElementById('buy-energy-modal-overlay')) return;

        const modalHTML = `
        <div id="buy-energy-modal-overlay" class="buy-energy-modal-overlay">
            <div class="buy-energy-modal-content">
                <img src="Pics/nut-dong.png" alt="Đóng" class="buy-energy-close-button">
                <h2>MUA ĐIỆN</h2>
                <div class="energy-status-display">
                    <p>Năng lượng chung hiện tại:</p>
                    <div class="energy-bar-container-buy">
                        <div id="buy-energy-bar-current" class="energy-bar-progress-buy"></div>
                        <span id="buy-energy-text-current" class="energy-bar-text-buy">0%</span>
                    </div>
                </div>
                <div class="billing-info">
                    <p>Năng lượng cần nạp: <strong id="energy-needed">0%</strong></p>
                    <p>Giá mỗi 1%: <strong id="energy-price-per-unit">0$</strong></p>
                    <hr>
                    <p class="total-cost">Tổng thanh toán: <strong id="total-payment">0$</strong></p>
                </div>
                <div class="buy-energy-buttons">
                    <button id="cancel-buy-energy-btn">Hủy bỏ</button>
                    <button id="confirm-buy-energy-btn">Thanh toán</button>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        modal = document.getElementById('buy-energy-modal-overlay');
        addEventListenersToBuyEnergyModal();
    }

    // Gán sự kiện cho các nút trong modal
    function addEventListenersToBuyEnergyModal() {
        modal.querySelector('.buy-energy-close-button').addEventListener('click', hideBuyEnergyModal);
        modal.addEventListener('click', (e) => { if (e.target === modal) hideBuyEnergyModal(); });

        document.getElementById('cancel-buy-energy-btn').addEventListener('click', hideBuyEnergyModal);
        document.getElementById('confirm-buy-energy-btn').addEventListener('click', handlePayment);
    }

    // Hàm xử lý thanh toán
    async function handlePayment() {
        const currentEnergyLevel = playerData.irrigationEnergyLevel || 1;
const maxEnergy = getMaxEnergyCapacity(currentEnergyLevel);
const energyNeeded = maxEnergy - Math.round(playerData.irrigationEnergy || 0);
        const totalCost = energyNeeded * energyPricePerPercent;

        if (playerData.money < totalCost) {
            showGeneralNotification("Bạn không đủ tiền để mua điện!", "warning");
            return;
        }

        // Trừ tiền
        playerData.money -= totalCost;
        document.getElementById('so-tien-hien-tai').textContent = playerData.money;
        
        // Nạp đầy năng lượng
        playerData.irrigationEnergy = maxEnergy;
        
        markDataAsDirty();
        
        showGeneralNotification(`Nạp thành công ${energyNeeded}% năng lượng với giá ${totalCost}$!`, "success");
        
        // Cập nhật lại modal quản lý HTTT nếu nó đang mở
        const mngModal = document.getElementById('irrigation-mng-overlay');
        if (mngModal && mngModal.classList.contains('visible')) {
            // Gọi hàm render gốc để nó tự đọc dữ liệu mới (năng lượng = 100) và cập nhật UI
            if(typeof renderIrrigationModal === 'function') {
                renderIrrigationModal();
            }
        }
        
        hideBuyEnergyModal();
    }

    // Hàm hiển thị modal (hàm chính)
    window.showBuyEnergyModal = async function() {
        createBuyEnergyModal();

        // Lấy giá từ Firebase
        try {
            const doc = await db.collection('settings').doc('energy').get();
            if (doc.exists) {
                energyPricePerPercent = doc.data().pricePerPercent || 10;
            }
        } catch (error) {
            console.error("Không thể tải giá năng lượng, sử dụng giá mặc định:", error);
        }
        
        const currentEnergy = Math.round(playerData.irrigationEnergy || 100);
        const currentEnergyLevel = playerData.irrigationEnergyLevel || 1;
const maxEnergy = getMaxEnergyCapacity(currentEnergyLevel);
const energyNeeded = maxEnergy - currentEnergy;
        const totalCost = energyNeeded * energyPricePerPercent;

        // Cập nhật giao diện modal
        document.getElementById('buy-energy-bar-current').style.width = `${currentEnergy}%`;
        document.getElementById('buy-energy-text-current').textContent = `${currentEnergy}%`;
        document.getElementById('energy-needed').textContent = `${energyNeeded}%`;
        document.getElementById('energy-price-per-unit').textContent = `${energyPricePerPercent.toLocaleString('vi-VN')}$`;
        document.getElementById('total-payment').textContent = `${totalCost.toLocaleString('vi-VN')}$`;

        // Vô hiệu hóa nút thanh toán nếu không đủ tiền hoặc đã đầy năng lượng
        const confirmBtn = document.getElementById('confirm-buy-energy-btn');
        if (playerData.money < totalCost || energyNeeded <= 0) {
            confirmBtn.disabled = true;
            if (energyNeeded <= 0) confirmBtn.textContent = 'Đã đầy';
        } else {
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Thanh toán';
        }

        modal.classList.add('visible');
    };

    // Hàm ẩn modal
    function hideBuyEnergyModal() {
        if (modal) modal.classList.remove('visible');
    }
});

/* END OF FILE JS/HTTT_napnangluong_muadien.js */
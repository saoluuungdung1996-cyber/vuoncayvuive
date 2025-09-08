

document.addEventListener('DOMContentLoaded', () => {
    let modal = null;

    // Hàm tạo modal (chỉ chạy 1 lần)
    function createRechargeModal() {
        if (document.getElementById('recharge-choice-modal-overlay')) return;

        const modalHTML = `
        <div id="recharge-choice-modal-overlay" class="recharge-choice-modal-overlay">
            <div class="recharge-choice-modal-content">
                <img src="Pics/nut-dong.png" alt="Đóng" class="recharge-choice-close-button">
                <h2>Chọn cách thức nạp năng lượng</h2>
                <div class="recharge-options-container">
                    <div class="recharge-option-card" id="solar-recharge-btn">
                        <img src="Pics/Cuahang/Daocu/nangluongmattroi.png" alt="Năng lượng mặt trời">
                        <h3>Sử dụng NLMT</h3>
                        <p>Miễn phí, nhưng chỉ hoạt động khi trời nắng.</p>
                    </div>

                    <div class="recharge-option-card" id="buy-energy-btn">
                        <img src="Pics/Cuahang/Daocu/muadien.png" alt="Mua điện">
                        <h3>Mua điện</h3>
                        <p>Nạp đầy ngay lập-tức với một khoản chi phí.</p>
                    </div>
                </div>
                   <div class="recharge-option-card" id="upgrade-energy-storage-btn">
                        <img src="Pics/icon_nangcapodat.png" alt="Nâng cấp">
                        <h3>Nâng cấp Bể chứa</h3>
                        <p>Tăng sức chứa năng lượng tối đa.</p>
                    </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        modal = document.getElementById('recharge-choice-modal-overlay');
        addEventListenersToRechargeModal();
    }

    // Gán sự kiện cho các nút trong modal
    function addEventListenersToRechargeModal() {
        modal.querySelector('.recharge-choice-close-button').addEventListener('click', hideRechargeModal);
        modal.addEventListener('click', (e) => { if (e.target === modal) hideRechargeModal(); });

        document.getElementById('solar-recharge-btn').addEventListener('click', () => {
            // Logic cho Năng lượng mặt trời
            alert("Logic sử dụng năng lượng mặt trời sẽ được bổ sung sau!");
            hideRechargeModal();
        });

       
        // Giờ đây JavaScript có thể tìm thấy nút với ID chính xác
        document.getElementById('upgrade-energy-storage-btn').addEventListener('click', () => {
            hideRechargeModal();
            if (typeof window.showEnergyUpgradeModal === 'function') {
                setTimeout(() => {
                    window.showEnergyUpgradeModal();
                }, 250);
            }
        });
       

         document.getElementById('buy-energy-btn').addEventListener('click', () => {
            // Đóng modal lựa chọn hiện tại
            hideRechargeModal();
            // Mở modal mua điện
            if (typeof window.showBuyEnergyModal === 'function') {
                // Thêm delay nhỏ để hiệu ứng chuyển đổi mượt hơn
                setTimeout(() => {
                    window.showBuyEnergyModal();
                }, 250);
            }
        });
    }

    // Hàm hiển thị modal (hàm này sẽ được các file khác gọi)
    window.showRechargeModal = function() {
        createRechargeModal();
        
        // Cập nhật trạng thái của các nút trước khi hiển thị
        const solarBtn = document.getElementById('solar-recharge-btn');
        const currentWeather = playerData.weather.current;
        const isSunny = (currentWeather === 'nangnhe' || currentWeather === 'nanggat');
        
     
        const upgradeBtn = document.getElementById('upgrade-energy-storage-btn');
       

        const currentEnergyLevel = playerData.irrigationEnergyLevel || 1;
        const maxLevel = Math.max(...Object.keys(ENERGY_UPGRADE_TIERS).map(Number));
        upgradeBtn.classList.toggle('disabled', currentEnergyLevel >= maxLevel);
        if(currentEnergyLevel >= maxLevel){
            upgradeBtn.querySelector('p').textContent = "Đã đạt cấp tối đa.";
        } else {
            upgradeBtn.querySelector('p').textContent = "Tăng sức chứa năng lượng tối đa.";
        }
        
        solarBtn.classList.toggle('disabled', !isSunny); // Thêm/xóa class 'disabled'
        solarBtn.querySelector('p').textContent = isSunny 
            ? "Miễn phí, đang có hiệu lực!" 
            : "Miễn phí, nhưng chỉ hoạt động khi trời nắng.";

        modal.classList.add('visible');
    };

    // Hàm ẩn modal
    function hideRechargeModal() {
        if (modal) modal.classList.remove('visible');
    }
});

/* END OF FILE JS/HTTT_napnangluong.js */
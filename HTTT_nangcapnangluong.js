/* START OF FILE JS/HTTT_nangcapnangluong.js */

document.addEventListener('DOMContentLoaded', () => {
    let modal = null;

    // Hàm tạo modal (chỉ chạy 1 lần)
    function createEnergyUpgradeModal() {
        if (document.getElementById('energy-upgrade-modal-overlay')) return;

        const modalHTML = `
        <div id="energy-upgrade-modal-overlay" class="energy-upgrade-modal-overlay">
            <div class="energy-upgrade-modal-content">
                <img src="Pics/nut-dong.png" alt="Đóng" class="energy-upgrade-close-button">
                <h2>NÂNG CẤP BỂ CHỨA NĂNG LƯỢNG</h2>
                <div class="upgrade-info-section">
                    <p>Cấp độ bể chứa:
                        <span>
                            <span id="current-energy-level" class="info-value">1</span>
                            <span class="arrow">→</span>
                            <span id="next-energy-level" class="info-value upgrade-success">2</span>
                        </span>
                    </p>
                    <p>Sức chứa tối đa:
                        <span>
                            <span id="current-energy-capacity" class="info-value">100%</span>
                            <span class="arrow">→</span>
                            <span id="next-energy-capacity" class="info-value upgrade-success">120%</span>
                        </span>
                    </p>
                </div>
                <div class="upgrade-requirements">
                    <p><span>Yêu cầu cấp độ:</span> <strong id="req-player-level">Cấp 15</strong></p>
                    <p><span>Chi phí nâng cấp:</span> <strong id="upgrade-energy-cost">5,000$</strong></p>
                    <p><span>Tiền của bạn:</span> <strong id="player-current-money">0$</strong></p>
                </div>
                <div class="upgrade-buttons">
                    <button id="cancel-energy-upgrade-btn">Để sau</button>
                    <button id="confirm-energy-upgrade-btn">Nâng Cấp</button>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        modal = document.getElementById('energy-upgrade-modal-overlay');
        addEventListenersToModal();
    }

    function addEventListenersToModal() {
        modal.querySelector('.energy-upgrade-close-button').addEventListener('click', hideEnergyUpgradeModal);
        modal.addEventListener('click', (e) => { if (e.target === modal) hideEnergyUpgradeModal(); });
        document.getElementById('cancel-energy-upgrade-btn').addEventListener('click', hideEnergyUpgradeModal);
        document.getElementById('confirm-energy-upgrade-btn').addEventListener('click', handleConfirmUpgrade);
    }

    function hideEnergyUpgradeModal() {
        if (modal) modal.classList.remove('visible');
    }

    window.showEnergyUpgradeModal = function() {
        createEnergyUpgradeModal();
        
        const currentLevel = playerData.irrigationEnergyLevel || 1;
        const currentCapacity = getMaxEnergyCapacity(currentLevel);

        const nextLevel = Object.keys(ENERGY_UPGRADE_TIERS).find(level => level > currentLevel);
        
        if (!nextLevel) {
            showGeneralNotification("Bể chứa năng lượng đã đạt cấp tối đa!", "info");
            return;
        }

        const nextTierData = ENERGY_UPGRADE_TIERS[nextLevel];

        // Cập nhật giao diện
        document.getElementById('current-energy-level').textContent = currentLevel;
        document.getElementById('next-energy-level').textContent = nextLevel;
        document.getElementById('current-energy-capacity').textContent = `${currentCapacity}%`;
        document.getElementById('next-energy-capacity').textContent = `${nextTierData.capacity}%`;
        document.getElementById('req-player-level').textContent = `Cấp ${nextTierData.requiredLevel}`;
        document.getElementById('upgrade-energy-cost').textContent = `${nextTierData.cost.toLocaleString('vi-VN')}$`;
        
        const playerMoneyEl = document.getElementById('player-current-money');
        playerMoneyEl.textContent = `${playerData.money.toLocaleString('vi-VN')}$`;

        const canAfford = playerData.money >= nextTierData.cost;
        const levelMet = playerData.level >= nextTierData.requiredLevel;

        playerMoneyEl.classList.toggle('insufficient', !canAfford);
        document.getElementById('confirm-energy-upgrade-btn').disabled = !canAfford || !levelMet;

        modal.classList.add('visible');
    };

    function handleConfirmUpgrade() {
        const currentLevel = playerData.irrigationEnergyLevel || 1;
        const nextLevel = Object.keys(ENERGY_UPGRADE_TIERS).find(level => level > currentLevel);
        if (!nextLevel) return;

        const upgradeInfo = ENERGY_UPGRADE_TIERS[nextLevel];

        // Trừ tiền
        playerData.money -= upgradeInfo.cost;
        document.getElementById('so-tien-hien-tai').textContent = playerData.money;

        // Nâng cấp
        playerData.irrigationEnergyLevel = parseInt(nextLevel, 10);
        markDataAsDirty();
        
        showGeneralNotification(`Nâng cấp Bể chứa năng lượng lên Cấp ${nextLevel} thành công!`, "success");
        hideEnergyUpgradeModal();

        // Cập nhật modal quản lý nếu đang mở
        const mngModal = document.getElementById('irrigation-mng-overlay');
        if (mngModal && mngModal.classList.contains('visible') && typeof renderIrrigationModal === 'function') {
            renderIrrigationModal();
        }
    }
});

/* END OF FILE JS/HTTT_nangcapnangluong.js */
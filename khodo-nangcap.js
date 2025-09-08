/* START OF FILE JS/khodo-nangcap.js */

// Biến quản lý interval để có thể xóa khi cần
let upgradeInterval;

// --- CÁC HÀM TÍNH TOÁN ---

// Đối tượng lưu trữ tất cả các cấp độ nâng cấp và yêu cầu của chúng
const upgradeTiers = {
    // Key là cấp độ sẽ được nâng cấp LÊN
    '2': { cost: 2000,  requiredLevel: 10, capacity: 200,  timeInSeconds: 60 * 60   },
    '3': { cost: 5000,  requiredLevel: 18, capacity: 500,  timeInSeconds: 180 * 60  },
    '4': { cost: 10000, requiredLevel: 25, capacity: 1000, timeInSeconds: 300 * 60  },
    '5': { cost: 20000, requiredLevel: 45, capacity: 5000, timeInSeconds: 800 * 60  },
    '10':{ cost: 50000, requiredLevel: 70, capacity: 10000,timeInSeconds: 1500 * 60 }
};
const MAX_WAREHOUSE_LEVEL = 10;
const BASE_CAPACITY = 100; // Sức chứa của kho cấp 1

/**
 * Tìm cấp độ nâng cấp tiếp theo dựa trên cấp độ hiện tại.
 * @param {number} currentLevel - Cấp độ kho hiện tại.
 * @returns {number|null} - Cấp độ tiếp theo có thể nâng, hoặc null nếu đã tối đa.
 */
function getNextUpgradeLevel(currentLevel) {
    // Lấy danh sách các cấp có thể nâng (2, 3, 4, 5, 10), sắp xếp theo thứ tự tăng dần
    const availableLevels = Object.keys(upgradeTiers).map(Number).sort((a, b) => a - b);
    // Tìm cấp độ đầu tiên trong danh sách mà lớn hơn cấp hiện tại
    return availableLevels.find(level => level > currentLevel) || null;
}

/**
 * Lấy sức chứa tối đa dựa vào cấp độ kho.
 * @param {number} level - Cấp độ kho.
 * @returns {number} - Sức chứa tối đa.
 */
window.getMaxCapacity = (level) => {
    if (level === 1) return BASE_CAPACITY;
    // Tìm trong bảng nâng cấp, nếu không có thì trả về sức chứa cơ bản
    const tier = Object.values(upgradeTiers).find(t => t.capacity);
    for (const key in upgradeTiers) {
        if (parseInt(key) === level) {
            return upgradeTiers[key].capacity;
        }
    }
    // Trường hợp đặc biệt nếu level nằm giữa các tier (ví dụ đang ở level 2, chưa nâng lên 3)
    const allTiers = Object.keys(upgradeTiers).map(Number).sort((a,b) => b-a); // Sắp xếp giảm dần
    const relevantTierKey = allTiers.find(tierLevel => level >= tierLevel);
    return relevantTierKey ? upgradeTiers[relevantTierKey].capacity : BASE_CAPACITY;
};

// --- LOGIC MODAL VÀ SỰ KIỆN ---

document.addEventListener('DOMContentLoaded', () => {
    // Lấy các phần tử DOM
    const upgradeIcon = document.getElementById('upgrade-inventory-icon');
    const upgradeModal = document.getElementById('upgrade-inventory-modal');
    const cancelBtn = document.getElementById('cancel-upgrade-btn');
    const confirmBtn = document.getElementById('confirm-upgrade-btn');

    if (upgradeIcon) {
        upgradeIcon.addEventListener('click', showUpgradeModal);
    }
    if (cancelBtn) {
        cancelBtn.addEventListener('click', hideUpgradeModal);
    }
    if (upgradeModal) {
        upgradeModal.addEventListener('click', (e) => {
            if (e.target === upgradeModal) hideUpgradeModal();
        });
    }
    if (confirmBtn) {
        confirmBtn.addEventListener('click', handleUpgrade);
    }

    // Kiểm tra xem có đang nâng cấp dở dang không khi tải lại trang
    checkUpgradeOnLoad();
});


/**
 * Định dạng số giây thành chuỗi giờ, phút, giây dễ đọc.
 * @param {number} totalSeconds - Tổng số giây.
 * @returns {string} - Chuỗi đã định dạng (ví dụ: "1 giờ 30 phút").
 */
function formatUpgradeTime(totalSeconds) {
    if (totalSeconds < 60) return `${totalSeconds} giây`;

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    let result = '';
    if (hours > 0) {
        result += `${hours} giờ `;
    }
    if (minutes > 0) {
        result += `${minutes} phút`;
    }
    return result.trim();
}



function showUpgradeModal() {
    const warehouseLevel = playerData.warehouseLevel || 1;
    const upgradeIcon = document.getElementById('upgrade-inventory-icon');
    const upgradeModal = document.querySelector('.upgrade-inventory-modal');

    // Nếu đã đạt cấp tối đa, ẩn icon nâng cấp và không hiển thị modal
    if (warehouseLevel >= MAX_WAREHOUSE_LEVEL) {
        if (upgradeIcon) upgradeIcon.style.display = 'none';
        console.log("Kho chứa đã đạt cấp độ tối đa.");
        return;
    }

    const nextLevel = getNextUpgradeLevel(warehouseLevel);

    // Nếu không có cấp độ tiếp theo (trường hợp hiếm), cũng ẩn icon
    if (!nextLevel) {
        if (upgradeIcon) upgradeIcon.style.display = 'none';
        return;
    }
    
    // Lấy thông tin cho lần nâng cấp tiếp theo từ bảng dữ liệu
    const nextTierData = upgradeTiers[nextLevel];

    // Cập nhật các phần tử hiển thị thông tin trong modal
    document.getElementById('current-warehouse-level').textContent = warehouseLevel;
    document.getElementById('current-capacity').textContent = window.getMaxCapacity(warehouseLevel);
    document.getElementById('next-warehouse-level').textContent = nextLevel;
    document.getElementById('next-capacity').textContent = nextTierData.capacity;
    
    const playerMoneyEl = document.getElementById('player-money');
    document.getElementById('upgrade-cost').textContent = `${nextTierData.cost.toLocaleString('vi-VN')}$`;
      // Cập nhật thời gian nâng cấp
    const formattedTime = formatUpgradeTime(nextTierData.timeInSeconds);
    document.getElementById('upgrade-time').textContent = formattedTime;
    document.getElementById('required-player-level').textContent = `Cấp ${nextTierData.requiredLevel}`;
    playerMoneyEl.textContent = `${playerData.money.toLocaleString('vi-VN')}$`;

    // Kiểm tra điều kiện và cập nhật nút Nâng Cấp
    const confirmBtn = document.getElementById('confirm-upgrade-btn');
    const canAfford = playerData.money >= nextTierData.cost;
    const levelMet = playerData.level >= nextTierData.requiredLevel;

    playerMoneyEl.classList.toggle('insufficient', !canAfford);
    confirmBtn.disabled = !canAfford || !levelMet;

    upgradeModal.classList.add('visible');
}

function hideUpgradeModal() {
    document.querySelector('.upgrade-inventory-modal').classList.remove('visible');
}

function handleUpgrade() {
    const warehouseLevel = playerData.warehouseLevel || 1;
    const nextLevel = getNextUpgradeLevel(warehouseLevel);

    if (!nextLevel) {
        console.error("Không tìm thấy cấp độ nâng cấp tiếp theo.");
        return;
    }

    const nextTierData = upgradeTiers[nextLevel];
    const cost = nextTierData.cost;
    const timeInSeconds = nextTierData.timeInSeconds;

    // Trừ tiền
    playerData.money -= cost;
    document.getElementById('so-tien-hien-tai').textContent = playerData.money;

    // Thiết lập trạng thái đang nâng cấp, LƯU LẠI CẤP ĐỘ MỤC TIÊU
    playerData.warehouseUpgrade = {
        active: true,
        endTime: Date.now() + timeInSeconds * 1000,
        targetLevel: nextLevel // Quan trọng: lưu lại cấp độ sẽ nâng lên
    };

    console.log(`Bắt đầu nâng cấp kho lên cấp ${nextLevel}. Sẽ hoàn thành vào: ${new Date(playerData.warehouseUpgrade.endTime).toLocaleString()}`);
    hideUpgradeModal();
    startUpgradeTimer(); // Bắt đầu đếm ngược ngay lập tức
}


// --- LOGIC ĐẾM NGƯỢC ---

window.startUpgradeTimer = () => {
    const upgradeData = playerData.warehouseUpgrade;
    if (!upgradeData || !upgradeData.active) return;

    // Ẩn icon nâng cấp, hiện timer
    document.getElementById('upgrade-inventory-icon').style.display = 'none';
    const timerEl = document.getElementById('inventory-upgrade-timer');
    timerEl.classList.add('visible');
    const timerText = document.getElementById('upgrade-timer-text');

    // Dừng interval cũ nếu có
    if (upgradeInterval) clearInterval(upgradeInterval);

    upgradeInterval = setInterval(() => {
        const remainingMs = upgradeData.endTime - Date.now();

        if (remainingMs <= 0) {
            clearInterval(upgradeInterval);
            finishUpgrade();
            return;
        }

        // Chuyển đổi ms sang HH:MM:SS
        const seconds = Math.floor((remainingMs / 1000) % 60);
        const minutes = Math.floor((remainingMs / (1000 * 60)) % 60);
        const hours = Math.floor(remainingMs / (1000 * 60 * 60));
        timerText.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
};

function finishUpgrade() {
    // Lấy cấp độ mục tiêu từ dữ liệu nâng cấp
    const newLevel = playerData.warehouseUpgrade.targetLevel;

    playerData.warehouseLevel = newLevel;
    playerData.warehouseUpgrade = { active: false, endTime: null, targetLevel: null };
     // Cập nhật chỉ số cho thành tựu "Đại gia kho chứa" bằng cách GHI ĐÈ
    if (typeof window.updateAchievementStat === 'function') {
        // Ghi đè giá trị của stat 'warehouseLevel' bằng cấp độ mới
        updateAchievementStat('warehouseLevel', newLevel, true); // true để ghi đè
    }
     // Cập nhật chỉ số cho thành tựu "Bậc Thầy Nâng Cấp"
    if (typeof window.updateAchievementStat === 'function') {
        updateAchievementStat('totalUpgrades', 1);
    }

    // Ẩn timer, hiện lại icon
    const timerEl = document.getElementById('inventory-upgrade-timer');
    const upgradeIcon = document.getElementById('upgrade-inventory-icon');
    
    timerEl.classList.remove('visible');

    // Chỉ hiện lại icon nếu cấp độ mới chưa phải là cấp tối đa
    if (newLevel < MAX_WAREHOUSE_LEVEL) {
        upgradeIcon.style.display = 'block';
    } else {
        upgradeIcon.style.display = 'none';
        console.log("Kho đã được nâng cấp lên cấp tối đa!");
    }

     // alert(`Chúc mừng! Kho chứa của bạn đã được nâng cấp lên Cấp ${playerData.warehouseLevel}.`); // Dòng code cũ
    if (typeof window.showUpgradeSuccessModal === 'function') {
        window.showUpgradeSuccessModal(playerData.warehouseLevel);
    } else {
        // Fallback an toàn nếu hàm không tồn tại
        alert(`Chúc mừng! Kho chứa của bạn đã được nâng cấp lên Cấp ${playerData.warehouseLevel}.`);
    }
    
    // Cập nhật lại hiển thị sức chứa
    if (typeof window.updateInventoryCapacityDisplay === 'function') {
        window.updateInventoryCapacityDisplay();
    }
}

// Hàm này được gọi khi tải trang/đăng nhập
window.checkUpgradeOnLoad = () => {
    if (playerData && playerData.warehouseUpgrade && playerData.warehouseUpgrade.active) {
        window.startUpgradeTimer();
    }
};
/* END OF FILE JS/khodo-nangcap.js */
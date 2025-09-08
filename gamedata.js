/*
    =================================================================
    FILE: gamedata.js
    MÔ TẢ: Quản lý toàn bộ dữ liệu và trạng thái của game.
           File này PHẢI được tải TRƯỚC các file JS khác.
    =================================================================
*/

// Dữ liệu tổng hợp tất cả các vật phẩm có trong game để tra cứu thông tin
let currentFarmView = { mode: 'own', uid: null }; // 'own' hoặc 'friend'
// Biến này sẽ lưu ID của hạt giống người chơi đang "cầm" trên tay.
let currentlyHoldingSeed = null; 
let allGameItems = {};
// Biến toàn cục để lưu trữ tất cả dữ liệu thành tựu
let ACHIEVEMENT_POOL = {};
//let DAILY_REWARDS_DATA = {};
// Hằng số cho việc cải tạo ô đất
const RESTORATION_BASE_COST = 200; // Chi phí cơ bản cho mỗi lần cải tạo
const RESTORATION_BASE_TIME_MIN = 5; // Thời gian cơ bản (phút) cho mỗi lần cải tạo
// Biến này sẽ lưu ID của vật phẩm (như phân bón) người chơi đang "cầm".
let currentlyHoldingItem = null;
const ENERGY_UPGRADE_TIERS = {
    '2': { cost: 5000,  requiredLevel: 15, capacity: 120 },
    '3': { cost: 15000, requiredLevel: 25, capacity: 150 },
    '4': { cost: 40000, requiredLevel: 35, capacity: 200 },
    '5': { cost: 100000,requiredLevel: 50, capacity: 250 }
};
// Biến cờ để kiểm tra xem người chơi đã vào game chính thức hay chưa
let isUserInGame = false;
// Dữ liệu cho các mức cược của Vòng Quay May Mắn
let VONGQUAY_PRIZES = {};



// Tỷ lệ mọc cỏ (phần trăm)
const WEED_SPAWN_CHANCE = {
    mua: 30,       // Tăng mạnh
    bao: 35,       // Tăng mạnh nhất
    nanggat: 5,    // Giảm nhẹ
    tuyetroi: 0,   // Không mọc
    default: 10    // Mức cơ bản cho Nắng nhẹ, Nhiều mây
};
// Bể chứa tất cả các mẫu nhiệm vụ, được phân loại theo cấp độ yêu cầu
const QUEST_POOL = {
    // key là cấp độ TỐI THIỂU để có thể nhận được nhiệm vụ này
    1: [
        { id: 'harvest_any_1', action: 'harvest', description: 'Cất vào kho 3 cây bất kỳ', requiredAmount: 3, rewardText: '+50 XP, +100$', rewards: { xp: 50, money: 100 }, icon: 'Pics/khochua.png' },
        { id: 'sell_any_1', action: 'sell', description: 'Bán trực tiếp 3 cây bất kỳ', requiredAmount: 3, rewardText: '+150$', rewards: { money: 150 }, icon: 'Pics/icon_sell_now.png' },
        { id: 'water_1', action: 'water_plant', description: 'Tưới nước cho 2 ô đất khô', requiredAmount: 2, rewardText: '+20 XP', rewards: { xp: 20 }, icon: 'Pics/icon_giotnuoc.png' },

         { id: 'clean_weed_1', action: 'clean_weed', description: 'Hoàn thành 1 lần dọn cỏ', requiredAmount: 1, rewardText: '+30 XP', rewards: { xp: 30 }, icon: 'Pics/codai.png' },
    ],

     5: [ 
       
        { id: 'level_up_5', action: 'level_up', description: 'Lên 1 cấp độ', requiredAmount: 1, rewardText: '+500$', rewards: { money: 500 }, icon: 'Pics/icon_level.png' },
        { id: 'unlock_plot_5', action: 'unlock_plot', description: 'Mở khóa 1 ô đất mới', requiredAmount: 1, rewardText: '+200 XP', rewards: { xp: 200 }, icon: 'Pics/icon_plot.png' }
      
    ],


    10: [
       { id: 'harvest_hanhla_10', action: 'harvest', description: 'Cất vào kho 10 cây Hành Lá', requiredAmount: 10, rewardText: '+150 XP', rewards: { xp: 150 }, icon: 'Pics/Cuahang/Hatgiong/hanh-la/pic_hatgiong_giaidoan4.png', condition: { type: 'specific_item', value: 'hanh-la' } },
         { id: 'sell_caithia_10', action: 'sell', description: 'Bán trực tiếp 8 cây Cải Thìa', requiredAmount: 8, rewardText: '+100 XP, +500$', rewards: { xp: 100, money: 500 }, icon: 'Pics/Cuahang/Hatgiong/cai-thia/pic_hatgiong_giaidoan4.png', condition: { type: 'specific_item', value: 'cai-thia' } },   { id: 'earn_money_10', action: 'earn_money', description: 'Kiếm được 1.000$', requiredAmount: 1000, rewardText: '+1 Phân bón Tăng trưởng', rewards: { items: {'phan-bon-tang-truong': 1} }, icon: 'Pics/tien.png' },
        { id: 'kill_pest_10', action: 'kill_pest', description: 'Diệt trừ 2 sâu bệnh', requiredAmount: 2, rewardText: '+100 XP', rewards: { xp: 100 }, icon: 'Pics/consau.png' }
    ],
      15: [ 
        
        { id: 'restore_plot_15', action: 'restore_plot', description: 'Cải tạo 1 ô đất bị cháy xém', requiredAmount: 1, rewardText: '+300 XP', rewards: { xp: 300 }, icon: 'Pics/Thoitiet/Bao/odat_bao1.png' }
      
    ],
    25: [
        { id: 'harvest_any_25', action: 'harvest', description: 'Thu hoạch 30 cây bất kỳ', requiredAmount: 30, rewardText: '+500 XP, +2000$', rewards: { xp: 500, money: 2000 }, icon: 'Pics/icon_harvest.png' },
        { id: 'earn_money_25', action: 'earn_money', description: 'Kiếm được 5.000$', requiredAmount: 5000, rewardText: '+1 Phân bón Phục hồi', rewards: { items: {'phan-bon-phuc-hoi': 1} }, icon: 'Pics/tien.png' },
    ]
    // Bạn có thể thêm các bậc cấp độ và nhiệm vụ khác ở đây
};




// Biến cờ để kiểm tra xem người chơi có đang dọn cỏ thủ công hay không
let isManualWeedingInProgress = false;
// Đối tượng quản lý các "suất" dọn cỏ. null nghĩa là rảnh.
// player: suất dọn của người chơi.
// hired: suất dọn của người được thuê.
window.cleaningTaskSlots = {
    player: null, // Sẽ lưu plotNumber khi người chơi bận
   
};
// Lưu timestamp (ms) khi trâu có thể được gọi lại.
let buffaloCooldownEndTime = 0; 
// Biến lưu thời gian client lúc đăng nhập (tính bằng ms)
let initialClientTime = 0; 
// Biến quản lý bộ đếm chống gian lận
window.timeSanityCheckInterval = null; 
let isDataDirty = false; // "Cờ" để kiểm tra xem dữ liệu có thay đổi không

/**
 * Đánh dấu rằng dữ liệu người chơi đã thay đổi và cần được lưu.
 */
window.markDataAsDirty = function() {
    isDataDirty = true;
    // console.log("Data marked as dirty."); // Bạn có thể bỏ comment dòng này để debug
}
/**
 * Lấy thời gian hiện tại ước tính của server, chống gian lận.
 * Hàm này sẽ tính toán thời gian trôi qua trên client kể từ lúc đăng nhập,
 * và cộng vào mốc thời gian server ban đầu.
 * @returns {number} - Timestamp (dưới dạng mili giây) của server được ước tính.
 */
window.getEstimatedServerTime = function() {
    // Thời gian đã trôi qua trên máy client kể từ lúc đăng nhập
    const elapsedTimeOnClient = Date.now() - initialClientTime;
    
    // Thời gian server ước tính = Thời gian server ban đầu + thời gian đã trôi qua
    return initialServerTime + elapsedTimeOnClient;
};



async function loadAllGameItemsFromFirebase() {
    try {
        console.log("Bắt đầu tải dữ liệu vật phẩm từ Firebase...");
        const seedsSnapshot = await db.collection('seeds').get();
        
        seedsSnapshot.forEach(doc => {
            const firebaseSeedData = doc.data();
             // doc.id là ID của tài liệu, còn doc.data() chỉ chứa các trường bên trong.
            firebaseSeedData.id = doc.id;
            // Gán cứng type là 'seed' cho mọi item lấy từ collection 'seeds'
            firebaseSeedData.type = 'seed'; 
             // Tự tạo đường dẫn tới thư mục chứa ảnh các giai đoạn phát triển
            firebaseSeedData.growthStagesPath = `Pics/Cuahang/Hatgiong/${firebaseSeedData.id}/`;
             // Tự động tạo đường dẫn cho ảnh thu hoạch (inventoryImage) dựa trên ID.
            // Đây là bước bị thiếu, khiến ảnh trong kho đồ không hiển thị.
            firebaseSeedData.inventoryImage = `Pics/Cuahang/Hatgiong/${firebaseSeedData.id}/pic_hatgiong_giaidoan4.png`;
             // Đồng bộ hóa thuộc tính thời gian phát triển.
          
            const seedId = firebaseSeedData.id;


            // Kiểm tra xem hạt giống này đã có trong allGameItems local chưa
            if (allGameItems[seedId]) {
                // Nếu có, hợp nhất dữ liệu từ Firebase vào
                // Dữ liệu từ Firebase sẽ ghi đè lên dữ liệu local nếu trùng tên field
                Object.assign(allGameItems[seedId], firebaseSeedData);
            } else {
                // Nếu chưa có, tạo một mục mới (hữu ích cho việc thêm hạt giống mới sau này)
                allGameItems[seedId] = firebaseSeedData;
            }
        });

        console.log("Đã cập nhật allGameItems với dữ liệu từ Firebase:", allGameItems);
    } catch (error) {
        console.error("Lỗi nghiêm trọng khi tải dữ liệu vật phẩm từ Firebase:", error);
        alert("Không thể tải dữ liệu game cần thiết. Vui lòng kiểm tra kết nối mạng và thử lại.");
        // Ném lỗi để dừng quá trình tải game
        throw error;
    }
}
async function loadAllItemsFromFirebase() {
    try {
        console.log("Bắt đầu tải dữ liệu vật phẩm (items) từ Firebase...");
        const itemsSnapshot = await db.collection('items').get();
        
        itemsSnapshot.forEach(doc => {
            const itemData = doc.data();
            const itemId = doc.id;

            // Thêm hoặc cập nhật vật phẩm vào đối tượng allGameItems toàn cục
            // Điều này hợp nhất dữ liệu từ nhiều collection vào một nơi duy nhất
            allGameItems[itemId] = {
                id: itemId, // Đảm bảo ID luôn có
                type: 'item', 
                ...itemData
            };
        });

        console.log("Đã tải xong dữ liệu vật phẩm (items).");

    } catch (error) {
        console.error("Lỗi nghiêm trọng khi tải dữ liệu vật phẩm từ Firebase:", error);
        alert("Không thể tải dữ liệu vật phẩm cần thiết. Vui lòng kiểm tra kết nối mạng.");
        throw error;
    }
}

// Dữ liệu của người chơi, bao gồm cả kho đồ
let playerData = {
	money: 100,
	nickname: "Nông dân",
    friends: [],
    level: 1,
    xp: 0,
     settings: {
        soundEnabled: true,
        weatherEffectsEnabled: true,
        notificationsEnabled: true
    },
    forecastCooldownEnd: 0, // Thời điểm có thể xem dự báo thời tiết lần nữa
    irrigationEnergyLevel: 1, // Cấp độ bể chứa năng lượng

    
     vongquay: {
        lastFreeSpinDate: null // Lưu ngày dạng 'YYYY-MM-DD'
    },
       jacksot: {
            spins: 10, // Số lượt quay ban đầu
            sellProgress: 0, // Đếm tiến trình BÁN TRỰC TIẾP
            storeProgress: 0, // Đếm tiến trình CẤT VÀO KHO
            history: [] // Mảng lưu trữ lịch sử các lần quay
        },

       weather: {
        current: 'nangnhe',      // Thời tiết hiện tại
        upcoming: [],            // Mảng chứa 2 thời tiết sắp tới
        nextChangeTime: null     // Thời điểm thay đổi
    },



      warehouseLevel: 1,
    warehouseUpgrade: {
        active: false, // true nếu đang nâng cấp
        endTime: null  // Thời điểm kết thúc nâng cấp (timestamp)
    },

    stats: {
         totalCropsHarvested: 0,
        totalMoneyEarned: 0,
        plotsUnlocked: 3, // Bắt đầu với 3 ô
        weedsCleaned: 0,
        pestsKilled: 0,
        totalUpgrades: 0,
        totalCropsStored: 0, // Stat mới cho việc cất vào kho
        totalCropsSold: 0,   // Stat mới cho việc bán trực tiếp
         // Mảng để lưu ID các loại nông sản duy nhất đã bán từ kho
        uniqueCropsSoldFromInventory: [], 
        harvestedCrops: 0,
        unlockedPlots: 3,
    },
    inventory: {
        seeds: {},
        harvested: {},
        items: {},
        tools: {}
    },
    // Dữ liệu trạng thái của các ô đất
    farmPlots: {
        // Cấu trúc: 'plotNumber': { seedId: 'hanh-la', plantedAt: timestamp }
        // Ví dụ: '1': { seedId: 'hanh-la', plantedAt: 1658380000000 }
        //Cấu trúc mới: 'plotNumber': { seedId, plantedAt, soilFertility, barrenPenaltyPercent }
        // Mặc định là rỗng
    },
      warehouseLevel: 1, // Cấp độ ban đầu của kho
    warehouseUpgrade: {
        active: false, // Trạng thái có đang nâng cấp hay không
        endTime: null,  // Thời điểm nâng cấp hoàn thành
        targetLevel: null // Cấp độ mục tiêu khi nâng cấp
    }
};

// Hàm toàn cục để cập nhật kho đồ.
function updateInventory(itemId, quantity) {
    const itemInfo = allGameItems[itemId];
    if (!itemInfo) {
        console.error(`Vật phẩm với ID "${itemId}" không tồn tại trong allGameItems.`);
        return;
    }

     // Logic đặc biệt cho Đạo cụ (type: 'tool')
    if (itemInfo.type === 'tool') {
        const toolInventory = playerData.inventory.tools;
        if (toolInventory[itemId]) {
            // Nếu đã sở hữu, cộng dồn số lượng vào thuộc tính 'owned'
            toolInventory[itemId].owned += quantity;
        } else {
             // Đơn giản hóa lại, không cần các thuộc tính pin, hỏng...
            toolInventory[itemId] = {
                owned: quantity
            };
        }
        console.log(`Kho Đạo cụ đã được cập nhật:`, playerData.inventory.tools);
    } else {

    const inventoryCategory = playerData.inventory[itemInfo.type + 's']; // 'seed' -> 'seeds'

    if (inventoryCategory) {
        if (inventoryCategory[itemId]) {
            // Nếu đã có, cộng thêm số lượng
            inventoryCategory[itemId] += quantity;
        } else {
            // Nếu chưa có, thêm mới
            inventoryCategory[itemId] = quantity;
        }
        console.log(`Kho đồ đã được cập nhật:`, playerData.inventory);
    } else {
        console.error(`Loại kho "${itemInfo.type + 's'}" không hợp lệ.`);
    }
    }
}
function getXpForNextLevel(level) {
    // Math.pow(base, exponent) là hàm tính lũy thừa (base^exponent)
    return Math.floor(100 * Math.pow(level, 1.5));
}

/**
 * Kiểm tra và xử lý việc lên cấp cho người chơi.
 */
function checkLevelUp() {
    if (!playerData) return;

    // Lấy lượng EXP cần cho cấp độ hiện tại
    let xpNeeded = getXpForNextLevel(playerData.level);
    
    // Sử dụng vòng lặp 'while' để xử lý trường hợp người chơi lên nhiều cấp cùng lúc
    while (playerData.xp >= xpNeeded) {
        // Trừ đi lượng XP đã dùng để lên cấp
        playerData.xp -= xpNeeded;

        // Tăng cấp độ người chơi
        playerData.level++;
          if (typeof window.updateQuestProgress === 'function') {
            window.updateQuestProgress('level_up', 1);
        }
        
        console.log(`CHÚC MỪNG! Bạn đã lên Cấp ${playerData.level}!`);
        
        // TODO: Hiển thị thông báo hoặc hiệu ứng lên cấp cho người chơi
        openLevelUpModal(playerData.level);

        // Cập nhật lại lượng XP cần cho cấp độ MỚI
        xpNeeded = getXpForNextLevel(playerData.level);
    }
}
function isPlantReady(plotNumber) {
    const plotData = playerData.farmPlots[plotNumber];

    // Nếu không có ô đất hoặc không có cây, thì chắc chắn là chưa sẵn sàng
    if (!plotData || !plotData.seedId) {
        return false;
    }

    const itemInfo = allGameItems[plotData.seedId];
    if (!itemInfo) {
        return false;
    }

    // --- LOGIC ĐÃ ĐƯỢC SỬA LỖI ---
    const penaltyPercent = plotData.barrenPenaltyPercent ?? 0;
    const penaltyMultiplier = 1 + (penaltyPercent / 100);

    // Lấy thông tin về số lần bón phân tăng trưởng đã áp dụng
    const boostsApplied = plotData.effectsApplied?.['phan-bon-tang-truong'] || 0;
    const totalBoostPercent = boostsApplied * 20; // Mỗi lần bón tăng 20%
    const growthBoostMultiplier = 1 - (totalBoostPercent / 100); // Hệ số nhân để giảm thời gian
    // Tạm thời hardcode giá trị là 3 để sửa lỗi ngay lập tức.
    const DRY_SOIL_GROWTH_PENALTY_MULTIPLIER = 3; 
    const drySoilMultiplier = plotData.isStrugglingOnDrySoil ? DRY_SOIL_GROWTH_PENALTY_MULTIPLIER : 1;

    // Áp dụng TẤT CẢ các hiệu ứng vào thời gian phát triển
    const growthDurationMs = itemInfo.growthTimeInSeconds * 1000 * penaltyMultiplier * growthBoostMultiplier * drySoilMultiplier;

   
    
    // Lấy thời gian đã trồng (đã được xử lý tương thích)
    let plantedAtMillis;
    const plantedAtValue = plotData.plantedAt;
    if (typeof plantedAtValue === 'number') {
        plantedAtMillis = plantedAtValue;
    } else if (plantedAtValue.toDate) {
        plantedAtMillis = plantedAtValue.toMillis();
    } else if (plantedAtValue instanceof Date) {
        plantedAtMillis = plantedAtValue.getTime();
    } else {
        return false; // Không xác định được thời gian, coi như chưa chín
    }
    
    // Sử dụng thời gian server đã được hiệu chỉnh để chống gian lận.
    const nowMillis = getEstimatedServerTime();
    
    const timeSincePlantedMs = nowMillis - plantedAtMillis;

    // Trả về kết quả so sánh
    return timeSincePlantedMs >= growthDurationMs;
}

function getMaxEnergyCapacity(level) {
    if (!level || level === 1) return 100;
    const tier = ENERGY_UPGRADE_TIERS[level];
    // Nếu không tìm thấy cấp độ chính xác, tìm cấp độ gần nhất thấp hơn
    if (!tier) {
        const allTiers = Object.keys(ENERGY_UPGRADE_TIERS).map(Number).sort((a,b) => b-a);
        const relevantTierKey = allTiers.find(tierLevel => level >= tierLevel);
        return relevantTierKey ? ENERGY_UPGRADE_TIERS[relevantTierKey].capacity : 100;
    }
    return tier.capacity;
};

function resetGameToInitialState() {
    console.log("Reseting game state to initial...");

    // 1. Dọn dẹp các bộ đếm thời gian đang chạy
    if (window.mainGameLoop) clearInterval(window.mainGameLoop);
    if (window.weatherInterval) clearInterval(window.weatherInterval);
    if (window.upgradeInterval) clearInterval(window.upgradeInterval);
    if (window.monthModalWeatherInterval) clearInterval(window.monthModalWeatherInterval);
   

     // Dừng hệ thống sâu bệnh
    if (typeof window.stopPestSystem === 'function') {
        window.stopPestSystem();
    }
    
     // Dọn dẹp bộ đếm thời gian tăng độ phì nhiêu khi trời mưa
    if (window.rainFertilityInterval) clearInterval(window.rainFertilityInterval);
    if (window.lightningInterval) clearTimeout(window.lightningInterval);
    // 2. Reset dữ liệu người chơi về mặc định
    playerData = {
        money: 100,
        nickname: "Nông dân",
        level: 1,
        xp: 0,
         dailyLogin: {
        streak: 0, // Số ngày điểm danh liên tiếp
        lastClaimDate: null // Ngày nhận thưởng gần nhất (YYYY-MM-DD)
    },
       



         weather: {
        current: 'nangnhe',      // Thời tiết hiện tại
        upcoming: [],            // Mảng chứa 2 thời tiết sắp tới
        nextChangeTime: null     // Thời điểm thay đổi
    },
        warehouseLevel: 1,
        warehouseUpgrade: {
            active: false,
            endTime: null
        },
        stats: {
            harvestedCrops: 0,
            unlockedPlots: 3,
        },
        inventory: {
            seeds: {},
            harvested: {},
            items: {},
            tools: {}
        },
        farmPlots: {}
    };
    currentlyHoldingSeed = null;
    currentlyHoldingItem = null;

    // 3. Reset giao diện (UI)
    const gameContainer = document.getElementById('game-container');
    const loginModal = document.getElementById('login-modal');

    // Ẩn game và hiển thị modal đăng nhập
    if (gameContainer) gameContainer.style.display = 'none';
    if (loginModal) loginModal.classList.add('visible');

    // Đặt lại các giá trị hiển thị
    document.getElementById('so-tien-hien-tai').textContent = playerData.money;

    // Thay vì xóa trắng, chúng ta sẽ kiểm tra localStorage và điền lại nếu có.
    const savedEmail = localStorage.getItem('savedEmail');
    if (savedEmail) {
        // Nếu có email đã lưu, điền lại thông tin
        document.getElementById('username').value = savedEmail;
        document.getElementById('password').value = localStorage.getItem('savedPassword') || '';
        // Bonus: Tự động tick lại vào ô "Ghi nhớ" cho đúng
        const rememberMeCheckbox = document.getElementById('remember-me');
        if(rememberMeCheckbox) rememberMeCheckbox.checked = true;

    } else {
        // Nếu không có, thì mới xóa trắng
        document.getElementById('username').value = ''; 
        document.getElementById('password').value = '';
    }
    document.getElementById('login-error').textContent = '';

    // Vẽ lại layout ô đất mặc định
    if (typeof initializeFarmLayout === 'function') {
        initializeFarmLayout();
    }
    
    // Đặt lại nút menu về trạng thái "Đăng nhập"
    const authMenuItem = document.getElementById('auth-menu-item');
    if (authMenuItem) {
        const authIcon = authMenuItem.querySelector('img');
        const authText = authMenuItem.querySelector('span');
        authIcon.src = 'Pics/dangnhap.png';
        authIcon.alt = 'Đăng nhập';
        authText.textContent = 'Đăng nhập';
        // (Sự kiện click cho nút này đã được xử lý trong modal-dangnhap.js)
    }

    // Ẩn các popup có thể đang mở
    if (typeof hideHoldingSeedPopup === 'function') {
        hideHoldingSeedPopup();
    }
    
    console.log("Game state has been reset.");
}
async function loadVongQuayDataFromFirebase() {
    try {
        console.log("Bắt đầu tải dữ liệu Vòng Quay từ Firebase...");
        const snapshot = await db.collection('vongquay_settings').get();
        
        const loadedPrizes = {};
        snapshot.forEach(doc => {
            // doc.id sẽ là 'thuong', 'lon', 'vip'
            loadedPrizes[doc.id] = doc.data();
        });

        // Gán dữ liệu đã tải vào biến toàn cục
        VONGQUAY_PRIZES = loadedPrizes;
        console.log("Đã tải thành công dữ liệu Vòng Quay:", VONGQUAY_PRIZES);

    } catch (error) {
        console.error("Lỗi nghiêm trọng khi tải dữ liệu Vòng Quay:", error);
        alert("Không thể tải dữ liệu Vòng Quay May Mắn. Vui lòng kiểm tra kết nối mạng.");
        throw error; // Ném lỗi để dừng quá trình tải game
    }
}
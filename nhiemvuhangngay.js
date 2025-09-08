/* START OF FILE JS/nhiemvuhangngay.js */

document.addEventListener('DOMContentLoaded', () => {
    let resetTimerInterval = null;

    // --- KHỞI TẠO CÁC PHẦN TỬ GIAO DIỆN (CHỈ CHẠY 1 LẦN) ---
    function initializeQuestUI() {
        if (document.getElementById('daily-quest-icon-container')) return;

        const iconContainer = document.createElement('div');
        iconContainer.id = 'daily-quest-icon-container';
        iconContainer.innerHTML = `
            <img src="Pics/nhiemvuhangngay.png" alt="Nhiệm vụ" id="daily-quest-icon">
            <div id="quest-notification-dot"></div>
        `;
        // Gắn icon vào khung UI chung ở góc trái
        const parentContainer = document.getElementById('top-left-ui-container');
        if (parentContainer) {
            parentContainer.appendChild(iconContainer);
        } else {
            // Fallback an toàn nếu không tìm thấy khung, dù trường hợp này hiếm
            console.error("Không tìm thấy #top-left-ui-container để thêm icon nhiệm vụ.");
            document.body.appendChild(iconContainer);
        }
        iconContainer.addEventListener('click', showQuestModal);

        const modalHTML = `
            <div id="quest-modal" class="quest-modal">
                <div class="quest-modal-content">
                    <img src="Pics/nut-dong.png" alt="Đóng" class="quest-modal-close" style="position: absolute; top: 15px; right: 15px; width: 30px; cursor: pointer;">
                    <div class="quest-modal-header">
                        <h2>Sổ Tay Nông Dân</h2>
                    </div>
                    
                    <div class="quest-tabs">
                        <button class="quest-tab-button active" data-tab="daily-quests-tab">
                            <img src="Pics/nhiemvuhangngay.png" alt="Nhiệm vụ">
                            <span>Nhiệm vụ</span>
                        </button>
                        <button class="quest-tab-button" data-tab="achievements-tab">
                            <img src="Pics/icon_thanhtuu.png" alt="Thành tựu">
                            <span>Thành tựu</span>
                        </button>
                    </div>

                    <div class="quest-tab-content-container">
                        <div id="daily-quests-tab" class="quest-tab-content active">
                            <p id="quest-reset-timer" style="text-align: center; font-size: 0.9em; color: #666; margin-top: 0;">Nhiệm vụ mới sau: 00:00:00</p>
                            <ul id="quest-list" class="quest-list"></ul>
                        </div>
                        <div id="achievements-tab" class="quest-tab-content">
                            <div class="achievements-total-progress">
                                <p>Tiến trình Tổng:</p>
                                <div class="total-progress-bar-container">
                                    <div id="total-achievements-progress-bar"></div>
                                    <span id="total-achievements-progress-text">0 / 0</span>
                                </div>
                            </div>
                          
                            <div id="achievement-list" class="achievement-list"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Gán tất cả sự kiện cho modal ngay sau khi tạo
        addEventListenersToQuestModal();
    }

    // --- HÀM GÁN SỰ KIỆN TỔNG THỂ ---
    function addEventListenersToQuestModal() {
        const modal = document.getElementById('quest-modal');
        if (!modal) return;
        const achievementList = document.getElementById('achievement-list');
        // Sự kiện nút đóng và nền
        modal.querySelector('.quest-modal-close').addEventListener('click', hideQuestModal);
        modal.addEventListener('click', (e) => { if (e.target === modal) hideQuestModal(); });
        
        // Sự kiện chuyển tab
        const tabButtons = modal.querySelectorAll('.quest-tab-button');
        const tabContents = modal.querySelectorAll('.quest-tab-content');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTabId = button.dataset.tab;
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                tabContents.forEach(content => content.classList.toggle('active', content.id === targetTabId));

                if (targetTabId === 'achievements-tab' && typeof window.renderAchievements === 'function') {
                    window.renderAchievements();
                }
            });
        });
        
        // Sự kiện nhận thưởng Nhiệm vụ
        document.getElementById('quest-list').addEventListener('click', (event) => {
            if (event.target.classList.contains('quest-claim-button') && !event.target.disabled) {
                const questId = event.target.dataset.questId;
                claimQuestReward(questId);
            }
        });

       
        
        if (achievementList) {
            achievementList.addEventListener('click', (event) => {
                 if (event.target.classList.contains('achievement-claim-button') && !event.target.disabled) {
                    const achievementId = event.target.closest('.achievement-item').dataset.id;
                    if(typeof claimAchievementReward === 'function') claimAchievementReward(achievementId);
                }
            });
        }
    }

    // --- CÁC HÀM ĐIỀU KHIỂN MODAL ---
    function showQuestModal() {
        const modal = document.getElementById('quest-modal');
        if (modal) {
            // Tải dữ liệu trước, sau đó mới render UI
            loadDataAndRenderUI();
        }
    }

    async function loadDataAndRenderUI() {
        if (typeof window.loadAchievementsFromFirebase === 'function') {
            await window.loadAchievementsFromFirebase();
        }
        
        const modal = document.getElementById('quest-modal');
        updateQuestDisplay();
        startResetTimer();
        
        const achievementsTabButton = modal.querySelector('.quest-tab-button[data-tab="achievements-tab"]');
        if (achievementsTabButton && achievementsTabButton.classList.contains('active')) {
            if (typeof window.renderAchievements === 'function') {
                window.renderAchievements();
            }
        }
        modal.classList.add('visible');
    }

    function hideQuestModal() {
        const modal = document.getElementById('quest-modal');
        if (modal) modal.classList.remove('visible');
        if (resetTimerInterval) clearInterval(resetTimerInterval);
    }
    
    // --- Các hàm logic (updateQuestDisplay, updateQuestProgress, etc.) giữ nguyên như cũ ---
    // (Dán toàn bộ các hàm này từ phiên bản trước của bạn vào đây)

    function updateQuestDisplay() {
        const questList = document.getElementById('quest-list');
        const notificationDot = document.getElementById('quest-notification-dot');
        if (!questList || !notificationDot) return;

        const dailyQuests = playerData.dailyQuests || [];
        let hasUnclaimedQuest = false;
        
        if (dailyQuests.length === 0) {
            questList.innerHTML = '<li>Hãy quay lại vào ngày mai để nhận nhiệm vụ mới nhé!</li>';
        } else {
            questList.innerHTML = '';
            dailyQuests.forEach(quest => {
                const progress = Math.min(100, (quest.currentProgress / quest.requiredAmount) * 100);
                const isCompleted = quest.currentProgress >= quest.requiredAmount;
                const isClaimed = quest.claimed;
                
                if (isCompleted && !isClaimed) {
                    hasUnclaimedQuest = true;
                }

                const li = document.createElement('li');
                li.className = 'quest-item';
                li.innerHTML = `
                    <img src="${quest.icon}" alt="Icon nhiệm vụ" class="quest-item-icon">
                    <div class="quest-item-details">
                        <p class="quest-item-description">${quest.description}</p>
                        <div class="quest-progress-container">
                            <div class="quest-progress-bar" style="width: ${progress}%">
                                <span class="quest-progress-text">${quest.currentProgress} / ${quest.requiredAmount}</span>
                            </div>
                        </div>
                        <div class="quest-rewards">Phần thưởng: <strong>${quest.rewardText}</strong></div>
                    </div>
                    <button class="quest-claim-button" data-quest-id="${quest.id}" ${(!isCompleted || isClaimed) ? 'disabled' : ''}>
                        ${isClaimed ? 'Đã nhận' : 'Nhận'}
                    </button>
                `;
                questList.appendChild(li);
            });
        }
        
        const hasUnclaimedAchievement = playerData.achievements && Object.keys(ACHIEVEMENT_POOL).some(id => {
            const ach = ACHIEVEMENT_POOL[id];
            if (!ach) return false;
             // KIỂM TRA ĐIỀU KIỆN TIÊN QUYẾT
            // Nếu thành tựu này có yêu cầu một thành tựu khác phải hoàn thành trước
            if (ach.preRequisite) {
                const preReqData = playerData.achievements[ach.preRequisite];
                // Nếu dữ liệu của thành tựu tiên quyết không tồn tại hoặc chưa được nhận thưởng,
                // thì không tính thành tựu này là "có thể nhận thưởng"
                if (!preReqData || !preReqData.claimed) {
                    return false;
                }
            }




            const stat = playerData.stats[ach.trackingStat] || 0;
            const progressData = playerData.achievements[id] || { claimed: false };
            return stat >= ach.requiredAmount && !progressData.claimed;
        });

        notificationDot.style.display = (hasUnclaimedQuest || hasUnclaimedAchievement) ? 'block' : 'none';
    }
    
    window.updateQuestProgress = function(actionType, value, details = {}) {
        if (!playerData.dailyQuests || playerData.dailyQuests.length === 0) return;
        let questUpdated = false;
        playerData.dailyQuests.forEach(quest => {
            if (quest.action === actionType && !quest.claimed) {
                let conditionMet = true;
                if (quest.condition && details.itemId) {
                    if (quest.condition.type === 'specific_item' && details.itemId !== quest.condition.value) {
                        conditionMet = false;
                    }
                }
                if (conditionMet) {
                    quest.currentProgress = Math.min(quest.requiredAmount, quest.currentProgress + value);
                    questUpdated = true;
                }
            }
        });
        if (questUpdated) {
            console.log(`Tiến trình nhiệm vụ '${actionType}' đã được cập nhật.`);
            updateQuestDisplay();
        }
    }

    function claimQuestReward(questId) {
        const quest = playerData.dailyQuests.find(q => q.id === questId);
        if (!quest || quest.claimed) return;
        quest.claimed = true;
        
        if (quest.rewards.xp) { playerData.xp += quest.rewards.xp; checkLevelUp(); }
        if (quest.rewards.money) { playerData.money += quest.rewards.money; document.getElementById('so-tien-hien-tai').textContent = playerData.money; }
        if (quest.rewards.items) {
            for (const itemId in quest.rewards.items) {
                updateInventory(itemId, quest.rewards.items[itemId]);
            }
              // Cập nhật lại giao diện kho đồ nếu đang mở
            const inventoryModal = document.getElementById('inventory-modal');
            if (inventoryModal && inventoryModal.style.display === 'block') {
                if (typeof window.renderInventory === 'function') {
                    window.renderInventory();
                }
            }
        }
        

        showGeneralNotification(`Bạn đã nhận được: ${quest.rewardText}!`, 'success');
        updateQuestDisplay();
    }
    
    function startResetTimer() {
        if (resetTimerInterval) clearInterval(resetTimerInterval);
        const timerEl = document.getElementById('quest-reset-timer');
        if (!timerEl) return;
        resetTimerInterval = setInterval(() => {
            const now = new Date();
            const endOfDay = new Date(now);
            endOfDay.setHours(24, 0, 0, 0);
            const remainingMs = endOfDay - now;
            const hours = Math.floor((remainingMs / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((remainingMs / 1000 / 60) % 60);
            const seconds = Math.floor((remainingMs / 1000) % 60);
            timerEl.textContent = `Nhiệm vụ mới sau: ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }, 1000);
    }

    initializeQuestUI();
});
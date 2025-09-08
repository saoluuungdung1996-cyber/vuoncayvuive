/* START OF FILE JS/diemdanhhangngay.js */
function getCurrentWeekString() {
    const now = new Date();
    // Tạo một bản sao của ngày để không thay đổi ngày gốc
    const date = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    // Đặt ngày về thứ Năm của tuần đó để tính toán ổn định
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
    // Ngày đầu tiên của năm
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    // Tính số tuần
    const weekNo = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
    return `${date.getUTCFullYear()}-${String(weekNo).padStart(2, '0')}`;
}
document.addEventListener('DOMContentLoaded', () => {
    // --- DỮ LIỆU PHẦN THƯỞNG (CÓ THỂ DỄ DÀNG THAY ĐỔI) ---
    const DAILY_REWARDS_DATA = {
        // Key là số ngày (streak)
        1: { text: "500$", icon: "Pics/tien.png", rewards: { money: 500 } },
        2: { text: "+100 XP", icon: "Pics/icon_star.png", rewards: { xp: 100 } },
        3: { text: "5x Cải thìa", icon: "Pics/Cuahang/Hatgiong/cai-thia/pic_hatgiong_giaidoan4.png", rewards: { seeds: { 'cai-thia': 5 } } },
        4: { text: "1,500$", icon: "Pics/tien.png", rewards: { money: 1500 } },
        5: { text: "1x P.B Tăng trưởng", icon: "Pics/Cuahang/Phanbon/phanbontangtruong.png", rewards: { items: { 'phan-bon-tang-truong': 1 } } },
        6: { text: "+500 XP", icon: "Pics/icon_star.png", rewards: { xp: 500 } },
        7: { text: "5,000$ & 1x Nông dân", icon: "Pics/Cuahang/Vatpham/nongdandonco.png", rewards: { money: 5000, items: { 'nong-dan-don-co': 1 } } }
    };

    let resetTimerInterval = null;

    // --- CÁC HÀM ĐIỀU KHIỂN GIAO DIỆN ---
    function showDailyLoginModal() {
        renderDailyLoginModal(); // Luôn render lại khi mở
        const modal = document.getElementById('daily-login-modal');
        if (modal) modal.classList.add('visible');
    }

    function hideDailyLoginModal() {
        const modal = document.getElementById('daily-login-modal');
        if (modal) modal.classList.remove('visible');
        if (resetTimerInterval) clearInterval(resetTimerInterval);
    }

    // --- HÀM RENDER GIAO DIỆN MODAL ---
    function renderDailyLoginModal() {
        const grid = document.getElementById('daily-login-grid');
        if (!grid) return;
        grid.innerHTML = '';

        const loginData = playerData.dailyLogin || { streak: 0, lastClaimDate: null };
        const todayString = formatDate(new Date(getEstimatedServerTime()));
        const canClaimToday = loginData.lastClaimDate !== todayString;

        for (let i = 1; i <= 7; i++) {
            const reward = DAILY_REWARDS_DATA[i];
            const card = document.createElement('div');
            card.className = 'reward-day-card';

            let status = 'upcoming'; // Mặc định
            if (i < loginData.streak) {
                status = 'claimed';
            } else if (i === loginData.streak && canClaimToday) {
                status = 'claimable';
            } else if (i === loginData.streak && !canClaimToday) {
                status = 'claimed';
            }
            card.classList.add(status);

            card.innerHTML = `
                <div class="day-number">Ngày ${i}</div>
                <img src="${reward.icon}" alt="Phần thưởng" class="reward-image">
                <div class="reward-text">${reward.text}</div>
            `;

            if (status === 'claimable') {
                const button = document.createElement('button');
                button.className = 'claim-reward-btn';
                button.textContent = 'Nhận';
                button.dataset.day = i;
                button.addEventListener('click', () => claimDailyLoginReward(i));
                card.appendChild(button);
            }
            grid.appendChild(card);
        }
        startResetTimer();
    }

    // --- HÀM LOGIC CHÍNH ---
     window.checkDailyLoginStatus = function() {
        const now = new Date(getEstimatedServerTime());
        const todayString = formatDate(now);
        const yesterdayString = formatDate(new Date(now.getTime() - 24 * 60 * 60 * 1000));

        // Khởi tạo các đối tượng dữ liệu nếu chưa có
        if (!playerData.dailyLogin) {
            playerData.dailyLogin = { streak: 0, lastClaimDate: null };
        }
        if (!playerData.weeklyLoginStats) {
            playerData.weeklyLoginStats = { maxStreak: 0, lastUpdatedWeek: '' };
        }

        const loginData = playerData.dailyLogin;
        
        // Cập nhật chuỗi đăng nhập hiện tại (logic cũ)
        if (loginData.lastClaimDate !== todayString && loginData.lastClaimDate !== yesterdayString) {
            loginData.streak = 1;
        } else if (loginData.lastClaimDate === yesterdayString) {
            loginData.streak++;
            if (loginData.streak > 7) {
                // Giữ streak ở mức 7 để tính cho BXH tuần
                loginData.streak = 7; 
            }
        }

        // --- Logic mới: Cập nhật chuỗi dài nhất trong tuần ---
        const currentWeek = getCurrentWeekString();
        if (playerData.weeklyLoginStats.lastUpdatedWeek !== currentWeek) {
            // Nếu là tuần mới, reset chuỗi dài nhất của tuần
            playerData.weeklyLoginStats.maxStreak = loginData.streak;
            playerData.weeklyLoginStats.lastUpdatedWeek = currentWeek;
        } else {
            // Nếu vẫn trong tuần, cập nhật nếu chuỗi hiện tại dài hơn
            if (loginData.streak > playerData.weeklyLoginStats.maxStreak) {
                playerData.weeklyLoginStats.maxStreak = loginData.streak;
            }
        }
        
        console.log(`Chuỗi đăng nhập hiện tại: ${loginData.streak}, Chuỗi dài nhất tuần này: ${playerData.weeklyLoginStats.maxStreak}`);

        // Cập nhật chấm đỏ thông báo (logic cũ)
        const notificationDot = document.getElementById('daily-login-notification-dot');
        if (notificationDot) {
            notificationDot.style.display = (loginData.lastClaimDate !== todayString) ? 'block' : 'none';
        }
    }

    function claimDailyLoginReward(day) {
        const todayString = formatDate(new Date(getEstimatedServerTime()));
        const loginData = playerData.dailyLogin;
        
        if (loginData.lastClaimDate === todayString || day !== loginData.streak) {
            showGeneralNotification("Bạn không thể nhận phần thưởng này!", 'warning');
            return;
        }

        const rewardData = DAILY_REWARDS_DATA[day].rewards;
        let rewardMessages = [];
        
        // Cộng phần thưởng
        if (rewardData.money) {
            playerData.money += rewardData.money;
            document.getElementById('so-tien-hien-tai').textContent = playerData.money;
            rewardMessages.push(`${rewardData.money.toLocaleString('vi-VN')}$`);
        }
        if (rewardData.xp) {
            playerData.xp += rewardData.xp;
            checkLevelUp();
            rewardMessages.push(`${rewardData.xp} XP`);
        }
        if (rewardData.items) {
            for (const itemId in rewardData.items) {
                updateInventory(itemId, rewardData.items[itemId]);
                rewardMessages.push(`${rewardData.items[itemId]}x ${allGameItems[itemId].name}`);
            }
        }
        if (rewardData.seeds) {
            for (const seedId in rewardData.seeds) {
                updateInventory(seedId, rewardData.seeds[seedId]);
                rewardMessages.push(`${rewardData.seeds[seedId]}x ${allGameItems[seedId].name}`);
            }
        }

        // Cập nhật trạng thái
        loginData.lastClaimDate = todayString;
         if (typeof window.updateAchievementStat === 'function') {
            // Ghi đè giá trị của stat 'loginStreak' bằng chuỗi điểm danh hiện tại
            updateAchievementStat('loginStreak', loginData.streak, true); // true để ghi đè
        }
        showGeneralNotification(`Bạn đã nhận: ${rewardMessages.join(', ')}!`, 'success');
        
        // Cập nhật lại giao diện
        renderDailyLoginModal();
        const notificationDot = document.getElementById('daily-login-notification-dot');
        if (notificationDot) notificationDot.style.display = 'none';
        markDataAsDirty(); // Đánh dấu dữ liệu đã thay đổi
    }

    // --- HÀM TIỆN ÍCH & SỰ KIỆN ---
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function startResetTimer() {
        if (resetTimerInterval) clearInterval(resetTimerInterval);
        const timerEl = document.getElementById('daily-login-reset-timer');
        if (!timerEl) return;
        resetTimerInterval = setInterval(() => {
            const now = new Date();
            const endOfDay = new Date(now);
            endOfDay.setHours(24, 0, 0, 0);
            const remainingMs = endOfDay - now;
            const hours = Math.floor(remainingMs / 3.6e6);
            const minutes = Math.floor((remainingMs % 3.6e6) / 6e4);
            const seconds = Math.floor((remainingMs % 6e4) / 1000);
            timerEl.textContent = `Làm mới sau: ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }, 1000);
    }
    
    // Gán sự kiện click cho icon
    document.addEventListener('click', (e) => {
        const icon = e.target.closest('#daily-login-icon-container');
        if (icon) {
            showDailyLoginModal();
        }
    });

    // Gán sự kiện cho nút đóng modal (dùng event delegation)
    document.addEventListener('click', (e) => {
        if (e.target.matches('.daily-login-close-btn') || e.target.matches('#daily-login-modal')) {
            hideDailyLoginModal();
        }
    });
});

/* END OF FILE JS/diemdanhhangngay.js */
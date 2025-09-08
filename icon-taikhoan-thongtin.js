// =================================================================
// FILE: icon-taikhoan-thongtin.js
// MÔ TẢ: Xử lý hiển thị và tương tác với modal thông tin tài khoản.
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    // --- LẤY CÁC PHẦN TỬ DOM ---
    const accountIcon = document.getElementById('account-icon-container');
    let accountModal = null; // Sẽ được tạo và thêm vào body sau
    let overlay = null;

    // --- HÀM TẠO MODAL (CHỈ CHẠY 1 LẦN) ---
    function createAccountModal() {
        // Nếu modal đã tồn tại, không làm gì cả
        if (document.getElementById('account-modal')) {
            return;
        }

        // Tạo lớp phủ nền
        overlay = document.createElement('div');
        overlay.className = 'account-modal-overlay';
        
        // Tạo container chính của modal
        accountModal = document.createElement('div');
        accountModal.id = 'account-modal';
        accountModal.className = 'account-modal';
        
        // Tạo nội dung HTML cho modal
        accountModal.innerHTML = `
    <div class="account-modal-content">
        <img src="Pics/nut-dong.png" alt="Đóng" class="account-modal-close">
        
        <div class="account-header">
            <img id="modal-account-avatar" src="Pics/icon-taikhoan-default.png" alt="Avatar" class="account-avatar">
            <div class="account-nickname-wrapper">
                <span id="modal-account-nickname" class="account-nickname">Nông dân</span>
                <button id="rename-btn" class="rename-button">✎</button>
            </div>
            <div id="modal-account-uid" class="account-uid">UID: Chưa đăng nhập</div>
        </div>

        <!-- Thông tin tiến trình -->
        <div class="account-progress">
            <div class="progress-level">Cấp độ: <span id="modal-account-level">1</span></div>
            <div class="xp-bar-container">
                <div id="modal-account-xp-bar" class="xp-bar"></div>
            </div>
            <div id="modal-account-xp-text" class="xp-text">0 / 100 XP</div>
        </div>

        <!-- Thống kê -->
        <div class="account-stats">
            <div class="stats-item">
                <span><img src="Pics/icon_harvest.png" alt="Thu hoạch"> Đã thu hoạch:</span>
                <span id="modal-stats-harvested">0</span>
            </div>
            <div class="stats-item">
                <span><img src="Pics/icon_plot.png" alt="Ô đất"> Ô đất sở hữu:</span>
                <span id="modal-stats-plots">3 / 20</span>
            </div>
			 <div class="stats-item">
                <span><img src="Pics/icon_calendar.png" alt="Lịch"> Tham gia từ:</span>
                <span id="modal-account-joindate">...</span>
            </div>
        </div>

        <div class="account-footer">
            <button id="account-settings-btn" class="account-button settings">Cài đặt</button>
            <button id="account-friends-btn" class="account-button friends">Bạn bè</button>
            <button id="account-logout-btn" class="account-button logout">Đăng xuất</button>
        </div>
    </div>
`;

        // Thêm modal và lớp phủ vào cuối thẻ body
        document.body.appendChild(overlay);
        document.body.appendChild(accountModal);

        // Gán sự kiện cho các nút vừa tạo
        addEventListenersToModal();
    }

    // --- HÀM GÁN SỰ KIỆN CHO CÁC PHẦN TỬ TRONG MODAL ---
    function addEventListenersToModal() {
        const closeButton = accountModal.querySelector('.account-modal-close');
        const logoutButton = document.getElementById('account-logout-btn');
		const renameButton = document.getElementById('rename-btn');
    const settingsButton = document.getElementById('account-settings-btn');
         const friendsButton = document.getElementById('account-friends-btn');

        closeButton.addEventListener('click', hideAccountModal);
        overlay.addEventListener('click', hideAccountModal);

        logoutButton.addEventListener('click', () => {
            hideAccountModal(); // Ẩn modal thông tin trước
            // Gọi hàm hiển thị modal xác nhận đăng xuất đã có từ trước
            if (typeof showLogoutConfirmModal === 'function') {
                // Đợi một chút để hiệu ứng ẩn modal kết thúc
                setTimeout(showLogoutConfirmModal, 300); 
            }
        });
		 renameButton.addEventListener('click', () => {
        // Chỉ cần gọi trực tiếp hàm mở modal đổi tên
        if (typeof window.showRenameModal === 'function') {
            window.showRenameModal();
        }
    });

    settingsButton.addEventListener('click', () => {
       // Bỏ dòng hideAccountModal() và setTimeout
        if (typeof window.showSettingsModal === 'function') {
            window.showSettingsModal();
        }
    });
	  friendsButton.addEventListener('click', () => {
        if (typeof window.showFriendsModal === 'function') {
            window.showFriendsModal();
        }
    });
		
    }

    // --- HÀM MỞ/ĐÓNG MODAL ---
     function showAccountModal() {
        if (!accountModal) return; // An toàn nếu modal chưa được tạo

        // Lấy thông tin người dùng hiện tại từ Firebase Auth
        const user = auth.currentUser;

        // Lấy các phần tử DOM một lần để tái sử dụng
        const nicknameEl = document.getElementById('modal-account-nickname');
        const uidEl = document.getElementById('modal-account-uid');
        const levelEl = document.getElementById('modal-account-level');
        const xpBarEl = document.getElementById('modal-account-xp-bar');
        const xpTextEl = document.getElementById('modal-account-xp-text');
        const harvestedEl = document.getElementById('modal-stats-harvested');
        const plotsEl = document.getElementById('modal-stats-plots');
        const joinDateEl = document.getElementById('modal-account-joindate');
        const avatarEl = document.getElementById('modal-account-avatar');
        const renameBtn = document.getElementById('rename-btn');
        const logoutBtn = document.getElementById('account-logout-btn');
        const settingsBtn = document.getElementById('account-settings-btn');
        const friendsBtn = document.getElementById('account-friends-btn');

        if (user) {
            // ========================
            // TRƯỜNG HỢP ĐÃ ĐĂNG NHẬP
            // ========================
            
            // Đảm bảo playerData và các thuộc tính con tồn tại để tránh lỗi
            // Đây là bước kiểm tra an toàn quan trọng
            const safePlayerData = {
                nickname: playerData.nickname || "Nông dân",
                level: playerData.level || 1,
                xp: playerData.xp || 0,
                stats: playerData.stats || { harvestedCrops: 0, unlockedPlots: 3 },
            };

            const creationTime = new Date(user.metadata.creationTime);
            const joinDate = creationTime.toLocaleDateString('vi-VN');

            const xpForNextLevel = getXpForNextLevel(safePlayerData.level);
            const xpPercentage = (safePlayerData.xp / xpForNextLevel) * 100;

            // Cập nhật giao diện
            nicknameEl.textContent = safePlayerData.nickname;
            uidEl.textContent = `UID: ${user.uid.substring(0, 12)}...`;
            levelEl.textContent = safePlayerData.level;
            xpBarEl.style.width = `${xpPercentage}%`;
            xpTextEl.textContent = `${safePlayerData.xp} / ${xpForNextLevel} XP`;
            harvestedEl.textContent = safePlayerData.stats.harvestedCrops;
            plotsEl.textContent = `${safePlayerData.stats.unlockedPlots} / 20`;
            joinDateEl.textContent = joinDate;
            avatarEl.src = user.photoURL || 'Pics/icon-taikhoan-default.png';

            // Hiển thị các nút dành cho người dùng đã đăng nhập
            renameBtn.style.display = 'inline-block';
            logoutBtn.style.display = 'inline-block';
            settingsBtn.style.display = 'inline-block'; // Hiển thị cả nút cài đặt
             friendsBtn.style.display = 'inline-block';

        } else {
            // ========================
            // TRƯỜNG HỢP CHƯA ĐĂNG NHẬP
            // ========================
            
            // Cập nhật giao diện với thông tin cho khách
            nicknameEl.textContent = "Khách";
            uidEl.textContent = "Vui lòng đăng nhập";
            levelEl.textContent = "1";
            xpBarEl.style.width = '0%';
            xpTextEl.textContent = `0 / ${getXpForNextLevel(1)} XP`;
            
            harvestedEl.textContent = "0";
            plotsEl.textContent = '0 / 20';
            joinDateEl.textContent = "N/A";
            avatarEl.src = 'Pics/icon-taikhoan-default.png';
            
            // Ẩn các nút không dành cho khách
            renameBtn.style.display = 'none';
            logoutBtn.style.display = 'none';
            settingsBtn.style.display = 'none'; // Ẩn cả nút cài đặt
            friendsBtn.style.display = 'none';
        }
        
        // Hiển thị modal với hiệu ứng
        overlay.classList.add('visible');
        accountModal.classList.add('visible');
    }

    function hideAccountModal() {
        if (!accountModal) return;
        overlay.classList.remove('visible');
        accountModal.classList.remove('visible');
    }


    // --- GÁN SỰ KIỆN CHÍNH CHO ICON TÀI KHOẢN ---
    if (accountIcon) {
        accountIcon.addEventListener('click', () => {
            // Chỉ tạo modal lần đầu tiên nhấn vào
            if (!accountModal) {
                createAccountModal();
            }
            showAccountModal();
        });
    }
});
/* START OF FILE JS/modal_banbe_thongtin.js */

document.addEventListener('DOMContentLoaded', () => {
    let modal = null;

    // Hàm tạo modal (chỉ chạy 1 lần)
    function createFriendInfoModal() {
        if (document.getElementById('friend-info-modal-overlay')) return;

        const modalHTML = `
        <div id="friend-info-modal-overlay" class="friend-info-modal-overlay">
            <div class="friend-info-modal-content">
                <div class="friend-info-header">
                    <span id="friend-info-modal-title">THÔNG TIN NGƯỜI CHƠI</span>
                    <span class="friend-info-close-button">×</span>
                </div>
                <div id="friend-info-modal-body" class="friend-info-body">
                    <!-- Nội dung chi tiết sẽ được bổ sung sau -->
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        modal = document.getElementById('friend-info-modal-overlay');

        // Gán sự kiện cho các nút vừa tạo
        const closeBtn = modal.querySelector('.friend-info-close-button');
        closeBtn.addEventListener('click', hideFriendInfoModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideFriendInfoModal();
            }
        });
    }

    // Hàm ẩn modal
    function hideFriendInfoModal() {
        if (modal) {
            modal.classList.remove('visible');
        }
    }

    /**
     * Hàm hiển thị modal thông tin bạn bè
     * @param {object} friendData - Dữ liệu đầy đủ của người bạn được click.
     */
    window.showFriendInfoModal = function(friendData) {
        createFriendInfoModal(); // Đảm bảo modal đã tồn tại

        const modalBody = document.getElementById('friend-info-modal-body');
        const displayName = friendData.email ? friendData.email.split('@')[0] : "Người chơi";
        
        const avatarSrc = friendData.photoURL || 'Pics/icon-taikhoan-default.png';
        const accountName = friendData.email || 'Không có thông tin';
        const uid = friendData.uid || 'Không có thông tin';
        const stats = friendData.stats || { harvestedCrops: 0, unlockedPlots: 3 };
        const xpForNextLevel = typeof getXpForNextLevel === 'function' ? getXpForNextLevel(friendData.level || 1) : 100;

        modalBody.innerHTML = `
            <img src="${avatarSrc}" alt="Avatar" class="friend-info-avatar">
            <div class="friend-info-account-name">${displayName}</div>
            <div class="friend-info-uid">UID: ${uid.substring(0, 12)}...</div>

            <div class="friend-info-stats">
                <div class="stats-item">
                    <span>Cấp độ:</span>
                    <span>${friendData.level || 1}</span>
                </div>
                <div class="stats-item">
                    <span>Kinh nghiệm:</span>
                    <span>${friendData.xp || 0} / ${xpForNextLevel}</span>
                </div>
                <div class="stats-item">
                    <span>Đã thu hoạch:</span>
                    <span>${stats.harvestedCrops}</span>
                </div>
                <div class="stats-item">
                    <span>Ô đất sở hữu:</span>
                    <span>${stats.unlockedPlots} / 20</span>
                </div>
            </div>

            <button id="visit-farm-button" data-uid="${uid}">Thăm vườn</button>
        `;

        // Gán sự kiện cho nút "Thăm vườn"
        const visitButton = modalBody.querySelector('#visit-farm-button');
        if (visitButton) {
            visitButton.addEventListener('click', () => {
                const friendUid = visitButton.dataset.uid;

                  const friendNickname = friendData.email ? friendData.email.split('@')[0] : "Người chơi";
                  // Đóng modal danh sách bạn bè (nếu đang mở)
                if (typeof hideFriendsModal === 'function') {
                    hideFriendsModal();
                }
                // Đóng modal thông tin tài khoản (nếu đang mở)
                if (typeof hideAccountModal === 'function') {
                    hideAccountModal();
                }
                if (typeof window.visitFriendFarm === 'function') {
                    // Gọi hàm thăm vườn và truyền UID, Nickname
                    window.visitFriendFarm(friendUid, friendNickname);
                }
                // Đóng modal thông tin bạn bè sau khi nhấn
                hideFriendInfoModal();
            });
        }

        modal.classList.add('visible');
    };
});

/* END OF FILE JS/modal_banbe_thongtin.js */
/* START OF FILE JS/modal_bangxephang_thongtinnguoichoi.js */

document.addEventListener('DOMContentLoaded', () => {
    let modal = null;

    // Hàm tạo modal (chỉ chạy 1 lần)
    function createPlayerInfoModal() {
        if (document.getElementById('player-info-modal-overlay')) return;

        const modalHTML = `
        <div id="player-info-modal-overlay" class="player-info-modal-overlay">
            <div class="player-info-modal-content">
                <div class="player-info-header">
                    <span id="player-info-modal-title">THÔNG TIN NGƯỜI CHƠI</span>
                    <span class="player-info-close-button">×</span>
                </div>
                <div id="player-info-modal-body" class="player-info-body">
                    <!-- Nội dung chi tiết sẽ được bổ sung sau -->
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        modal = document.getElementById('player-info-modal-overlay');

        // Gán sự kiện cho các nút vừa tạo
        const closeBtn = modal.querySelector('.player-info-close-button');
        closeBtn.addEventListener('click', hidePlayerInfoModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hidePlayerInfoModal();
            }
        });
    }

    // Hàm ẩn modal
    function hidePlayerInfoModal() {
        if (modal) {
            modal.classList.remove('visible');
        }
    }

    /**
     * Hàm hiển thị modal (hàm chính, được gọi từ file khác)
     * @param {object} playerData - Dữ liệu của người chơi được click.
     */
    window.showPlayerInfoModal = function(playerData) {
        createPlayerInfoModal(); // Đảm bảo modal đã tồn tại

        const modalBody = document.getElementById('player-info-modal-body');
        const displayName = playerData.email ? playerData.email.split('@')[0] : "Người chơi";
        
        // Cập nhật nội dung (hiện tại chỉ là placeholder)
        const avatarSrc = playerData.photoURL || 'Pics/icon-taikhoan-default.png'; // Dùng ảnh mặc định nếu không có
const accountName = playerData.email || 'Không có thông tin';
const uid = playerData.uid || 'Không có thông tin';
const stats = playerData.stats || { harvestedCrops: 0, unlockedPlots: 3 };
const xpForNextLevel = typeof getXpForNextLevel === 'function' ? getXpForNextLevel(playerData.level || 1) : 100;

// Logic hiển thị nút Kết bạn
let addFriendButtonHTML = '';
// So sánh UID của người chơi được click với UID của người đang đăng nhập
if (auth.currentUser && playerData.uid !== auth.currentUser.uid) {
    addFriendButtonHTML = `<button id="add-friend-button">Kết bạn</button>`;
}


modalBody.innerHTML = `
    <img src="${avatarSrc}" alt="Avatar" class="player-info-avatar">
    <div class="player-info-account-name">${accountName}</div>
    <div class="player-info-uid">UID: ${uid.substring(0, 12)}...</div>

    <div class="player-info-stats">
        <div class="stats-item">
            <span>Cấp độ:</span>
            <span>${playerData.level || 1}</span>
        </div>
        <div class="stats-item">
            <span>Kinh nghiệm:</span>
            <span>${playerData.xp || 0} / ${xpForNextLevel}</span>
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

    ${addFriendButtonHTML}
`;

        const addFriendBtn = modalBody.querySelector('#add-friend-button');
if (addFriendBtn) {
    addFriendBtn.addEventListener('click', async () => {
        const senderUid = auth.currentUser.uid;
        // LƯU Ý QUAN TRỌNG: Phải lấy recipientUid và nickname từ biến playerData của hàm này
        const recipientUid = playerData.uid; 
           const senderNickname = (window.playerData && window.playerData.nickname) 
                                 ? window.playerData.nickname 
                                 : (auth.currentUser.email ? auth.currentUser.email.split('@')[0] : "Một người chơi");
        if (senderUid === recipientUid) return;

        try {
            const requestRef = db.collection('users').doc(recipientUid)
                                 .collection('friendRequests').doc(senderUid);
            
            await requestRef.set({
                senderUid: senderUid,
                senderNickname: senderNickname,
                recipientUid: recipientUid,
                status: 'pending',
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });

            const recipientNickname = playerData.email.split('@')[0];
            showGeneralNotification(`Đã gửi lời mời kết bạn đến ${recipientNickname}!`, 'success');
            
            addFriendBtn.disabled = true;
            addFriendBtn.textContent = 'Đã gửi lời mời';

        } catch (error) {
            console.error("Lỗi khi gửi lời mời kết bạn:", error);
            showGeneralNotification("Có lỗi xảy ra, không thể gửi lời mời.", "warning");
        }
    });
}



        modal.classList.add('visible');
    };
});





/* END OF FILE JS/modal_bangxephang_thongtinnguoichoi.js */
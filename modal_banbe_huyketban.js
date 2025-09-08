/* START OF FILE JS/modal_banbe_huyketban.js */

document.addEventListener('DOMContentLoaded', () => {
    let modal = null;
    let onConfirmCallback = null; // Biến để lưu hành động sau khi xác nhận

    // Hàm tạo modal (chỉ chạy 1 lần)
    function createUnfriendConfirmModal() {
        if (document.getElementById('unfriend-confirm-modal')) return;

        const modalHTML = `
        <div id="unfriend-confirm-modal" class="unfriend-confirm-modal">
            <div class="unfriend-confirm-content">
                <h2>XÁC NHẬN HỦY KẾT BẠN</h2>
                <p id="unfriend-confirm-message">Bạn có chắc chắn muốn hủy kết bạn với người này không?</p>
                <div class="unfriend-confirm-buttons">
                    <button id="cancel-unfriend-btn">Hủy</button>
                    <button id="confirm-unfriend-btn">Xác nhận</button>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        modal = document.getElementById('unfriend-confirm-modal');

        // Gán sự kiện cho các nút
        modal.querySelector('#cancel-unfriend-btn').addEventListener('click', hideUnfriendConfirmModal);
        modal.querySelector('#confirm-unfriend-btn').addEventListener('click', handleConfirmUnfriend);
    }

    // Hàm ẩn modal
    function hideUnfriendConfirmModal() {
        if (modal) modal.classList.remove('visible');
    }

    /**
     * Hàm hiển thị modal
     * @param {string} friendUid - UID của người bạn muốn hủy.
     * @param {string} friendNickname - Tên của người bạn muốn hủy.
     * @param {function} callback - Hàm sẽ được gọi sau khi xác nhận thành công.
     */
    window.showUnfriendConfirmModal = function(friendUid, friendNickname, callback) {
        createUnfriendConfirmModal();
        onConfirmCallback = callback; // Lưu lại hàm callback

        // Lưu UID vào dataset của modal để hàm `handleConfirmUnfriend` có thể lấy
        modal.dataset.friendUid = friendUid;

        // Cập nhật nội dung thông báo
        document.getElementById('unfriend-confirm-message').innerHTML = `Bạn có chắc chắn muốn hủy kết bạn với <strong>${friendNickname}</strong> không?`;
        
        modal.classList.add('visible');
    };

    // Hàm xử lý logic khi xác nhận hủy kết bạn
    async function handleConfirmUnfriend() {
        const friendUid = modal.dataset.friendUid;
        const currentUserUid = auth.currentUser.uid;
        if (!friendUid || !currentUserUid) return;

        try {
            const batch = db.batch();

            // 1. Xóa friendUid khỏi danh sách bạn của người dùng hiện tại
            const currentUserRef = db.collection('users').doc(currentUserUid);
            batch.update(currentUserRef, { friends: firebase.firestore.FieldValue.arrayRemove(friendUid) });

            // 2. Xóa currentUserUid khỏi danh sách bạn của người kia
            const friendUserRef = db.collection('users').doc(friendUid);
            batch.update(friendUserRef, { friends: firebase.firestore.FieldValue.arrayRemove(currentUserUid) });

            await batch.commit();

            // 3. Cập nhật dữ liệu local
            playerData.friends = playerData.friends.filter(uid => uid !== friendUid);

            showGeneralNotification("Đã hủy kết bạn.", "success");
            hideUnfriendConfirmModal();

            // 4. Gọi lại hàm callback để cập nhật lại danh sách bạn bè
            if (typeof onConfirmCallback === 'function') {
                onConfirmCallback();
            }

        } catch (error) {
            console.error("Lỗi khi hủy kết bạn:", error);
            showGeneralNotification("Có lỗi xảy ra, không thể hủy kết bạn.", "warning");
        }
    }
});

/* END OF FILE JS/modal_banbe_huyketban.js */
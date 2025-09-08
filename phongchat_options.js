/* START OF FILE JS/phongchat_options.js */

document.addEventListener('DOMContentLoaded', () => {
    let modal = null;

    function createMessageOptionsModal() {
        if (document.getElementById('message-options-overlay')) return;

        const modalHTML = `
        <div id="message-options-overlay" class="message-options-overlay">
            <div class="message-options-content">
                <h2>Tuỳ chọn tin nhắn</h2>
                <ul class="message-options-list">
                    <li id="recall-msg-btn" class="message-option recall">Thu hồi tin nhắn</li>
                    <li id="delete-for-me-btn" class="message-option">Xoá chỉ ở tôi</li>
                </ul>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        modal = document.getElementById('message-options-overlay');
        const recallBtn = document.getElementById('recall-msg-btn');
        const deleteForMeBtn = document.getElementById('delete-for-me-btn');

        // Gán sự kiện
        modal.addEventListener('click', (e) => { if (e.target === modal) hideMessageOptionsModal(); });
        recallBtn.addEventListener('click', handleRecallMessage);
        deleteForMeBtn.addEventListener('click', handleDeleteForMe);
    }

    window.showMessageOptionsModal = function(messageId) {
        if (!modal) createMessageOptionsModal();
        // Lưu ID của tin nhắn vào chính modal để các hàm khác có thể truy cập
        modal.dataset.messageId = messageId;
        modal.classList.add('visible');
    };

    function hideMessageOptionsModal() {
        if (modal) modal.classList.remove('visible');
    }

    // Xử lý THU HỒI TIN NHẮN (xóa cho mọi người)
     async function handleRecallMessage() {
        const messageId = modal.dataset.messageId;
        if (!messageId) return;

        try {
            // Thay vì .delete(), chúng ta dùng .update()
            await db.collection('messages').doc(messageId).update({
                recalled: true
            });
            // Thông báo không cần thiết vì giao diện sẽ tự cập nhật
        } catch (error) {
            console.error("Lỗi khi thu hồi tin nhắn:", error);
            showGeneralNotification("Không thể thu hồi tin nhắn.", "warning");
        } finally {
            hideMessageOptionsModal();
        }
    }

    // Xử lý XÓA CHỈ Ở TÔI (chỉ ẩn ở phía client)
    function handleDeleteForMe() {
        const messageId = modal.dataset.messageId;
        if (!messageId) return;

        // 1. Ẩn tin nhắn trên giao diện ngay lập tức
        const messageElement = document.querySelector(`.message-item[data-id="${messageId}"]`);
        if (messageElement) {
            messageElement.style.display = 'none';
        }

        // 2. Lưu ID vào localStorage để không hiển thị lại sau khi tải lại trang
        const deletedKey = `deletedMessages_${auth.currentUser.uid}`;
        let deletedIds = JSON.parse(localStorage.getItem(deletedKey)) || [];
        if (!deletedIds.includes(messageId)) {
            deletedIds.push(messageId);
        }
        localStorage.setItem(deletedKey, JSON.stringify(deletedIds));

        showGeneralNotification("Đã xoá tin nhắn khỏi cuộc trò chuyện của bạn.", "success");
        hideMessageOptionsModal();
    }
    
});

/* END OF FILE JS/phongchat_options.js */
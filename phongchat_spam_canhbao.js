/* START OF FILE JS/phongchat_spam_canhbao.js */

document.addEventListener('DOMContentLoaded', () => {
    let modal = null;

    // Hàm tạo modal (chỉ chạy 1 lần)
    function createSpamWarningModal() {
        if (document.getElementById('spam-warning-overlay')) return;

        const modalHTML = `
        <div id="spam-warning-overlay" class="spam-warning-overlay">
            <div class="spam-warning-content">
                <img src="Pics/sanhcho/phongchat_spam_canhbao.gif" alt="Cảnh báo" class="spam-warning-icon">
                 <h2 id="spam-warning-title">CẢNH BÁO</h2>
                <p id="spam-warning-message">Bạn đang nhắn tin quá nhanh! Vui lòng chờ một chút trước khi gửi tin nhắn tiếp theo.</p>
                <button id="close-spam-warning-btn">Đã hiểu</button>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        modal = document.getElementById('spam-warning-overlay');
        const closeBtn = document.getElementById('close-spam-warning-btn');

        // Gán sự kiện đóng
        closeBtn.addEventListener('click', hideSpamWarningModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideSpamWarningModal();
            }
        });
    }

    // Hàm hiển thị modal (hàm này sẽ được các file khác gọi)
   window.showSpamWarningModal = function(isLocked, duration = 0) {
        if (!modal) {
            createSpamWarningModal();
        }

        const title = document.getElementById('spam-warning-title');
        const message = document.getElementById('spam-warning-message');

        if (isLocked) {
            // Trường hợp bị khóa chat
            title.textContent = "BẠN ĐÃ BỊ KHÓA CHAT";
            message.innerHTML = `Vui lòng đợi <strong>${duration} giây</strong> nữa để có thể tiếp tục trò chuyện.`;
        } else {
            // Trường hợp chỉ cảnh báo
            title.textContent = "CẢNH BÁO";
            message.textContent = "Bạn đang nhắn tin quá nhanh! Vui lòng chờ một chút trước khi gửi tin nhắn tiếp theo.";
        }
        
        modal.classList.add('visible');
    };

    // Hàm ẩn modal
    function hideSpamWarningModal() {
        if (modal) {
            modal.classList.remove('visible');
        }
    }
});

/* END OF FILE JS/phongchat_spam_canhbao.js */
/* START OF FILE JS/modal_sanhcho.js */

document.addEventListener('DOMContentLoaded', () => {
    let modal = null;

    // Hàm tạo modal (chỉ chạy 1 lần)
    function createSanhChoModal() {
        if (document.getElementById('sanhcho-modal-overlay')) return;

        const modalHTML = `
        <div id="sanhcho-modal-overlay" class="sanhcho-modal-overlay">
            <div class="sanhcho-modal-content">
                <div class="sanhcho-header">
                    Sảnh Chờ
                    <span class="sanhcho-close-button">×</span>
                </div>
                <div class="sanhcho-main-area">
                     <div class="sanhcho-features-container">
                        <div id="sanhcho-chat-btn" class="sanhcho-feature-item">
                            <img src="Pics/Sanhcho/phongchat.png" alt="Phòng chat" class="sanhcho-feature-icon">
                            <span class="sanhcho-feature-label">Phòng chat</span>
                        </div>
                        <div id="sanhcho-leaderboard-btn" class="sanhcho-feature-item">
                            <img src="Pics/Sanhcho/bangxephang.png" alt="Bảng xếp hạng" class="sanhcho-feature-icon">
                            <span class="sanhcho-feature-label">Bảng xếp hạng</span>
                        </div>
                       
                    </div>
                     <div class="sanhcho-features-container">
                        <div id="sanhcho-entertainment-btn" class="sanhcho-feature-item">
                            <img src="Pics/Sanhcho/khugiaitri.png" alt="Khu giải trí" class="sanhcho-feature-icon">
                            <span class="sanhcho-feature-label">Khu giải trí</span>
                        </div>
                        <div id="sanhcho-bank-btn" class="sanhcho-feature-item">
                            <img src="Pics/Sanhcho/nganhang.png" alt="Ngân hàng" class="sanhcho-feature-icon">
                            <span class="sanhcho-feature-label">Ngân hàng</span>
                        </div>
                    </div>



                </div>
                



            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        modal = document.getElementById('sanhcho-modal-overlay');
        addEventListenersToSanhChoModal();
    }

    // Gán sự kiện cho các nút
    function addEventListenersToSanhChoModal() {
        const closeBtn = modal.querySelector('.sanhcho-close-button');
        
        closeBtn.addEventListener('click', hideSanhChoModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideSanhChoModal();
            }
        });
        const chatBtn = document.getElementById('sanhcho-chat-btn');
        const leaderboardBtn = document.getElementById('sanhcho-leaderboard-btn');
        const entertainmentBtn = document.getElementById('sanhcho-entertainment-btn');

        if (chatBtn) {
            chatBtn.addEventListener('click', () => {
                
                if (typeof window.showChatModal === 'function') {
                    window.showChatModal(); 
                } else {
                    console.error("Lỗi: Hàm showChatModal() không tồn tại!");
                }
            });
        }

        if (leaderboardBtn) {
            leaderboardBtn.addEventListener('click', () => {
               
                 if (typeof window.showLeaderboardModal === 'function') {
                    window.showLeaderboardModal(); // Bỏ setTimeout
                } else {
                    console.error("Lỗi: Hàm showLeaderboardModal() không tồn tại!");
                }
            });
        }
         if (entertainmentBtn) {
            entertainmentBtn.addEventListener('click', () => {
                // Chúng ta không đóng modal Sảnh chờ
                if (typeof window.showKhuGiaiTriModal === 'function') {
                    window.showKhuGiaiTriModal();
                } else {
                    console.error("Lỗi: Hàm showKhuGiaiTriModal() không tồn tại!");
                }
            });
        }


        const chatIcon = document.getElementById('sanhcho-chat-icon');
        if (chatIcon) {
            chatIcon.addEventListener('click', () => {
                // 1. Đóng modal sảnh chờ hiện tại
                hideSanhChoModal();

                // 2. Mở modal chat chung (hàm này từ file phongchat.js)
                if (typeof window.showChatModal === 'function') {
                    // Thêm một chút delay để hiệu ứng chuyển modal mượt hơn
                    setTimeout(() => {
                        window.showChatModal();
                    }, 200); 
                } else {
                    console.error("Lỗi: Hàm showChatModal() không tồn tại!");
                }
            });
        }
    }

    // Hàm hiển thị modal (sẽ được gọi từ file khác)
    window.showSanhChoModal = function() {
        createSanhChoModal(); // Đảm bảo modal đã được tạo
        // Có thể thêm logic tải dữ liệu cho sảnh chờ ở đây trong tương lai
        modal.classList.add('visible');
    };

    // Hàm ẩn modal
    function hideSanhChoModal() {
        if (modal) {
            modal.classList.remove('visible');
        }
    }
});

/* END OF FILE JS/modal_sanhcho.js */
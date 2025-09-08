/* START OF FILE JS/modal_khugiaitri.js */

document.addEventListener('DOMContentLoaded', () => {
    let modal = null;

    // Hàm tạo modal (chỉ chạy 1 lần)
    function createKhuGiaiTriModal() {
        if (document.getElementById('khugiaitri-modal-overlay')) return;

        const modalHTML = `
        <div id="khugiaitri-modal-overlay" class="khugiaitri-modal-overlay">
            <div class="khugiaitri-modal-content">
                <div class="khugiaitri-header">
                    Khu Giải Trí
                    <span class="khugiaitri-close-button">×</span>
                </div>
                <div class="khugiaitri-main-area">
                     <div class="khugiaitri-features-container">
                    <div id="vongquay-mayman-btn" class="khugiaitri-feature-item">
                        <img src="Pics/minigame/vongquaymayman.png" alt="Vòng quay may mắn" class="khugiaitri-feature-icon">
                        <span class="khugiaitri-feature-label">Vòng Quay May Mắn</span>
                    </div>
                     <div id="jackslot-btn" class="khugiaitri-feature-item">
                        <img src="Pics/minigame/jackpot.png" alt="Máy xèng Jackslot" class="khugiaitri-feature-icon">
                        <span class="khugiaitri-feature-label">Máy Xèng Jackslot</span>
                    </div>
                    
                </div>
                <div id="xoso-kienthiet-btn" class="khugiaitri-feature-item">
                            <img src="Pics/minigame/soxokienthiet.png" alt="Xổ số kiến thiết" class="khugiaitri-feature-icon">
                            <span class="khugiaitri-feature-label">Xổ số kiến thiết</span>
                    </div>
                </div>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        modal = document.getElementById('khugiaitri-modal-overlay');
        addEventListenersToKhuGiaiTriModal();
    }

    // Gán sự kiện cho các nút
    function addEventListenersToKhuGiaiTriModal() {
        const closeBtn = modal.querySelector('.khugiaitri-close-button');
        
        closeBtn.addEventListener('click', hideKhuGiaiTriModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideKhuGiaiTriModal();
            }
             const vongQuayBtn = document.getElementById('vongquay-mayman-btn');
        if(vongQuayBtn) {
            vongQuayBtn.addEventListener('click', () => {
                if (typeof window.showVongQuayMayManModal === 'function') {
                    // Không đóng modal Khu Giải Trí, cứ để Vòng Quay hiện lên trên
                    window.showVongQuayMayManModal();
                } else {
                    console.error("Lỗi: Hàm showVongQuayMayManModal() không tồn tại!");
                }
            });
        }
        const jackslotBtn = document.getElementById('jackslot-btn');
        if(jackslotBtn) {
            jackslotBtn.addEventListener('click', () => {
                if (typeof window.showJackslotModal === 'function') {
                    window.showJackslotModal();
                } else {
                    console.error("Lỗi: Hàm showJackslotModal() không tồn tại!");
                }
            });
        }
        const xosoBtn = document.getElementById('xoso-kienthiet-btn');
            if(xosoBtn) {
                xosoBtn.addEventListener('click', () => {
                    // Gọi hàm hiển thị modal iframe mới
                    if (typeof window.showGenericIframeModal === 'function') {
                        // Truyền đường dẫn đến file HTML và tiêu đề
                        window.showGenericIframeModal('xosokienthiet.html', 'Xổ Số Kiến Thiết');
                    } else {
                        console.error("Lỗi: Hàm showGenericIframeModal() không tồn tại!");
                    }
                });
            }



        });
    }

    // Hàm hiển thị modal (sẽ được gọi từ file khác)
    window.showKhuGiaiTriModal = function() {
        createKhuGiaiTriModal(); // Đảm bảo modal đã được tạo
        modal.classList.add('visible');
    };

    // Hàm ẩn modal
    function hideKhuGiaiTriModal() {
        if (modal) {
            modal.classList.remove('visible');
        }
    }
});

/* END OF FILE JS/modal_khugiaitri.js */
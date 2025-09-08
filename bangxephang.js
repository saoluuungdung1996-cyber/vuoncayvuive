/* START OF FILE JS/bangxephang.js */

document.addEventListener('DOMContentLoaded', () => {
    let modal = null;

    // Hàm tạo modal (chỉ chạy 1 lần)
    function createLeaderboardModal() {
        if (document.getElementById('leaderboard-modal-overlay')) return;

        const modalHTML = `
        <div id="leaderboard-modal-overlay" class="leaderboard-modal-overlay">
            <div class="leaderboard-modal-content">
                <div class="leaderboard-header">
                    👑BẢNG XẾP HẠNG👑
                    <span class="leaderboard-close-button">×</span>
                </div>
                <div class="leaderboard-main-area">
                    <div class="leaderboard-tabs">
                        <button class="category-btn active" data-category="trieuphu">Nông dân triệu phú</button>
                        <button class="category-btn" data-category="cancu">Nông dân cần cù</button>
                        <button class="category-btn" data-category="kinhnghiem">Nông dân kinh nghiệm</button>
                        <button class="category-btn" data-category="khaihoang">Vua khai hoang</button>
                        <button class="category-btn" data-category="nangcap">Nhà nâng cấp vĩ đại</button>
                    </div>
                    <div class="leaderboard-display">
                        <h2 id="leaderboard-title">Nông dân triệu phú</h2>
                        <div id="leaderboard-list-container">
                            <!-- Danh sách người chơi sẽ được tải và hiển thị ở đây -->
                            <p>Đang tải dữ liệu...</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        modal = document.getElementById('leaderboard-modal-overlay');
        addEventListenersToLeaderboardModal();
    }
      function renderTopPlayers(topPlayers, dataType) {
        const listContainer = document.getElementById('leaderboard-list-container');
        listContainer.innerHTML = ''; // Xóa nội dung cũ (như "Đang tải...")

        if (!topPlayers || topPlayers.length === 0) {
            listContainer.innerHTML = '<p>Chưa có dữ liệu cho bảng xếp hạng này.</p>';
            return;
        }

        const ol = document.createElement('ol');
        ol.className = 'leaderboard-list';

        topPlayers.forEach((player, index) => {
            const li = document.createElement('li');
            li.className = 'leaderboard-item';

            // --- Logic mới cho việc hiển thị RANK (thứ hạng) ---
            let rankHTML = '';
            const rank = index + 1;
            if (rank <= 3) {
                // Nếu là top 1, 2, 3 -> dùng hình ảnh
                rankHTML = `<img src="Pics/top${rank}.png" alt="Top ${rank}" class="rank-icon">`;
            } else {
                // Từ hạng 4 trở đi -> dùng số
                rankHTML = `<span class="rank">${rank}</span>`;
            }

            // Lấy tên từ email, bỏ phần đuôi
            const displayName = player.email ? player.email.split('@')[0] : "Người chơi ẩn danh";
            
            // Định dạng giá trị hiển thị (tiền, cấp độ,...)
            let displayValue = '';
            if (dataType === 'money') {
                displayValue = `${(player.money || 0).toLocaleString('vi-VN')} $`;
            }
             else if (dataType === 'streak') {
                const streak = (player.weeklyLoginStats && player.weeklyLoginStats.maxStreak) || 0;
                displayValue = `${streak} ngày`;
            }
             else if (dataType === 'xp') {
                const xpToday = (player.dailyStats && player.dailyStats.xpEarned) || 0;
                displayValue = `+ ${xpToday.toLocaleString('vi-VN')} KN`;
            }

            li.innerHTML = `
                ${rankHTML}
                <span class="player-info">
                    <span class="player-name">LV ${player.level || 1} - ${displayName}</span>
                </span>
                <span class="player-score ${dataType === 'streak' ? 'streak' : ''}">${displayValue}</span>
            `;
            ol.appendChild(li);
            li.addEventListener('click', () => {
                // Gọi hàm hiển thị modal thông tin từ file mới
                if (typeof window.showPlayerInfoModal === 'function') {
                    // Truyền toàn bộ dữ liệu của người chơi được click vào hàm
                    window.showPlayerInfoModal(player);
                } else {
                    console.error("Lỗi: Hàm showPlayerInfoModal() không tồn tại!");
                }
            });
             // Sau khi `li` đã được thêm vào DOM, chúng ta có thể đo kích thước của nó
            const playerNameSpan = li.querySelector('.player-name');
            const playerInfoContainer = li.querySelector('.player-info');

            // So sánh chiều rộng thực tế của chữ và chiều rộng của container
            if (playerNameSpan.scrollWidth > playerInfoContainer.clientWidth) {
                playerNameSpan.classList.add('marquee');
            }
        });


        listContainer.appendChild(ol);
    }

     async function fetchTopRichestPlayers() {
        const listContainer = document.getElementById('leaderboard-list-container');
        listContainer.innerHTML = '<p>Đang tải dữ liệu...</p>';

        try {
            const querySnapshot = await db.collection('users')
                .orderBy('money', 'desc') // Sắp xếp theo tiền, giảm dần
                .limit(10) // Giới hạn 10 kết quả
                .get();
            
              const players = querySnapshot.docs
                .filter(doc => doc.data() && doc.data().email) // Chỉ giữ lại những document có field 'email'
                .map(doc => ({ uid: doc.id, ...doc.data() }));
            renderTopPlayers(players, 'money');

        } catch (error) {
            console.error("Lỗi khi tải BXH Nông dân triệu phú:", error);
            listContainer.innerHTML = '<p>Không thể tải bảng xếp hạng. Vui lòng thử lại sau.</p>';
        }
    }

      async function fetchTopDiligentPlayers() {
        const listContainer = document.getElementById('leaderboard-list-container');
        listContainer.innerHTML = '<p>Đang tải dữ liệu...</p>';
        
        // Lấy chuỗi tuần hiện tại để truy vấn
        const now = new Date();
        const date = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
        date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
        const currentWeekString = `${date.getUTCFullYear()}-${String(weekNo).padStart(2, '0')}`;

        try {
            const querySnapshot = await db.collection('users')
                .where('weeklyLoginStats.lastUpdatedWeek', '==', currentWeekString) // Chỉ lấy người chơi trong tuần này
                .orderBy('weeklyLoginStats.maxStreak', 'desc') // Sắp xếp theo chuỗi dài nhất
                .limit(10)
                .get();
            
            const players = querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
            renderTopPlayers(players, 'streak'); // Dùng dataType mới là 'streak'

        } catch (error) {
            console.error("Lỗi khi tải BXH Nông dân cần cù:", error);
            listContainer.innerHTML = '<p>Không thể tải bảng xếp hạng. Vui lòng thử lại sau.</p>';
        }
    }

    /**
     * Lấy dữ liệu top 10 người chơi có nhiều kinh nghiệm nhất trong ngày.
     */
    async function fetchTopExperiencedPlayers() {
        const listContainer = document.getElementById('leaderboard-list-container');
        listContainer.innerHTML = '<p>Đang tải dữ liệu...</p>';
        
        // Lấy ngày hôm nay dưới dạng chuỗi "YYYY-MM-DD" để truy vấn
        const today = new Date().toISOString().slice(0, 10);

        try {
            const querySnapshot = await db.collection('users')
                .where('dailyStats.lastUpdate', '==', today) // Chỉ lấy người chơi có hoạt động hôm nay
                .orderBy('dailyStats.xpEarned', 'desc')     // Sắp xếp theo XP kiếm được, giảm dần
                .limit(10)                                  // Giới hạn 10 người
                .get();
            
            const players = querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
            renderTopPlayers(players, 'xp'); // Dùng dataType mới là 'xp'

        } catch (error) {
            console.error("Lỗi khi tải BXH Nông dân kinh nghiệm:", error);
            listContainer.innerHTML = '<p>Không thể tải bảng xếp hạng. Vui lòng thử lại sau.</p>';
        }
    }


    // Gán sự kiện cho các nút
    function addEventListenersToLeaderboardModal() {
        const closeBtn = modal.querySelector('.leaderboard-close-button');
        const categoriesContainer = modal.querySelector('.leaderboard-tabs');
        const modalContent = modal.querySelector('.leaderboard-modal-content');
        closeBtn.addEventListener('click', hideLeaderboardModal);
        modal.addEventListener('click', (e) => { if (e.target === modal) hideLeaderboardModal(); });

        categoriesContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('category-btn')) {
                // Xóa class 'active' khỏi tất cả các nút
                categoriesContainer.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
                
                // Thêm class 'active' cho nút được nhấn
                e.target.classList.add('active');

                // Cập nhật tiêu đề
                document.getElementById('leaderboard-title').textContent = e.target.textContent;
                
               
                const category = e.target.dataset.category;
                
                // Logic thay đổi hình nền
                if (category === 'cancu') {
                    modalContent.style.backgroundImage = "url('Pics/nongdancancu.png')";
                } else {
                    // Quay về hình nền mặc định cho tất cả các tab khác
                    modalContent.style.backgroundImage = "url('Pics/nenmodal.png')";
                }

                // Logic tải dữ liệu
                if (category === 'trieuphu') {
                    fetchTopRichestPlayers();
                } else if (category === 'cancu') {
                    fetchTopDiligentPlayers();
                } 
                  else if (category === 'kinhnghiem') {
                    fetchTopExperiencedPlayers();
                } 
                
                
                else {
                    // Tạm thời cho các tab khác
                    document.getElementById('leaderboard-list-container').innerHTML = `<p>Bảng xếp hạng "${e.target.textContent}" đang được phát triển.</p>`;
                }
              
            }
        });
    }

    // Hàm hiển thị modal
    window.showLeaderboardModal = function() {
        createLeaderboardModal();
        // Mặc định tải BXH triệu phú khi mở modal
        fetchTopRichestPlayers(); 
        modal.classList.add('visible');
    };

    // Hàm ẩn modal
    function hideLeaderboardModal() {
        if (modal) modal.classList.remove('visible');
    }
});
/* END OF FILE JS/bangxephang.js */
// Biến toàn cục để các tệp khác có thể gọi
function showLogoutConfirmModal() {
    const modal = document.getElementById('logout-confirm-modal');
    if (modal) {
        modal.classList.add('visible');
    }
}

function hideLogoutConfirmModal() {
    const modal = document.getElementById('logout-confirm-modal');
    if (modal) {
        modal.classList.remove('visible');
    }
}
async function savePlayerData() {
    const user = auth.currentUser;
    if (!user) {
        console.log("Không có người dùng nào đăng nhập để lưu dữ liệu.");
        return;
    }

    try {
        console.log("Chuẩn bị lưu dữ liệu cho người dùng:", user.uid);
        
        

         // Hành động này đảm bảo rằng nếu thời tiết vừa hết hạn, trạng thái mới sẽ được lưu lại,
        // thay vì trạng thái cũ đã hết hạn.
        if (typeof weatherTick === 'function') {
            weatherTick();
        }
         // Lưu lại thời điểm cuối cùng online trước khi lưu
        playerData.lastOnline = firebase.firestore.FieldValue.serverTimestamp();
        const userDocRef = db.collection('users').doc(user.uid);
        
        // Dùng set để ghi đè toàn bộ dữ liệu, đảm bảo đồng bộ
        await userDocRef.set(playerData);
        
        console.log("Đã lưu dữ liệu người dùng thành công!");

    } catch (error) {
        console.error("Lỗi khi lưu dữ liệu người dùng:", error);
        // Hiển thị lỗi và ngăn việc đăng xuất
        alert("Không thể lưu tiến trình của bạn. Vui lòng kiểm tra kết nối mạng và thử đăng xuất lại.");
        throw error;
    }
}




document.addEventListener('DOMContentLoaded', function() {
    // Lấy các phần tử cần thiết
    const logoutConfirmModal = document.getElementById('logout-confirm-modal');
    const confirmBtn = document.getElementById('confirm-logout-btn');
    const cancelBtn = document.getElementById('cancel-logout-btn');

    // Các phần tử giao diện game và đăng nhập
    const gameContainer = document.getElementById('game-container');
    const loginModal = document.getElementById('login-modal');
    const authMenuItem = document.getElementById('auth-menu-item');

    // Sự kiện khi nhấn nút Hủy
    if (cancelBtn) {
        cancelBtn.addEventListener('click', hideLogoutConfirmModal);
    }
    
    // Sự kiện khi nhấn nút Đăng xuất (xác nhận)
    if (confirmBtn) {
    confirmBtn.addEventListener('click', async () => {
         showLoadingModal("Đang xác thực dữ liệu...");
           // Dừng tự động lưu ngay khi người chơi nhấn nút
        if(typeof window.stopAutoSave === 'function') {
            window.stopAutoSave();
        }

        // Gọi hàm kiểm tra từ tệp anticheat.js
        const validationResult = await window.validatePlayerData();

        // Nếu dữ liệu không hợp lệ, hiển thị thông báo và dừng lại
        if (!validationResult.isValid) {
            hideLoadingModal();
            alert(`Không thể đăng xuất: ${validationResult.message} Vui lòng tải lại trang để đồng bộ dữ liệu.`);
            return; // Ngăn không cho đăng xuất
        }
        // Ẩn modal xác nhận
        hideLogoutConfirmModal();
        showLoadingModal("Đang đăng xuất..."); // Hiển thị loading trong khi lưu và đăng xuất

        try {
            // Bước 1: Gọi hàm lưu dữ liệu và chờ nó hoàn tất
            console.log("Bắt đầu quá trình lưu dữ liệu...");
            await savePlayerData();
            

            // Bước 2: Nếu lưu thành công, tiến hành đăng xuất khỏi Firebase
            await auth.signOut();
            console.log('Đã đăng xuất thành công.');
            
           // Bước 3: Chỉ dọn dẹp và reset giao diện, KHÔNG reset dữ liệu
            console.log("Returning to login screen without resetting game data.");


            

            // Dọn dẹp các vòng lặp đang chạy
            if (window.mainGameLoop) clearInterval(window.mainGameLoop);
            if (window.weatherInterval) clearInterval(window.weatherInterval);
            if (window.upgradeInterval) clearInterval(window.upgradeInterval);

             // Dừng hệ thống sâu bệnh (quan trọng, vì nó có thông báo)
            if (typeof window.stopPestSystem === 'function') {
                window.stopPestSystem();
            }
            // Dừng hệ thống trâu ăn cỏ
            if (typeof window.stopBuffaloSystem === 'function') {
                window.stopBuffaloSystem();
            }
            // Dừng hệ thống trừ máu do đất khô
            if (typeof window.stopDryGroundHealthDrain === 'function') {
                window.stopDryGroundHealthDrain();
            }
            
             // Dừng tất cả các hiệu ứng thời tiết đang chạy
            if (typeof applyWeatherEffects === 'function') {
                applyWeatherEffects(null); // Gọi với tham số null để chỉ dọn dẹp
            }
            // Dừng hệ thống hiệu ứng đất khô
            if (typeof window.stopDryMechanicsSystem === 'function') {
                window.stopDryMechanicsSystem();
            }
              // Dừng hệ thống cỏ dại
            if (typeof window.stopWeedSystem === 'function') {
                window.stopWeedSystem();
            }
             // Dừng âm thanh mưa nếu đang phát
            if (typeof stopRainSound === 'function') {
                stopRainSound();
            }
              // Dừng hệ thống phục hồi sức khỏe tự nhiên
            if (typeof window.stopNaturalHealing === 'function') {
                window.stopNaturalHealing();
            }
            // Ẩn game và hiển thị lại modal đăng nhập
            const gameContainer = document.getElementById('game-container');
            const loginModal = document.getElementById('login-modal');
            if (gameContainer) gameContainer.style.display = 'none';


            document.querySelector('.tien-container').style.display = 'none';
            document.querySelector('.menu-container').style.display = 'none';
            document.getElementById('top-left-ui-container').style.display = 'none'; // Ẩn khung cha
            document.getElementById('account-icon-container').style.display = 'none';
            document.getElementById('achievement-icon-container').style.display = 'none';
            document.getElementById('daily-quest-icon-container').style.display = 'none';

           const dailyLoginIcon = document.getElementById('daily-login-icon-container');
            if (dailyLoginIcon) {
                dailyLoginIcon.style.display = 'none';
            }


            



            if (loginModal) loginModal.classList.add('visible');
            isUserInGame = false; // Đánh dấu người chơi đã thoát ra màn hình đăng nhập
            // Đặt lại nút menu về trạng thái "Đăng nhập"
            const authMenuItem = document.getElementById('auth-menu-item');
            if (authMenuItem) {
                const authIcon = authMenuItem.querySelector('img');
                const authText = authMenuItem.querySelector('span');
                authIcon.src = 'Pics/dangnhap.png';
                authIcon.alt = 'Đăng nhập';
                authText.textContent = 'Đăng nhập';
                
                // Gán lại sự kiện click để mở modal đăng nhập cho lần sau
                authMenuItem.onclick = () => {
                    document.getElementById('menu-options')?.classList.remove('show-menu');
                    loginModal.classList.add('visible');
                };
            }

        } catch (error) {
            // Nếu savePlayerData() hoặc signOut() ném ra lỗi,
            // quá trình đăng xuất sẽ bị hủy và thông báo lỗi đã được hiển thị.
            console.error("Hủy đăng xuất do không thể lưu dữ liệu hoặc đăng xuất thất bại.", error);
        } finally {
            // Luôn ẩn modal loading khi quá trình kết thúc
            hideLoadingModal();
        }
    });
}
});
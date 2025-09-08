

// Đợi cho toàn bộ nội dung của trang được tải xong
document.addEventListener('DOMContentLoaded', function() {
	
	 async function processLoginAndLoadGame(uid) {
        showLoadingModal("Đang tải dữ liệu game...");
        try {
             // Đánh dấu thời điểm hoạt động cuối cùng ngay khi người dùng vào game
        await db.collection('userStatus').doc(uid).set({
            last_active: firebase.firestore.FieldValue.serverTimestamp()
        });
            // Tải tất cả dữ liệu game cần thiết
            await Promise.all([
                loadAllGameItemsFromFirebase(),
                loadAllItemsFromFirebase(),
                loadAllToolsFromFirebase(),
                loadVongQuayDataFromFirebase(),
                typeof window.loadAchievementsFromFirebase === 'function' ? window.loadAchievementsFromFirebase() : Promise.resolve()
            ]);

            // Thiết lập hệ thống thời gian chống gian lận
            const trustedServerTimestamp = firebase.firestore.Timestamp.now();
            initialServerTime = trustedServerTimestamp.toMillis();
            initialClientTime = Date.now();

            // Tải dữ liệu người chơi
            await loadPlayerData(uid, trustedServerTimestamp);
			const autoWateredPlotsAfterOffline = await loadPlayerData(uid, trustedServerTimestamp);
            // Khởi tạo các hệ thống game
            if (typeof window.checkDailyLoginStatus === 'function') window.checkDailyLoginStatus();
            if (typeof window.initializeWeatherSystem === 'function') window.initializeWeatherSystem();
            if (typeof window.checkUpgradeOnLoad === 'function') window.checkUpgradeOnLoad();
            
            initializeFarmLayout();
            if (typeof renderAllPlots === 'function') renderAllPlots();
			// Sau khi game đã render xong, chạy hoạt ảnh cho các ô đất đã được tưới offline
        if (autoWateredPlotsAfterOffline && autoWateredPlotsAfterOffline.length > 0) {
            console.log(`Kích hoạt hoạt ảnh tưới nước offline cho các ô: ${autoWateredPlotsAfterOffline.join(', ')}`);
            
            // Thêm một chút trễ để người chơi kịp nhìn thấy nông trại
            setTimeout(() => {
                autoWateredPlotsAfterOffline.forEach(plotNumber => {
                    const plotContainer = document.querySelector(`.plot-container[data-plot-number='${plotNumber}']`);
                    if (plotContainer) {
                        const irrigationImage = plotContainer.querySelector('.irrigation-system-image');
                        if (irrigationImage) {
                            irrigationImage.src = 'Pics/Cuahang/Daocu/hethongtuoitudong_danghoatdong.gif';
                            setTimeout(() => {
                                irrigationImage.src = 'Pics/Cuahang/Daocu/hethongtuoitudong.png';
                            }, 5000); // Thời gian GIF chạy
                        }
                    }
                });
                
                // Hiển thị một thông báo chung duy nhất
                const message = `HTTT đã tự động tưới cho các ô đất <strong>${autoWateredPlotsAfterOffline.join(', ')}</strong> khi bạn vắng mặt.`;
                showGeneralNotification(message, 'info', 6000);

            }, 2000); // Chờ 2 giây sau khi game hiển thị
        }

            // Bắt đầu các vòng lặp game
            if (window.mainGameLoop) clearInterval(window.mainGameLoop);
            window.mainGameLoop = setInterval(() => {
                for (const plotNumber in playerData.farmPlots) {
                    if (playerData.farmPlots[plotNumber]?.seedId) {
                        renderSinglePlot(plotNumber);
                    }
                }
            }, 1000);

            if (typeof window.startDryGroundHealthDrain === 'function') window.startDryGroundHealthDrain();
            if (typeof window.startWeedSystem === 'function') window.startWeedSystem();
            if (typeof window.startDryMechanicsSystem === 'function') window.startDryMechanicsSystem();
            if (typeof window.startPestSystem === 'function') {
                window.startPestSystem();
                window.startPestHealthDrain();
            }
            if (typeof window.startNaturalHealing === 'function') window.startNaturalHealing();
            if (typeof window.checkAndRestoreRainCollection === 'function') window.checkAndRestoreRainCollection();
            if (typeof window.startBuffaloSystem === 'function') window.startBuffaloSystem();
			   // Khởi tạo vòng lặp kiểm tra tự động bơm nước mỗi 5 giây
            if (window.autoPumpInterval) clearInterval(window.autoPumpInterval);
            window.autoPumpInterval = setInterval(() => {
                if (playerData.settings?.autoPumpIrrigation === true) {
                    // Không cần log ra console mỗi 5s để tránh spam
                    if (typeof window.triggerIrrigationPump === 'function') {
                        window.triggerIrrigationPump(true); // true vì đây là tự động
                    }
                }
            }, 5000); // 5000ms = 5 giây
			// Chờ một chút để giao diện render xong, sau đó kiểm tra và tưới các ô bị khô
setTimeout(() => {
    if (typeof window.triggerIrrigationPump === 'function') {
        console.log("Kích hoạt kiểm tra tưới nước lần đầu sau khi đăng nhập.");
        window.triggerIrrigationPump(true);
    }
}, 1500); // Chờ 1.5 giây
            // Cập nhật giao diện sau khi đăng nhập thành công
            const authMenuItem = document.getElementById('auth-menu-item');
            if (authMenuItem) {
                const authIcon = authMenuItem.querySelector('img');
                const authText = authMenuItem.querySelector('span');
                authIcon.src = 'Pics/dangxuat.png';
                authIcon.alt = 'Đăng xuất';
                authText.textContent = 'Đăng xuất';
                authMenuItem.onclick = () => {
                    document.getElementById('menu-options')?.classList.remove('show-menu');
                    showLogoutConfirmModal();
                };
            }

            // Ẩn modal đăng nhập và hiển thị game
            document.getElementById('login-modal').classList.remove('visible');
            setTimeout(() => {
                document.getElementById('game-container').style.display = 'block';
                isUserInGame = true;
                document.querySelector('.tien-container').style.display = 'flex';
                document.querySelector('.menu-container').style.display = 'block';
                document.getElementById('top-left-ui-container').style.display = 'flex';
                document.getElementById('account-icon-container').style.display = 'flex';
                document.getElementById('achievement-icon-container').style.display = 'flex';
                document.getElementById('daily-quest-icon-container').style.display = 'flex';
                const dailyLoginIcon = document.getElementById('daily-login-icon-container');
                if (dailyLoginIcon) dailyLoginIcon.style.display = 'flex';
                if (typeof window.startAutoSave === 'function') window.startAutoSave();
				  // Dừng interval cũ nếu có
                if (window.notificationInterval) {
                    clearInterval(window.notificationInterval);
                }
                // Bắt đầu interval mới
                window.notificationInterval = setInterval(() => {
                    // Chỉ chạy nếu người chơi đang trong game VÀ đã bật cài đặt
                    if (isUserInGame && playerData.settings?.autoPumpIrrigation === true) {
                        if (typeof window.triggerIrrigationPump === 'function') {
                            // Gọi hàm bơm nước với tham số `true` để báo đây là tự động
                            window.triggerIrrigationPump(true);
                        }
                    }
                }, 10000); // 10 giây
            }, 400); 
            // Bổ sung bộ lắng nghe thời gian thực cho dữ liệu người dùng
        db.collection('users').doc(uid).onSnapshot((doc) => {
            if (doc.exists) {
                const serverData = doc.data();
                
                // Chỉ cập nhật những dữ liệu quan trọng có thể thay đổi bởi người khác
                // hoặc bởi các sự kiện server, tránh ghi đè dữ liệu client-side.
                if (serverData.friends) {
                    playerData.friends = serverData.friends;
                    console.log("Real-time: Danh sách bạn bè đã được cập nhật.", playerData.friends);
                    
                    // Nếu modal bạn bè đang mở, render lại danh sách
                    const friendsModal = document.getElementById('friends-modal');
                    if (friendsModal && friendsModal.classList.contains('visible')) {
                        const friendsListTab = friendsModal.querySelector('[data-tab="friends-list-tab"]');
                        if (friendsListTab && friendsListTab.classList.contains('active')) {
                            // Giả sử bạn có hàm renderFriendsList trong file modal_taikhoan_banbe.js
                            // và nó được đưa ra scope toàn cục hoặc có thể truy cập được.
                            // Để đơn giản, ta sẽ trực tiếp gọi nó nếu có thể.
                            if (typeof window.renderFriendsList === 'function') {
                                window.renderFriendsList();
                            }
                        }
                    }
                }
                
                // Bạn cũng có thể đồng bộ các dữ liệu khác ở đây nếu cần
                // Ví dụ: nickname, tiền (nếu có tính năng chuyển tiền), v.v.
                if (serverData.nickname && playerData.nickname !== serverData.nickname) {
                    playerData.nickname = serverData.nickname;
                    console.log("Real-time: Nickname đã được cập nhật.");
                }

            }
        }, (error) => {
            console.error("Lỗi lắng nghe dữ liệu người dùng:", error);
        });

        } catch (error) {
            console.error("Lỗi nghiêm trọng trong quá trình tải game:", error);
            alert("Đã xảy ra lỗi khi tải dữ liệu game. Vui lòng thử đăng nhập lại.");
            // Nếu có lỗi, đảm bảo đăng xuất người dùng để họ có thể thử lại
            await auth.signOut();
            resetGameToInitialState();
        } finally {
            hideLoadingModal();
        }
    }

    // Lắng nghe trạng thái Auth ngay khi trang tải xong
    auth.onAuthStateChanged(user => {
        const loginModal = document.getElementById('login-modal');
        const preloader = document.getElementById('preloader');

        // Chỉ xử lý tự động đăng nhập sau khi preloader đã ẩn
        if (preloader && preloader.style.display !== 'none') {
            // Nếu preloader còn, đợi nó ẩn rồi mới chạy lại logic
            const observer = new MutationObserver((mutations) => {
                if (preloader.style.display === 'none') {
                    auth.onAuthStateChanged(user => {
                        if(user) processLoginAndLoadGame(user.uid);
                    })(); // Chạy lại logic
                    observer.disconnect(); // Ngừng theo dõi
                }
            });
            observer.observe(preloader, { attributes: true, attributeFilter: ['style'] });
            return;
        }


        if (user) {
            // Nếu có người dùng đã đăng nhập, bắt đầu quá trình tải game
            console.log("Phát hiện người dùng đã đăng nhập:", user.uid, ". Bắt đầu tự động tải game...");
            loginModal.classList.remove('visible'); // Ẩn form đăng nhập
            processLoginAndLoadGame(user.uid);
        } else {
            // Nếu không có người dùng, đảm bảo form đăng nhập hiện ra
            console.log("Không có người dùng nào đăng nhập. Hiển thị form đăng nhập.");
            // loginModal.classList.add('visible'); // Dòng này đã có trong preloader.js nên không cần thiết
        }
    });

    // =========================================================================
    // LẤY CÁC PHẦN TỬ DOM
    // =========================================================================
    const loginModal = document.getElementById('login-modal');
    const loginForm = document.querySelector('.login-modal-content form');
    const gameContainer = document.getElementById('game-container');
    const registerModal = document.getElementById('register-modal');
    const registerButton = document.getElementById('register-button');
    const rememberMeCheckbox = document.getElementById('remember-me');
    const emailInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('login-error');
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    // Các phần tử của modal báo lỗi
    const errorModal = document.getElementById('error-modal');
    const errorModalMessage = document.getElementById('error-modal-message');
    const closeErrorModal = document.querySelector('.close-error-modal');
    const closeErrorModalBtn = document.getElementById('close-error-modal-btn');

    // =========================================================================
    // HÀM TIỆN ÍCH (MODAL LỖI, TẢI DỮ LIỆU)
    // =========================================================================

    // Hàm hiển thị modal lỗi với một thông điệp cụ thể
    function showErrorModal(message) {
        errorModalMessage.textContent = message;
        // Sử dụng class 'visible' để kích hoạt transition trong CSS
        errorModal.classList.add('visible');
    }

    // Hàm ẩn modal lỗi
    function hideErrorModal() {
        errorModal.classList.remove('visible');
    }
    // Gán sự kiện click cho link quên mật khẩu
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (event) => {
            event.preventDefault(); // Ngăn link tự điều hướng
            loginModal.classList.remove('visible'); // Ẩn modal đăng nhập
            
            // Gọi hàm hiển thị modal quên mật khẩu (được định nghĩa trong quen-mat-khau.js)
            if (typeof window.showForgotPasswordModal === 'function') {
                // Thêm một chút delay để hiệu ứng chuyển đổi mượt hơn
                setTimeout(() => {
                    window.showForgotPasswordModal();
                }, 200);
            } else {
                console.error('Hàm showForgotPasswordModal() không tồn tại.');
            }
        });
    }
    // Gán sự kiện click để đóng modal lỗi
    closeErrorModal.addEventListener('click', hideErrorModal);
    closeErrorModalBtn.addEventListener('click', hideErrorModal);

    /**
     * Tải dữ liệu của người chơi từ Firestore.
     * Nếu người chơi mới, tạo dữ liệu mặc định.
     * @param {string} uid - User ID của người dùng từ Firebase Auth.
     */
    

    async function loadPlayerData(uid, nowTimestamp) {
        const userDocRef = db.collection('users').doc(uid);
        try {
            const doc = await userDocRef.get();
			let autoWateredPlots = [];
            if (doc.exists) {
                // Nếu người dùng đã có dữ liệu, tải dữ liệu đó vào biến toàn cục 'playerData'
                console.log("Đã tải dữ liệu người dùng từ Firebase:", doc.data());
                const data = doc.data();

                // Cấu trúc dữ liệu mặc định để đảm bảo mọi thuộc tính đều tồn tại
                const defaultPlayerData = {
                    money: 100,
                    nickname: "Nông dân",
                    level: 1,
                    xp: 0,
                    stats: {
                        harvestedCrops: 0,
                        unlockedPlots: 3,
                        totalUpgrades: 0
                    },
                    inventory: {
                        seeds: {},
                        harvested: {},
                        items: {},
                        tools: {}
                    },
                    farmPlots: {},
                    warehouseLevel: 1,
                    warehouseUpgrade: {
                        active: false,
                        endTime: null
                    }
                      ,
                     jacksot: {
                        spins: 10,
                        sellProgress: 0,
                        storeProgress: 0,
                        history: []
                    }
                     , 
                    vongquay: {
                        lastFreeSpinDate: null
                    }
					 , 
                    settings: {
                        soundEnabled: true,
                        weatherEffectsEnabled: true,
                        notificationsEnabled: true,
                        HTTT_battat: false
                    }
                };

                // Hợp nhất dữ liệu mặc định với dữ liệu đã tải từ Firebase.
                // Bằng cách này, các thuộc tính mới như warehouseLevel sẽ được giữ lại nếu có,
                // hoặc được khởi tạo nếu chưa có, mà không làm mất dữ liệu cũ.
                playerData = {
                    ...defaultPlayerData, // Lấy nền mặc định
                    ...data, // Ghi đè bằng dữ liệu đã lưu từ server
                    // Hợp nhất các đối tượng lồng nhau một cách an toàn để tránh mất dữ liệu
                    stats: { ...defaultPlayerData.stats, ...(data.stats || {}) },
                    inventory: { ...defaultPlayerData.inventory, ...(data.inventory || {}) },
                    weather: { ...defaultPlayerData.weather, ...(data.weather || {}) },
					
					settings: { ...(defaultPlayerData.settings || {}), ...(data.settings || {}) }
                };
				  // KIỂM TRA AN TOÀN CHO DỮ LIỆU THỜI TIẾT
                // Nếu người chơi cũ chưa có mảng 'upcoming', hãy tạo nó.
                if (!Array.isArray(playerData.weather.upcoming)) {
                    console.log("Dữ liệu thời tiết cũ được phát hiện. Đang tạo hàng đợi dự báo...");
                    playerData.weather.upcoming = [determineNextWeather(), determineNextWeather()];
                }
                 // Lấy ngày cuối cùng người chơi có nhiệm vụ
                const lastQuestDate = playerData.lastQuestDate || null;
                const today = new Date().toLocaleDateString(); // Lấy ngày hiện tại dưới dạng chuỗi (ví dụ: "30/5/2024")

                // Nếu không có ngày, hoặc ngày đó không phải là hôm nay -> Tạo nhiệm vụ mới
                if (!lastQuestDate || lastQuestDate !== today) {
                    console.log("Ngày mới! Tạo nhiệm vụ hàng ngày cho người chơi.");
                    
                    // 1. Lọc ra tất cả các nhiệm vụ mà người chơi đủ cấp độ để nhận
                    const availableQuests = [];
                    for (const level in QUEST_POOL) {
                        if (playerData.level >= parseInt(level)) {
                            availableQuests.push(...QUEST_POOL[level]);
                        }
                    }

                    // 2. Trộn ngẫu nhiên danh sách nhiệm vụ hợp lệ
                    const shuffledQuests = availableQuests.sort(() => 0.5 - Math.random());

                    // 3. Chọn 3 nhiệm vụ đầu tiên và định dạng lại chúng
                    const newDailyQuests = shuffledQuests.slice(0, 3).map(quest => ({
                        ...quest, // Sao chép tất cả thuộc tính từ mẫu
                        currentProgress: 0,
                        claimed: false
                    }));
                    
                    // 4. Cập nhật dữ liệu người chơi
                    playerData.dailyQuests = newDailyQuests;
                    playerData.lastQuestDate = today; // Ghi lại ngày hôm nay
                } else {
                    console.log("Đã có nhiệm vụ cho ngày hôm nay, không tạo mới.");
                }



                // Khai báo biến ở phạm vi cao hơn, khởi tạo bằng 0
               let offlineDurationSeconds = 0;

               if (playerData.lastOnline && playerData.lastOnline.toDate) {
                    const lastOnlineTimestamp = playerData.lastOnline;
                    // Lấy thời gian hiện tại từ server để so sánh
                    
                    // Gán giá trị cho biến đã khai báo, không tạo biến mới bằng 'const'
                    offlineDurationSeconds = nowTimestamp.seconds - lastOnlineTimestamp.seconds;

                    console.log(`Người chơi đã offline trong ${Math.round(offlineDurationSeconds)} giây.`);

                    // Hằng số từ các file khác để tính toán
                    const DROUGHT_CHANCE = 15;
                    const DROUGHT_CHECK_INTERVAL_S = 30;
                    const HEALTH_DRAIN_INTERVAL_S = 10;
                    const HEALTH_DRAIN_AMOUNT = 1;

                    // === BƯỚC 1: MÔ PHỎNG SỰ KHÔ HẠN CỦA ĐẤT ===
                    if (playerData.weather.current === 'nanggat') {
                        const numberOfDroughtChecks = Math.floor(offlineDurationSeconds / DROUGHT_CHECK_INTERVAL_S);
                        if (numberOfDroughtChecks > 0) {
                            console.log(`Mô phỏng ${numberOfDroughtChecks} lần kiểm tra khô hạn do nắng gắt.`);
                            for (let i = 1; i <= playerData.stats.unlockedPlots; i++) {
                                const plotNumber = String(i);
                                const plotData = playerData.farmPlots[plotNumber];
                                if (plotData && !plotData.isDry) {
                                    for (let j = 0; j < numberOfDroughtChecks; j++) {
                                        if (Math.random() * 100 < DROUGHT_CHANCE) {
                                            plotData.isDry = true;
                                            console.log(`Ô đất ${plotNumber} đã bị khô hạn trong thời gian offline.`);
                                            break; 
                                        }
                                    }
                                }
                            }
                        }
                    }

                     const isRainingOffline = playerData.weather.current === 'mua' || playerData.weather.current === 'bao';
                    if (isRainingOffline && offlineDurationSeconds > 0) {
                        // Hằng số từ các file khác
                        const FERTILITY_BOOST_INTERVAL_S = 15; // 15 giây
                        const FERTILITY_BOOST_AMOUNT = 1; // 1%
                        const WEATHER_DURATION_S = 5 * 60; // 5 phút

                        // Tính toán thời gian mưa đã diễn ra trong phiên offline
                        const timeSinceWeatherChangeMs = nowTimestamp.toMillis() - (playerData.weather.nextChangeTime - (WEATHER_DURATION_S * 1000));
                        const rainDurationDuringOfflineS = Math.min(offlineDurationSeconds, timeSinceWeatherChangeMs / 1000);

                        if (rainDurationDuringOfflineS > 0) {
                            // Tính số lần tăng độ phì nhiêu
                            const numberOfBoosts = Math.floor(rainDurationDuringOfflineS / FERTILITY_BOOST_INTERVAL_S);
                            const totalFertilityGained = numberOfBoosts * FERTILITY_BOOST_AMOUNT;
                            
                            console.log(`Mô phỏng mưa offline trong ${Math.round(rainDurationDuringOfflineS)} giây, tăng ${totalFertilityGained}% độ phì nhiêu.`);

                            if (totalFertilityGained > 0) {
                                // Lặp qua các ô đất để áp dụng hiệu ứng
                                for (let i = 1; i <= playerData.stats.unlockedPlots; i++) {
                                    const plotNumber = String(i);
                                    const plotData = playerData.farmPlots[plotNumber];

                                    if (plotData) {
                                        // Mưa sẽ làm hết khô hạn
                                        if (plotData.isDry) {
                                            plotData.isDry = false;
                                            console.log(`Ô đất ${plotNumber} đã hết khô hạn do mưa offline.`);
                                        }

                                        // Tăng độ phì nhiêu nếu chưa đầy
                                        const currentFertility = plotData.soilFertility ?? 100;
                                        const maxFertility = plotData.maxFertility || 100;
                                        if (currentFertility < maxFertility) {
                                            plotData.soilFertility = Math.min(maxFertility, currentFertility + totalFertilityGained);
                                        }
                                    }
                                }
                            }
                        }
                    }
                     // === BƯỚC 1.5: MÔ PHỎNG CỎ MỌC ===
                    const WEED_CHECK_INTERVAL_S = 20; // 20 giây mỗi lần kiểm tra
                    const numberOfWeedChecks = Math.floor(offlineDurationSeconds / WEED_CHECK_INTERVAL_S);
                    if (numberOfWeedChecks > 0) {
                        console.log(`Mô phỏng ${numberOfWeedChecks} lần kiểm tra mọc cỏ.`);
                        const spawnChance = WEED_SPAWN_CHANCE[playerData.weather.current] || WEED_SPAWN_CHANCE.default;

                        for (let i = 1; i <= playerData.stats.unlockedPlots; i++) {
                            const plotNumber = String(i);
                            const plotData = playerData.farmPlots[plotNumber];

                            // Chỉ xử lý ô đất trống
                            if (plotData && !plotData.seedId) {
                                // Kiểm tra buff bảo vệ
                                if (plotData.weedProtectionEndTime && plotData.weedProtectionEndTime > nowTimestamp.toMillis()) {
                                    // Nếu buff còn hạn, bỏ qua ô này
                                    continue; 
                                }
                                 // Khởi tạo mảng weeds nếu chưa có
                if (!plotData.weeds) {
                    plotData.weeds = [];
                }

                for (let j = 0; j < numberOfWeedChecks; j++) {
                    // Nếu đã đạt giới hạn tối đa, dừng mô phỏng cho ô đất này
                    if (plotData.weeds.length >= MAX_WEEDS_PER_PLOT) {
                        break; // Thoát khỏi vòng lặp mô phỏng cho ô đất hiện tại
                    }

                    if (Math.random() * 100 < spawnChance) {
                        // Tạo vị trí ngẫu nhiên và thêm vào mảng
                        const newWeedPosition = {
                            top: (20 + Math.random() * 50) + '%',
                            left: (20 + Math.random() * 60) + '%',
                            rotation: Math.random() * 60 - 30
                        };
                        plotData.weeds.push(newWeedPosition);
                    }
                }

                if (plotData.weeds.length > 0) {
                    console.log(`Ô đất ${plotNumber} có tổng cộng ${plotData.weeds.length} cỏ sau thời gian offline.`);
                }
                // Xóa thuộc tính weedCount cũ để dọn dẹp dữ liệu
                delete plotData.weedCount; 

                                let newWeeds = 0;
                                for (let j = 0; j < numberOfWeedChecks; j++) {
                                    if (Math.random() * 100 < spawnChance) {
                                        newWeeds++;
                                    }
                                }

                                if (newWeeds > 0) {
                                    plotData.weedCount = (plotData.weedCount || 0) + newWeeds;
                                    console.log(`Ô đất ${plotNumber} mọc thêm ${newWeeds} cỏ trong thời gian offline.`);
                                }
                            }

                        }
                    }
                    // === BƯỚC 2: TÍNH TOÁN SỰ PHÁT TRIỂN CỦA CÂY & SỨC KHỎE BỊ MẤT ===
                    for (const plotNumber in playerData.farmPlots) {
                        const plotData = playerData.farmPlots[plotNumber];

                        // --- Tính toán phát triển ---
                        // Chỉ tính cho ô có cây và chưa chín
                       if (plotData && plotData.seedId && plotData.plantedAt) {
                            // plantedAt bây giờ là một đối tượng Timestamp của Firestore
                           
                            // Kiểm tra kiểu dữ liệu của plantedAtTimestamp và lấy giá trị mili giây một cách an toàn
                           let plantedAtMillis;
                            const plantedAtValue = plotData.plantedAt;
                            if (typeof plantedAtValue === 'number') {
                                // Trường hợp 1: Dữ liệu cũ là một con số (milliseconds)
                                plantedAtMillis = plantedAtValue;
                            } else if (plantedAtValue.toDate) {
                                // Trường hợp 2: Là đối tượng Timestamp của Firestore (có phương thức toDate)
                                plantedAtMillis = plantedAtValue.toMillis();
                            } else if (plantedAtValue instanceof Date) {
                                 // Trường hợp 3: Là đối tượng Date chuẩn của JS
                                plantedAtMillis = plantedAtValue.getTime();
                            } else {
                                // Fallback an toàn, nếu không xác định được thì bỏ qua tính toán cho ô này
                                console.warn(`Không thể xác định kiểu dữ liệu thời gian cho ô ${plotNumber}`, plantedAtValue);
                                continue; // Bỏ qua vòng lặp hiện tại và sang ô tiếp theo
                            }
                            
                            const timeSincePlantedMs = nowTimestamp.toMillis() - plantedAtMillis;
                            
                            const itemInfo = allGameItems[plotData.seedId];
                            const penaltyPercent = plotData.barrenPenaltyPercent ?? 0;
                            const penaltyMultiplier = 1 + (penaltyPercent / 100);
                            const growthDurationMs = itemInfo.growthTime * 1000 * penaltyMultiplier;

                           
                        }

                        // --- Tính toán mất sức khỏe ---
                        if (plotData && plotData.seedId && plotData.isDry && (plotData.health ?? 0) > 0) {
                            const itemInfo = allGameItems[plotData.seedId];
                            // Lấy chu kỳ trừ máu từ resistances
                            const drainIntervalSeconds = itemInfo.resistances?.drought || 10;
                            // Tính số lần bị trừ máu trong thời gian offline
                            const numberOfHealthDrains = Math.floor(offlineDurationSeconds / drainIntervalSeconds);

                            if (numberOfHealthDrains > 0) {
                                const healthLost = numberOfHealthDrains * 1; // Mỗi lần trừ 1%
                                const currentHealth = plotData.health ?? 100;
                                plotData.health = Math.max(0, currentHealth - healthLost);
                                
                                if (plotData.health === 0 && !plotData.deathReason) {
                                    plotData.deathReason = 'drought';
                                }
                                console.log(`Ô ${plotNumber} bị trừ ${healthLost}% HP do khô hạn offline.`);
                            }
                        }
                    }
                }

                 // === BƯỚC 3: MÔ PHỎNG HOẠT ĐỘNG CỦA TRÂU ĂN CỎ ===
                for (const plotNumber in playerData.farmPlots) {
                    const plotData = playerData.farmPlots[plotNumber];

                    // Chỉ xử lý ô đất có trâu đang hoạt động
                    if (plotData?.buffalo?.active) {
                        console.log(`Mô phỏng hoạt động offline của trâu ở ô ${plotNumber}.`);

                        // Các hằng số từ file odat_trauanco.js
                        const WEEDS_EATEN_PER_MINUTE = 20;
                        const BUFFALO_EAT_ONE_WEED_INTERVAL_S = 60 / WEEDS_EATEN_PER_MINUTE;
                        const MAX_WEEDS_TO_EAT = 100;
                        const PLANT_HEALTH_DAMAGE_PER_WEED = 1;

                        // 1. Tính số cỏ trâu có thể ăn trong thời gian offline
                        const potentialWeedsEaten = Math.floor(offlineDurationSeconds / BUFFALO_EAT_ONE_WEED_INTERVAL_S);
                        
                        // 2. Các yếu tố giới hạn
                        const availableWeeds = (plotData.weeds || []).length;
                        const remainingCapacity = MAX_WEEDS_TO_EAT - (plotData.buffalo.weedsEaten || 0);
                        
                        // 3. Số cỏ thực tế bị ăn là giá trị nhỏ nhất trong các yếu tố trên
                        const actualWeedsEaten = Math.min(potentialWeedsEaten, availableWeeds, remainingCapacity);

                        if (actualWeedsEaten > 0) {
                            // 4. Cập nhật dữ liệu
                            // Trừ cỏ
                            plotData.weeds.splice(0, actualWeedsEaten);
                            // Tăng số cỏ đã ăn
                            plotData.buffalo.weedsEaten += actualWeedsEaten;
                            // Trừ máu cây trồng (nếu có)
                            if (plotData.seedId && (plotData.health ?? 0) > 0) {
                                plotData.health = Math.max(0, plotData.health - (actualWeedsEaten * PLANT_HEALTH_DAMAGE_PER_WEED));
                            }
                            console.log(`Trâu đã ăn ${actualWeedsEaten} cỏ ở ô ${plotNumber} khi offline.`);
                        }

                        // 5. Kiểm tra xem trâu có rời đi không
                        if ((plotData.weeds || []).length === 0 || plotData.buffalo.weedsEaten >= MAX_WEEDS_TO_EAT) {
                            console.log(`Trâu đã rời khỏi ô ${plotNumber} sau khi làm việc offline.`);
                            delete plotData.buffalo;
                        } else {
                            // 6. Nếu trâu vẫn còn, cập nhật lại thời gian hành động cuối cùng
                            plotData.buffalo.lastActionTime = nowTimestamp.toMillis();
                        }
                    }
                }

                 // === BƯỚC 4: MÔ PHỎNG SÂU BỆNH GÂY HẠI ===
                for (const plotNumber in playerData.farmPlots) {
                    const plotData = playerData.farmPlots[plotNumber];

                    // Chỉ xử lý ô đất có sâu bệnh và có cây trồng còn sống
                    // Chỉ xử lý ô đất có sâu bệnh và có cây trồng còn sống
                    if (plotData?.hasPest && plotData.seedId && (plotData.health ?? 0) > 0) {
                        const itemInfo = allGameItems[plotData.seedId];
                        // Lấy chu kỳ trừ máu từ resistances
                        const drainIntervalSeconds = itemInfo.resistances?.pest || 30;
                        // Tính số lần sâu bệnh gây hại trong thời gian offline
                        const numberOfDamageTicks = Math.floor(offlineDurationSeconds / drainIntervalSeconds);
                        
                        if (numberOfDamageTicks > 0) {
                            const totalDamage = numberOfDamageTicks * 1; // Mỗi lần trừ 1%
                            const currentHealth = plotData.health ?? 100;
                            
                            plotData.health = Math.max(0, currentHealth - totalDamage);
							  
                            if (plotData.health === 0 && !plotData.deathReason) {
                                plotData.deathReason = 'pest';
                            }
                            
                            console.log(`Ô đất ${plotNumber} bị sâu bệnh tấn công offline, mất ${totalDamage.toFixed(2)}% sức khỏe.`);
                        }
                    }
                }
				//  THÊM BƯỚC 5: MÔ PHỎNG THIỆT HẠI BÃO/TUYẾT
                for (const plotNumber in playerData.farmPlots) {
                    const plotData = playerData.farmPlots[plotNumber];

                    // Chỉ xử lý ô có cây và còn sống
                    if (plotData && plotData.seedId && (plotData.health ?? 0) > 0) {
						 const itemInfo = allGameItems[plotData.seedId];
                        
                        // Nếu không tìm thấy thông tin cây, bỏ qua để tránh lỗi
                        if (!itemInfo) {
                            console.warn(`Không tìm thấy thông tin cho cây ${plotData.seedId} ở ô ${plotNumber} khi mô phỏng offline.`);
                            continue;
                        }
                       
                        let drainIntervalSeconds = 0;
                        let weatherType = '';

                        // Xác định loại thiệt hại thời tiết
                        if (playerData.weather.current === 'bao') {
                            drainIntervalSeconds = itemInfo.resistances?.storm || 60;
                            weatherType = 'storm';
                        } else if (playerData.weather.current === 'tuyetroi') {
                            drainIntervalSeconds = itemInfo.resistances?.snow || 999999;
                            weatherType = 'snow';
                        }

                        if (drainIntervalSeconds > 0 && drainIntervalSeconds < 999999) {
                            const numberOfDamageTicks = Math.floor(offlineDurationSeconds / drainIntervalSeconds);
                            if (numberOfDamageTicks > 0) {
                                const totalDamage = numberOfDamageTicks * 1;
                                const currentHealth = plotData.health ?? 100;
                                plotData.health = Math.max(0, currentHealth - totalDamage);

                                if (plotData.health === 0 && !plotData.deathReason) {
                                    plotData.deathReason = weatherType;
                                }
                                console.log(`Ô ${plotNumber} bị trừ ${totalDamage}% HP do ${weatherType} khi offline.`);
                            }
                        }
                    }
                }
				 // Sau khi đã tính toán các hiệu ứng cơ bản, gọi hàm mô phỏng HTTT
                if (offlineDurationSeconds > 0 && typeof window.simulateOfflineProgression === 'function') {
                    // Lưu kết quả trả về từ hàm mô phỏng
                    autoWateredPlots = window.simulateOfflineProgression(offlineDurationSeconds);
                }


                // Xóa trường lastOnline sau khi tính toán
                delete playerData.lastOnline;
                  // Reset trạng thái "bận" trên client trước khi kiểm tra để đảm bảo sạch sẽ.
            window.cleaningTaskSlots.player = null;
            window.cleaningTaskSlots.hired = null;

            // Quét qua tất cả các ô đất để khôi phục lại trạng thái dọn cỏ đang diễn ra.
            for (const plotNumber in playerData.farmPlots) {
                const plotData = playerData.farmPlots[plotNumber];
                
                // Chỉ kiểm tra những ô có công việc dọn cỏ đang hoạt động
                if (plotData && plotData.cleaningWeeds && plotData.cleaningWeeds.active) {
                    
                    // Trường hợp người chơi đang dọn thủ công
                    if (plotData.cleaningWeeds.cleanerType === 'player') {
                        window.cleaningTaskSlots.player = plotNumber;
                        console.log(`Phát hiện và khôi phục trạng thái người chơi đang dọn cỏ tại ô đất ${plotNumber}.`);
                    } 
                    // Trường hợp người thuê đang dọn
                    else if (plotData.cleaningWeeds.cleanerType === 'hired') {
                        window.cleaningTaskSlots.hired = plotNumber;
                        console.log(`Phát hiện và khôi phục trạng thái người dọn cỏ thuê đang bận tại ô đất ${plotNumber}.`);
                    }
                }
            }
            

            } else {
                // Nếu là người chơi mới, tạo dữ liệu mặc định trong Firebase
                // Dùng chính đối tượng 'playerData' mặc định từ gamedata.js để tạo
                console.log("Người dùng mới, tạo dữ liệu mặc định trên Firebase.");
                // Lưu ý: Đảm bảo playerData từ gamedata.js đã bao gồm các trường mới
                await userDocRef.set(playerData);
            }

            // Cập nhật giao diện người dùng với dữ liệu vừa tải/tạo
            document.getElementById('so-tien-hien-tai').textContent = playerData.money;
			return autoWateredPlots; // Trả về kết quả

        } catch (error) {
            console.error("Lỗi khi tải/tạo dữ liệu người dùng:", error);
            // Hiển thị lỗi và ném ra để ngăn quá trình đăng nhập tiếp tục
            showErrorModal("Đã xảy ra lỗi khi tải dữ liệu của bạn. Vui lòng thử lại.");
            throw error;
        }
    }

    // =========================================================================
    // XỬ LÝ SỰ KIỆN CHÍNH
    // =========================================================================

    // Tải thông tin đăng nhập đã lưu từ localStorage
    const savedEmail = localStorage.getItem('savedEmail');
    if (savedEmail) {
        emailInput.value = savedEmail;
        passwordInput.value = localStorage.getItem('savedPassword') || ''; // an toàn hơn nếu pass là null
        rememberMeCheckbox.checked = true;
    }

    // Khi người dùng bỏ tick "Ghi nhớ", xóa thông tin đã lưu
    rememberMeCheckbox.addEventListener('change', function() {
        if (!this.checked) {
            localStorage.removeItem('savedEmail');
            localStorage.removeItem('savedPassword');
        }
    });

    // Sự kiện khi người dùng nhấn nút "Đăng nhập"
     loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        loginError.textContent = '';
        showLoadingModal("Đang đăng nhập...");

        const email = emailInput.value;
        const password = passwordInput.value;

        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Xử lý ghi nhớ đăng nhập
            if (rememberMeCheckbox.checked) {
                localStorage.setItem('savedEmail', email);
                localStorage.setItem('savedPassword', password);
            } else {
                localStorage.removeItem('savedEmail');
                localStorage.removeItem('savedPassword');
            }
            
            // Sau khi xác thực thành công, gọi hàm xử lý chung để tải game
            // auth.onAuthStateChanged sẽ tự động bắt được sự thay đổi này và xử lý
            // Tuy nhiên, để đảm bảo tốc độ, chúng ta có thể gọi trực tiếp ở đây
            // await processLoginAndLoadGame(user.uid); 
            // Dòng trên không cần thiết vì onAuthStateChanged đã xử lý, để tránh chạy 2 lần

        } catch (error) {
            const errorCode = error.code;
            console.error("Lỗi trong quá trình đăng nhập:", errorCode, error.message);
            
            switch (errorCode) {
                case 'auth/invalid-login-credentials':
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                    showErrorModal('Tài khoản hoặc mật khẩu không đúng.');
                    break;
                case 'auth/too-many-requests':
                    showErrorModal('Bạn đã thử đăng nhập sai quá nhiều lần. Vui lòng thử lại sau ít phút.');
                    break;
                default:
                    showErrorModal('Đã có lỗi xảy ra khi đăng nhập. Vui lòng thử lại sau.');
            }
            hideLoadingModal(); // Quan trọng: Ẩn loading nếu có lỗi
        }
        // Không cần khối finally ở đây vì hideLoadingModal đã được gọi trong processLoginAndLoadGame
    });

    // Sự kiện khi người dùng nhấn nút "Đăng ký"
    registerButton.addEventListener('click', function() {
        loginModal.classList.remove('visible');
        loginError.textContent = ''; // Xóa lỗi khi chuyển modal
        setTimeout(() => {
            registerModal.classList.add('visible');
        }, 200);
    });
   async function loadAllItemsFromFirebase() {
    try {
        console.log("Bắt đầu tải dữ liệu vật phẩm (items) từ Firebase...");
        const itemsSnapshot = await db.collection('items').get();
        
        itemsSnapshot.forEach(doc => {
            const itemData = doc.data();
            const itemId = doc.id;

            // Thêm hoặc cập nhật vật phẩm vào đối tượng allGameItems toàn cục
            // Điều này hợp nhất dữ liệu từ nhiều collection vào một nơi duy nhất
            allGameItems[itemId] = {
                id: itemId, // Đảm bảo ID luôn có
                ...itemData
            };
        });

        console.log("Đã tải xong dữ liệu vật phẩm (items).");

    } catch (error) {
        console.error("Lỗi nghiêm trọng khi tải dữ liệu vật phẩm từ Firebase:", error);
        alert("Không thể tải dữ liệu vật phẩm cần thiết. Vui lòng kiểm tra kết nối mạng.");
        throw error;
    }
}
async function loadAllToolsFromFirebase() {
    try {
        console.log("Bắt đầu tải dữ liệu đạo cụ (tools) từ Firebase...");
        const toolsSnapshot = await db.collection('tools').get();
        
        toolsSnapshot.forEach(doc => {
            const toolData = doc.data();
            const toolId = doc.id;
            allGameItems[toolId] = {
                id: toolId,
                type: 'tool', 
                ...toolData
            };
        });

        console.log("Đã tải xong dữ liệu đạo cụ.");

    } catch (error) {
        console.error("Lỗi nghiêm trọng khi tải dữ liệu đạo cụ từ Firebase:", error);
        alert("Không thể tải dữ liệu đạo cụ cần thiết. Vui lòng kiểm tra kết nối mạng.");
        throw error;
    }
}
});
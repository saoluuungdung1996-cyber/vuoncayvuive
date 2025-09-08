// =================================================================
// FILE: modal_taikhoan_banbe.js
// MÔ TẢ: Xử lý hiển thị, ẩn và chuyển tab cho modal danh sách bạn bè.
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    const friendsModal = document.getElementById('friends-modal');
    if (!friendsModal) return;

    const closeButton = friendsModal.querySelector('.friends-modal-close-btn');
    const tabButtons = friendsModal.querySelectorAll('.friend-tab-button');
    const tabContents = friendsModal.querySelectorAll('.friend-tab-content');

    // START: Hàm mới để render danh sách bạn bè
    window.renderFriendsList = async function() {   
        const listContainer = document.getElementById('friends-list-tab');
        listContainer.innerHTML = '<p>Đang tải danh sách bạn bè...</p>';

        const friendUids = playerData.friends || [];
        if (friendUids.length === 0) {
            listContainer.innerHTML = '<p>Bạn chưa có người bạn nào. Hãy kết bạn thêm nhé!</p>';
            return;
        }

        try {
    // Bước 1: Lấy danh sách trạng thái của tất cả bạn bè
    const statusPromises = friendUids.map(uid => db.collection('userStatus').doc(uid).get());
    const statusDocs = await Promise.all(statusPromises);

    // Tạo một Map để lưu trữ last_active timestamp của những người bạn
    const activityMap = new Map();
    statusDocs.forEach(doc => {
        if (doc.exists) {
            activityMap.set(doc.id, doc.data().last_active);
        }
    });

    // Bước 2: Lấy thông tin chi tiết của từng người bạn (như cũ)
    const friendPromises = friendUids.map(uid => db.collection('users').doc(uid).get());
    const friendDocs = await Promise.all(friendPromises);

    let friendsHTML = '<ul class="friend-list">';
    friendDocs.forEach(doc => {
        if (doc.exists) {
            const friendData = doc.data();
            const displayName = friendData.email ? friendData.email.split('@')[0] : "Người chơi";
            
            // Bước 3: Kiểm tra xem người bạn có online không
            const lastActiveTimestamp = activityMap.get(doc.id);
            let isOnline = false;

            if (lastActiveTimestamp) {
                // Chuyển timestamp của server thành mili giây
                const lastActiveMillis = lastActiveTimestamp.toMillis();
                // So sánh với thời gian hiện tại. Nếu hoạt động trong vòng 2 phút qua -> online.
                if (Date.now() - lastActiveMillis < 30 * 1000) { // 2 phút
                    isOnline = true;
                }
            }
            
            const onlineClass = isOnline ? 'online' : '';

            // ** CHỈNH SỬA: Thêm data-uid vào thẻ li **
            friendsHTML += `
                <li class="friend-item ${onlineClass}" data-nickname="${displayName}" data-uid="${doc.id}">
                    <span>[Cấp ${friendData.level}] ${displayName}</span>
                    <button class="remove-friend-btn" data-uid="${doc.id}">Hủy KB</button>
                </li>`;
        }
    });
    friendsHTML += '</ul>';
    listContainer.innerHTML = friendsHTML;

} catch (error) {
    console.error("Lỗi khi tải danh sách bạn bè:", error);
    listContainer.innerHTML = '<p>Không thể tải danh sách bạn bè.</p>';
}
    }
    // END: Hàm mới để render danh sách bạn bè

    // START: Hàm mới để render thông báo/lời mời
    function renderFriendRequests() {
        const notificationsContainer = document.getElementById('friends-notifications-tab');
        notificationsContainer.innerHTML = '<p>Đang kiểm tra thông báo...</p>';

        const currentUserUid = auth.currentUser.uid;
        db.collection('users').doc(currentUserUid).collection('friendRequests')
          .where('status', '==', 'pending')
          .onSnapshot(snapshot => {
              if (snapshot.empty) {
                  notificationsContainer.innerHTML = '<p>Bạn không có lời mời kết bạn nào.</p>';
                  return;
              }

              let requestsHTML = '<ul class="friend-request-list">';
              snapshot.forEach(doc => {
                  const request = doc.data();
                  requestsHTML += `
                      <li class="friend-request-item">
                          <span><strong>${request.senderNickname}</strong> muốn kết bạn với bạn.</span>
                          <div class="request-actions">
                              <button class="accept-btn" data-sender-uid="${request.senderUid}">Đồng ý</button>
                              <button class="decline-btn" data-sender-uid="${request.senderUid}">Từ chối</button>
                          </div>
                      </li>`;
              });
              requestsHTML += '</ul>';
              notificationsContainer.innerHTML = requestsHTML;
          });
    }
    // END: Hàm mới để render thông báo/lời mời

    // START: Chỉnh sửa hàm showFriendsModal
    function showFriendsModal() {
        if (friendsModal) {
            friendsModal.classList.add('visible');
            // Tự động tải dữ liệu cho tab đang active khi mở modal
            if (friendsModal.querySelector('[data-tab="friends-list-tab"]').classList.contains('active')) {
                renderFriendsList();
            } else {
                renderFriendRequests();
            }
        }
    }
    // END: Chỉnh sửa hàm showFriendsModal

    function hideFriendsModal() {
        if (friendsModal) {
            friendsModal.classList.remove('visible');
        }
    }

    window.showFriendsModal = showFriendsModal;

    if (closeButton) {
        closeButton.addEventListener('click', hideFriendsModal);
    }

    // START: Chỉnh sửa xử lý chuyển tab
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            const activeTabContent = document.getElementById(tabId);
            if (activeTabContent) {
                activeTabContent.classList.add('active');
            }

            // Tải lại dữ liệu khi chuyển tab
            if (tabId === 'friends-list-tab') {
                renderFriendsList();
            } else if (tabId === 'friends-notifications-tab') {
                renderFriendRequests();
            }
        });
    });
    // Chỉnh sửa xử lý chuyển tab

    // Thêm logic xử lý sự kiện đồng ý/từ chối
    const notificationsContainer = document.getElementById('friends-notifications-tab');
    notificationsContainer.addEventListener('click', async (e) => {
        const senderUid = e.target.dataset.senderUid;
        if (!senderUid) return;

        const currentUserUid = auth.currentUser.uid;
        const requestRef = db.collection('users').doc(currentUserUid).collection('friendRequests').doc(senderUid);

        if (e.target.classList.contains('accept-btn')) {
            try {
                const batch = db.batch();

                // 1. Cập nhật trạng thái lời mời -> accepted
                batch.update(requestRef, { status: 'accepted' });

                // 2. Thêm bạn vào danh sách của cả hai người
                const currentUserRef = db.collection('users').doc(currentUserUid);
                const senderUserRef = db.collection('users').doc(senderUid);
                
                batch.update(currentUserRef, { friends: firebase.firestore.FieldValue.arrayUnion(senderUid) });
                batch.update(senderUserRef, { friends: firebase.firestore.FieldValue.arrayUnion(currentUserUid) });

                await batch.commit();

                 // Dữ liệu local và giao diện sẽ được onSnapshot trong modal-dangnhap.js tự động cập nhật.
            showGeneralNotification("Kết bạn thành công!", 'success');

            } catch (error) {
                console.error("Lỗi khi đồng ý kết bạn:", error);
                showGeneralNotification("Có lỗi xảy ra, không thể đồng ý.", "warning");
            }
        } else if (e.target.classList.contains('decline-btn')) {
            // Đơn giản là xóa lời mời
            await requestRef.delete();
            showGeneralNotification("Đã từ chối lời mời.", 'info');
        }
    });
    const friendsListContainer = document.getElementById('friends-list-tab');
    friendsListContainer.addEventListener('click', async (e) => {
        // ** LOGIC MỚI: Xử lý click vào thông tin bạn bè **
        const friendItem = e.target.closest('.friend-item');
        if (friendItem && !e.target.classList.contains('remove-friend-btn')) {
            const friendUid = friendItem.dataset.uid;
            if (!friendUid) return;

            try {
                const doc = await db.collection('users').doc(friendUid).get();
                if (doc.exists) {
                    const friendData = { uid: doc.id, ...doc.data() };
                    if (typeof window.showFriendInfoModal === 'function') {
                        window.showFriendInfoModal(friendData);
                    }
                } else {
                    showGeneralNotification("Không tìm thấy thông tin người chơi này.", "warning");
                }
            } catch (error) {
                console.error("Lỗi khi lấy thông tin bạn bè:", error);
                showGeneralNotification("Không thể tải thông tin.", "warning");
            }
            return; // Dừng lại để không chạy logic hủy KB bên dưới
        }
        
        // ** LOGIC CŨ: Xử lý hủy kết bạn **
        if (e.target.classList.contains('remove-friend-btn')) {
            const friendUid = e.target.dataset.uid;
            const friendNickname = friendItem ? friendItem.dataset.nickname : "người bạn này";

            showUnfriendConfirmModal(friendUid, friendNickname, () => {
                renderFriendsList();
            });
        }
    }); 
   
});
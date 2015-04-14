function showUserForm() {
    var userForm = document.getElementById('userform');
    userForm.classList.remove('hide');
}

function initUserPanel() {
    updateUserInfo();
    var userForm = document.getElementById('userform');
    userForm.children[0].onsubmit = changeName;
}

function updateUserInfo() {
    var userInfo = document.getElementById('userinfo');

    userInfo.innerHTML =
        '<span class="username"> Hi, ' + user + '!</span> ' +
        '<a class="userhint" onclick="showUserForm();">Change?</a>';
}

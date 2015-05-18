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

    loadUserStatistics(projectName, user, getTotalHexagonsFromStatistics());
}

function getTotalHexagonsFromStatistics() {
    var text = document.getElementById('hexagonstatistics').innerHTML;
    var start = text.indexOf('of ') + 3;
    return +text.substr(start);
}

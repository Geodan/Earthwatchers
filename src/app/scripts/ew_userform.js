function showUserForm() {
    var userform = document.getElementById('userform');
    userform.classList.remove('hide');
}

function initUserpanel() {
    updateUserinfo();
    var userform = document.getElementById('userform');
    userform.children[0].onsubmit = changeName;
}

function updateUserinfo() {
    var userinfo = document.getElementById('userinfo');

    userinfo.innerHTML =
        '<span class="username"> Hi, ' + user + '!</span> ' +
        '<a class="userhint" onclick="showUserForm();">Change?</a>';
}

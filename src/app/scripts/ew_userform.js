function showUserForm() {
    var userForm = document.getElementById('userform');
    if(userForm.classList.length==2){
        userForm.classList.remove('hide');
        var userLink = document.getElementById('userhint');
        userLink.innerHTML = "Close";
    }
    else{
        userForm.classList.add('hide');
        var userLink = document.getElementById('userhint');
        userLink.innerHTML = "Change?";
    }
    
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
            '<a class="userhint" id="userhint" onclick="showUserForm();">Change?</a>';

}

function getTotalHexagonsFromStatistics() {
    var text = document.getElementById('hexagonstotal').innerHTML;
    return text;
}

function compare(a, b) {
    if (a.properties.Published < b.properties.Published) {
        return -1;
    }
    if (a.properties.Published > b.properties.Published) {
        return 1;
    }
    return 0;
}

function random(low, high) {
    return Math.random() * (high - low) + low;
}


function changeName(event) {
    var form = event.target;
    var newName = form.children[0].value;

    // stop from saving empty name
    if (!newName) return false;

    user = newName;
    updateUsername(newName);

    // clean and hide form
    form.parentElement.classList.add('hide');
    form.children[0].value = '';

    updateUserInfo();
    
    loadUserStatistics(projectName, user, getTotalHexagonsFromStatistics());
    goToGeohexCode(geohexCode);

    return false;
}

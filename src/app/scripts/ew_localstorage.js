function saveObservation(observationString) {
    localStorage.setItem(
            localStoragePrefix + (new Date()).getTime(), observationString);
}

function updateUsername(username) {
    localStorage.setItem(localStoragePrefix + 'user', username);
}


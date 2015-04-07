function saveObservation(observationString) {
    localStorage.setItem(
            localStoragePrefix + (new Date()).getTime(), observationString);
}

function updateUsername(user) {
    localStorage.setItem(localStoragePrefix + 'user', user);
}


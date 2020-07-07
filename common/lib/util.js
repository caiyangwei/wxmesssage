async function sleep(time) {
    return new Promise((resolve, rejects) => {
        setTimeout(() => {
            resolve();
        }, time);
    });
}

function isHaseKey(array, element) {
    if (array.length === 0) return false;
    if (!element) return false;
    for (let i = 0; i < array.length; i++) {
        if (element === array[i]) return true;
    }
    return false;
}


module.exports = {
    sleep,
    isHaseKey
}
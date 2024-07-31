exports.tryRequire = function (fakeObj, ...param) {
    try {
        return require.apply(global, param);
    } catch (e) {
        return fakeObj;
    }
}
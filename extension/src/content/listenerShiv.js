(() => {
    Object.defineProperty(Document.prototype, 'hasFocus', {
        configurable: true,
        writable: true,
        value: () => true,
    });

    const BLOCKED = new Set([
        'focus', 'blur',
        'visibilitychange', 'webkitvisibilitychange',
        'pagehide', 'pageshow',
    ]);

    const shim = (Proto) => {
        const add = Proto.addEventListener;
        const del = Proto.removeEventListener;

        Proto.addEventListener = function (t, h, o) { return BLOCKED.has(t) ? undefined : add.call(this, t, h, o); };
        Proto.removeEventListener = function (t, h, o) { return BLOCKED.has(t) ? undefined : del.call(this, t, h, o); };
    };

    shim(Window.prototype);
    shim(Document.prototype);

    const winAdd = window.addEventListener.bind(window);
    window.addEventListener = (t, h, o) => (BLOCKED.has(t) ? undefined : winAdd(t, h, o));
})();

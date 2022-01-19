const cacheName = 'fba';
const staticAssets = [
    './',
    './index.html',

    './assets/css/custom.css',
    './assets/js/scripts.js',

    './assets/vendor/bcmath.js',
    './assets/vendor/jquery-3.4.1.min.js',
    './assets/vendor/moment.js',
    './assets/vendor/libbcmath.js',
    './assets/vendor/pdf417.js',

    './assets/vendor/bootstrap/css/bootstrap.min.css',
    './assets/vendor/bootstrap/js/bootstrap.bundle.min.js',

    './assets/vendor/fontawesome/css/all.min.css',
    './assets/vendor/fontawesome/webfonts/fa-regular-400.eot',
    './assets/vendor/fontawesome/webfonts/fa-regular-400.svg',
    './assets/vendor/fontawesome/webfonts/fa-regular-400.ttf',
    './assets/vendor/fontawesome/webfonts/fa-regular-400.woff',
    './assets/vendor/fontawesome/webfonts/fa-regular-400.woff2',
    './assets/vendor/fontawesome/webfonts/fa-solid-900.eot',
    './assets/vendor/fontawesome/webfonts/fa-solid-900.svg',
    './assets/vendor/fontawesome/webfonts/fa-solid-900.ttf',
    './assets/vendor/fontawesome/webfonts/fa-solid-900.woff',
    './assets/vendor/fontawesome/webfonts/fa-solid-900.woff2',

    './assets/vendor/tempusdominus/tempusdominus-bootstrap-4.min.css',
    './assets/vendor/tempusdominus/tempusdominus-bootstrap-4.min.js',
];

self.addEventListener('install', async e => {
    const cache = await caches.open(cacheName);
    await cache.addAll(staticAssets);
    return self.skipWaiting();
});

self.addEventListener('activate', e => {
    self.clients.claim();
});

self.addEventListener("fetch", function (event) {
    event.respondWith(
        caches.match(event.request).then(function (response) {
            if (response) {
                return response;
            }
            return fetch(event.request);
        })
    );
});
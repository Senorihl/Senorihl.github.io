if (!Element.prototype.matches) {
    Element.prototype.matches =
    Element.prototype.msMatchesSelector ||
    Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.closest) {
    Element.prototype.closest = function(s) {
        var el = this;

        do {
            if (Element.prototype.matches.call(el, s)) return el;
            el = el.parentElement || el.parentNode;
        } while (el !== null && el.nodeType === 1);

        return null;
    };
}

var elements = document.querySelectorAll('[data-gh]');
var promises = {};

for (var i = 0; i < elements.length; i++) {
    var element = elements[i];
    var kind = element.getAttribute('data-gh');
    var user = element.getAttribute('data-gh-user');
    var repo = element.getAttribute('data-gh-repo');
    if (kind && user && repo) {
        var url = new URL('https://api.github.com/search/repositories');
        var params = {q: 'user:'+ user +' repo:'+repo+' ' + repo};
        url.search = new URLSearchParams(params).toString();
        
        if (!promises[url.toString()]) {
            promises[url.toString()] = fetch(url).then(function (data) { return data.json(); });
        }

        Promise.all([
                new Promise(function (res) { res(kind) }), 
                promises[url.toString()],
                new Promise(function (res) { res(element) }), 
            ])
            .then(function (data) {
                if (typeof data[1].items[0][data[0]] !== "undefined") {
                    data[2].textContent = data[1].items[0][data[0]];
                }
            });
    } else if (kind == "followers" && user) {
        var url = new URL('https://api.github.com/users/' + user + '/followers');
        
        if (!promises[url.toString()]) {
            promises[url.toString()] = fetch(url).then(function (data) { return data.json(); });
        }

        Promise.all([
                promises[url.toString()],
                new Promise(function (res) { res(element) }), 
            ])
            .then(function (data) {
                if (typeof data[0].length === "number") {
                    data[1].textContent = data[0].length;
                }
            });
    }
}
document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.local.get("html", function(item) {
        if (item.html != undefined) {
            document.getElementById("table").innerHTML = item.html;
        }
    })
    document.getElementById("clear_button").addEventListener("click", function() {
        chrome.storage.local.clear();
        window.location.reload(false);
    });
});

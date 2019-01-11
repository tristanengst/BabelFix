document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.local.get("html", function(item) {
        document.getElementById("table").innerHTML = item.html;
    })
});

document.getElementById("clear_button").addEventListener("click", clear());

function clear() {
    chrome.runtime.sendMessage({greeting: "clear_html_string"});
}

document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.local.get("html", function(item) {
        if (item.html != undefined) {
            document.getElementById("table").innerHTML = item.html;
        }
    })
    chrome.storage.local.get("language_number", function(item) {
        if (item.language_number != undefined) {
            document.getElementById("language_selector").selectedIndex = item.language_number;
        }
    })
    document.getElementById("clear_button").addEventListener("click", function() {
        chrome.runtime.sendMessage({greeting: "clear_words"}, function(response) {
            window.location.reload(false);
        });
    });
    document.getElementById("language_selector").onchange = function() {
        var new_language = document.getElementById("language_selector").value;
        chrome.extension.getBackgroundPage().update_language(new_language);
    };
});

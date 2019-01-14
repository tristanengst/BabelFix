document.addEventListener("DOMContentLoaded", function () {
    chrome.storage.local.get(null, function(item) {
        document.getElementById("table").innerHTML = item.html;
        var language_number = get_language_number(item.language);
        document.getElementById("language_selector").selectedIndex = language_number;
    })
    document.getElementById("clear_button").addEventListener("click", function() {
        chrome.storage.local.set({html: ""});
    });
    document.getElementById("language_selector").onchange = function() {
        var new_language = document.getElementById("language_selector").value;
        chrome.storage.local.set({language: new_language});
        var language_number = get_language_number(new_language);
        document.getElementById("language_selector").selectedIndex = language_number;
    };
});

//Returns the number associated with a language so that the <select> in
//  popup.html can display properly
function get_language_number(language) {
    var languages = ["", "FRENCH", "MANDARIN", "SPANISH"];
    for (var i = 0; i < languages.length; i++) {
        if (languages[i] == language) return i - 1;
    }
    return -1;
}

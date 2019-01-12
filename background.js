//An enum storing information to make this work for supported languages_enum
var languages_enum = {
    BURMESE: {to_english_url: "", from_english_url: "", conjugation_url: "", search_positioner: ""},
    FRENCH: {to_english_url: "https://www.wordreference.com/fren/", from_english_url: "https://www.wordreference.com/enfr/", conjugation_url: "https://www.wordreference.com/conj/FrVerbs.aspx?v=", search_positioner: "/"},
    HUNGARIAN: {to_english_url: "", from_english_url: "", conjugation_url: "", search_positioner: ""},
    MANDARIN: {to_english_url: "https://www.wordreference.com/zhen/", from_english_url: "https://www.wordreference.com/enzh/", conjugation_url: "", search_positioner: ""},
    SPANISH: {to_english_url: "https://www.wordreference.com/es/en/translation.asp?spen=", from_english_url: "https://www.wordreference.com/es/translation.asp?tranword=", conjugation_url: "https://www.wordreference.com/conj/EsVerbs.aspx?v=", search_positioner: "="},
};

//An array storing the supported languages
var languages = ["BURMESE", "FRENCH", "HUNGARIAN", "MANDARIN", "SPANISH"];

//Stores the window ID of the window currently displaying translations
var new_window_ID = null;

//Injected code which returns selected text
var code_injection = function() {
    return window.getSelection().toString().trim();
}

//An object to store the HTML string passed to popup.js containing the words to save
var storage_object = {html: "", language: "", language_number: -1};

//Closes the current translation window if it exists and opens a new translation
//window corresponding to the selected text
function display_reference(result, type) {
    chrome.storage.local.get("language", function(returned_language) {
        chrome.storage.local.get("language", function(item) {
            var link;
            if (type === "dictionary") link = languages_enum[item.language].to_english_url + result;
            else if (item.language != "MANDARIN" && item.language!= "BURMESE") link = languages_enum[item.language].conjugation_url + result;
            else return;
            if (new_window_ID != null) chrome.windows.remove(new_window_ID, function() {
                if (chrome.runtime.lastError) {} //do nothing! This error is created when the user manually closes the window
            }); //This could probably be done without creating a new window each time
            chrome.windows.create({url: link, width: 480, height: 480, focused: true, type: "popup"}, function(new_window) {
                    new_window_ID = new_window.id;
                }
            );
        });
    });
}

//When commanded, fetches the selected text, displays a reference to that text, and stores the text
chrome.commands.onCommand.addListener(function(command) {
    if (command === 'display-dictionary-reference') {
        chrome.tabs.executeScript({code: '(' + code_injection + ')()', allFrames: true}, function(result) {
                if (result != "") {
                    display_reference(result, "dictionary");
                    storage_object.html = storage_object.html + '<tr>' + result + '</tr> <br>';
                    chrome.storage.local.set(storage_object);
                }
                if (chrome.runtime.lastError) {
                    alert("error: ", chrome.runtime.lastError);
                }
            }
        );
    }
});

//When an English-to-French search is made, log what the search was on
chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
    chrome.storage.local.get("language", function(returned_language) {
        chrome.storage.local.get("language", function(item) {
            if (changeInfo.status == 'complete' && tab.active && tab.url.includes(languages_enum[item.language].from_english_url)) {
                var search_position = tab.url.lastIndexOf(languages_enum[item.language].search_positioner) + 1;
                var search = tab.url.substring(search_position)
                storage_object.html = storage_object.html + '<tr>' + search + '</tr> <br>';
                chrome.storage.local.set(storage_object);
            }
        });
    });
});

//When commanded, fetches the selected text, displays a list of conjugations for that text
chrome.commands.onCommand.addListener(function(command) {
    if (command === 'display-conjugation-reference') {
        chrome.tabs.executeScript({code: '(' + code_injection + ')()', allFrames: true}, function(result) {
                if (result != "") {
                    display_reference(result, "conjugation");
                    storage_object.html = storage_object.html + '<tr> (conjugate) ' + result + '</tr> <br>';
                    chrome.storage.local.set(storage_object);
                }
                if (chrome.runtime.lastError) {
                    alert("error: 2", chrome.runtime.lastError);
                }
            }
        );
    }
});

function get_language_number(language_to_check) {
    for (var i =  0; i < languages.length; i++) {
        if (language_to_check == languages[i]) return i;
    }
    return -1;
}

//Prompts the user to update the language
function update_language(language_to_check) {
    storage_object.language = language_to_check;
    storage_object.language_number = get_language_number(language_to_check);
    chrome.storage.local.set(storage_object);
}

//Listener which listens for whether or not to clear the stored words
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.greeting == "clear_words") {
        if (confirm("Clear saved words?")) {
            storage_object.html = "";
            chrome.storage.local.set(storage_object);
        }
    }
    sendResponse({farewell: storage_object.language});
});

var install_notification = {
    type: "basic",
    title: "BabelFix Installed!",
    message: "Make sure to select a language",
    iconUrl: "icon.png",

};

chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason == "install") {
        chrome.notifications.create(install_notification);
    }
});

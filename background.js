//An enum storing information to make this work for supported languages_enum
var languages_enum = {
    FRENCH: {to_english_url: "https://www.wordreference.com/fren/", from_english_url: "https://www.wordreference.com/enfr/", conjugation_url: "https://www.wordreference.com/conj/FrVerbs.aspx?v=", search_positioner: "/"},
    MANDARIN: {to_english_url: "https://www.wordreference.com/zhen/", from_english_url: "https://www.wordreference.com/enzh/", conjugation_url: "", search_positioner: ""},
    SPANISH: {to_english_url: "https://www.wordreference.com/es/en/translation.asp?spen=", from_english_url: "https://www.wordreference.com/es/translation.asp?tranword=", conjugation_url: "https://www.wordreference.com/conj/EsVerbs.aspx?v=", search_positioner: "="},
};

//Stores the window ID of the window currently displaying translations
var new_window_ID = null;

//Injected code which returns selected text
var code_injection = function() {
    return window.getSelection().toString().trim();
}

//Code to run when the extension is installed or updated
chrome.runtime.onInstalled.addListener(function(details) {
    chrome.storage.local.set({html: "", language: ""});
    if (details.reason == "install") give_notification("installation");
});

//Closes the current reference window if it exists and opens a new reference
//  window as appropriate
function display_reference(result, type, language) {
    var link;
    if (type === "dictionary") link = languages_enum[language].to_english_url + result;
    else if (type === "conjugation" && language != "MANDARIN") link = languages_enum[language].conjugation_url + result;
    else return;
    if (new_window_ID != null) chrome.windows.remove(new_window_ID, function() {
        if (chrome.runtime.lastError) {} //do nothing! This error is created when the user manually closes the window
    }); //This could probably be done without creating a new window each time
    chrome.windows.create({url: link, width: 480, height: 480, focused: true, type: "popup"}, function(new_window) {
            new_window_ID = new_window.id;
        }
    );
}

//Calls a function to appropriately process selected text
chrome.commands.onCommand.addListener(function(command) {
    if (command === 'display-dictionary-reference') {
        chrome.storage.local.get(null, function(item) {
            if (item.language == "") {
                give_notification("language_needed");
                return;
            }
            process_input("dictionary", item.language, item.html);
        });
    }
});

//Calls a function to appropriately process selected text
chrome.commands.onCommand.addListener(function(command) {
    if (command === 'display-conjugation-reference') {
        chrome.storage.local.get(null, function(item) {
            if (item.language == "") {
                give_notification("language_needed");
                return;
            }
            process_input("conjugation", item.language, item.html);
        });
    }
});

//Displays a reference for the selected text, as appropriate, and logs the selected text
function process_input(type, language, html) {
    chrome.tabs.executeScript({code: '(' + code_injection + ')()', allFrames: true}, function(result) {
            if (result != "") {
                if (type == "dictionary") {
                    display_reference(result, "dictionary", language);
                    var updated_html = html + '<tr>' + result + '</tr> <br>';
                    chrome.storage.local.set({html: updated_html});
                }
                else {
                    display_reference(result, "conjugation", language);
                    var updated_html = html + '<tr> (conjugate) ' + result + '</tr> <br>';
                    chrome.storage.local.set({html: updated_html});
                }
            }
            if (chrome.runtime.lastError) {
                alert("error", chrome.runtime.lastError);
            }
        }
    );
}

//When an English-to-Other Language search is made, log what the search was on
chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
    var from_english_urls = ["https://www.wordreference.com/enfr/", "https://www.wordreference.com/enzh/", "https://www.wordreference.com/es/translation.asp?tranword="];
    if (changeInfo.status == "complete") {
        for (var i = 0; i < from_english_urls.length; i++) {
            if (tab.url.includes(from_english_urls[i])) {
                chrome.storage.local.get(null, function(item) {
                    if (item.language == "") {
                        give_notification("language_needed");
                        return;
                    }
                    var search_position = tab.url.lastIndexOf(languages_enum[item.language].search_positioner) + 1;
                    var search = tab.url.substring(search_position)
                    var updated_html = item.html + '<tr>' + search + '</tr> <br>';
                    chrome.storage.local.set({html: updated_html});
                });
                break;
            }
        }
    }
});

/////////CODE PROMPTING THE USER TO SELECT A LANGUAGE//////////

//An object containing the notification sent to users on installation
var install_notification = {
    type: "basic",
    title: "BabelFix Installed",
    message: "Make sure to select a language!",
    iconUrl: "icon.png",
};

//An object containing a notification sent to users to tell them to select a
//  language
var language_unset_notification = {
    type: "basic",
    title: "It looks like BabelFix could help you now...",
    message: "But first you need to select a language!",
    iconUrl: "icon.png",
};

//Gives a notification
function give_notification(type) {
    if (type == "installation") chrome.notifications.create(install_notification);
    else if (type == "language_needed") chrome.notifications.create(language_unset_notification);
    else return;
}

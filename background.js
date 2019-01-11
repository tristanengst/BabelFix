//Stores the window ID of the window currently displaying translations
var new_window_ID = null;

//Injected code which returns selected text
var code_injection = function() {
    return window.getSelection().toString().trim();
}

//An object to store the HTML string passed to popup.js containing the words to save
var html_object = {html: ""};

//Closes the current translation window if it exists and opens a new translation
//window corresponding to the selected text
function display_reference(result) {
    var link = 'https://www.wordreference.com/fren/' + result;
    if (new_window_ID != null) chrome.windows.remove(new_window_ID, function() {}); //This could probably be done without creating a new window each time
    chrome.windows.create({url: link, width: 480, height: 480, focused: true, type: "popup"}, function(new_window) {
            new_window_ID = new_window.id;
        }
    );
}

//When commanded, fetches the selected text, displays a reference to that text, and stores the text
chrome.commands.onCommand.addListener(function(command) {
    if (command === 'display-reference') {
        chrome.tabs.executeScript({code: '(' + code_injection + ')()', allFrames: true}, function(result) {
                if (result != "") {
                    display_reference(result);
                    html_object.html = html_object.html + '<tr>' + result + '</tr> <br>';
                    chrome.storage.local.set(html_object);
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
    if (changeInfo.status == 'complete' && tab.active && tab.url.includes("https://www.wordreference.com/enfr/")) {
        var search_position = tab.url.lastIndexOf("/") + 1;
        var search = tab.url.substring(search_position)
        html_object.html = html_object.html + '<tr>' + search + '</tr> <br>';
        chrome.storage.local.set(html_object);
    }
});

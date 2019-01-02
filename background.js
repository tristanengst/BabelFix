//Injected code which returns selected text
var code_injection = function() {
    return window.getSelection().toString().trim();
}

//Stores the window ID of the window currently displaying translations
var new_window_ID = null;

//Closes the current translation window if it exists and opens a new translation
//window corresponding to the selected text
function display_reference(result) {
    var link = 'https://www.wordreference.com/fren/' + result;
    if (new_window_ID != null) {
        chrome.windows.remove(new_window_ID, function() {
                if (chrome.runtime.lastError) {
                    alert("error: ", chrome.runtime.lastError);
                }
            }
        );
    }
    chrome.windows.create({url: link, width: 480, height: 480, focused: true, type: "popup"}, function(new_window) {
            new_window_ID = new_window.id;
        }
    );
}

//Entry point to start opening appropriate windows
chrome.commands.onCommand.addListener(function(command) {
    if (command === 'display-reference') {
        chrome.tabs.executeScript({
            code: '(' + code_injection + ')()', //return window.getSelection().toString().trim();',
            allFrames: true
            },
            function(result) {
                if (result != "") {
                    display_reference(result);
                }
                if (chrome.runtime.lastError) {
                    alert("error: ", chrome.runtime.lastError);
                }
            }
        );
    }
});

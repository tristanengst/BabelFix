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

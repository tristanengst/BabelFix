//Injected code which returns selected text
//Stores the window ID of the window currently displaying translations
var new_window_ID = null;

var word_array = new Array();

var code_injection = function() {
    return window.getSelection().toString().trim();
}

var html_object = {html: ""};

//Closes the current translation window if it exists and opens a new translation
//window corresponding to the selected text
function display_reference(result) {
    var link = 'https://www.wordreference.com/fren/' + result;
    if (new_window_ID != null) {
        chrome.windows.remove(new_window_ID, function() {
                if (chrome.runtime.lastError) {
                    alert("error: ", chrome.runtime.lastError);

                    //// TODO: this error shouldn't ever be seen by the user,
                    ////       as the user may have closed the popup window
                }
            }
        );
    }
    chrome.windows.create({url: link, width: 480, height: 480, focused: true, type: "popup"}, function(new_window) {
            new_window_ID = new_window.id;
        }
    );
}

//Stores a word for later study
function store_word(word) {
    if (!word_array.includes(word)) {
        word_array.push(word);
    }
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

chrome.runtime.onMessage.addListener(function(request) {
    if (request.greeting == "clear_html_string") {
        chrome.storage.local.remove("html");
    }
});

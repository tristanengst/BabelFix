/**
 ************************** TODO: **************************
 * - Updating the extension likely deletes a user's data and langauge. (Fixed?)
 * - Switch string cleaning to regex
 */

/** Runs when the extension is installed or updated **/
 chrome.runtime.onInstalled.addListener(
     function(details) {
         if (details.reason == "install") {
             chrome.storage.local.set({html: "", language: ""});
             give_notification("installation");
         }
         else return;
     }
 );

 /** Runs when BabelFix has been activated **/
 chrome.commands.onCommand.addListener(
     function(command) {
         //Displays a dictionary reference
         if (command === 'display-dictionary-reference') {
             chrome.storage.local.get(null, function(item) {
                 if (item.language == "") give_notification("language_needed");
                 else process_input("dictionary", item.language, item.html);
             });
         }
         //Displays a conjugation reference
         else if (command === 'display-conjugation-reference') {
             chrome.storage.local.get(null, function(item) {
                 if (item.language == "") give_notification("language_needed");
                 else process_input("conjugation", item.language, item.html);
             });
         }
         else {
             alert("BabelFix error: command not recognized");
         }
     }
 );

/**
 * Information used to get data for supported languages
 *
 * (Right now some of what's here supports changes in the works)
 */
var languages_enum = {
    FRENCH: {to_english_url: "https://www.wordreference.com/fren/", from_english_url: "https://www.wordreference.com/enfr/", conjugation_url: "https://www.wordreference.com/conj/FrVerbs.aspx?v=", search_positioner: "/"},
    MANDARIN: {to_english_url: "https://www.wordreference.com/zhen/", from_english_url: "https://www.wordreference.com/enzh/", conjugation_url: "", search_positioner: ""},
    SPANISH: {to_english_url: "https://www.wordreference.com/es/en/translation.asp?spen=", from_english_url: "https://www.wordreference.com/es/translation.asp?tranword=", conjugation_url: "https://www.wordreference.com/conj/EsVerbs.aspx?v=", search_positioner: "="},
};

/**
 * The last word added to BabelFix's dictionary. This is needed to prevent
 * (bad) duplicates. Only the last word added is tracked—duplicate words are
 * allowed-with the intent of having words looked up often be ones that are
 * reviewed the most
 */
var last_word_added = null;

/**
 * The window ID of the window currently displaying translations
 */
var new_window_ID = null;

/**
 * Code which is injected to get selected text as a string
 */
var code_injection = function() {
    var string = window.getSelection().toString();
    if (string != null) return string;
    else alert("BabelFix error: code injection failed");
}

/**
 * Returns [string] after having cleaned punctuation from it and trimmed it
 *
 * Right now this is done poorly because fixing the regex will take more
 * time and I need to get back to college.
 * [str] - The string to clean
 */
 function clean_string(string) {
    var bad_chars = ",<.>/?;:\'\"[{]}\\|=+-_1!2@3#4$5%6^7&8*9(0)'";
    var result = "";
    for (var i = 0; i < string.toString().length; i++) {
        var c = string.toString().charAt(i);
        var can_add = true;
        for (var j = 0; j < bad_chars.toString().length; j++) {
            if (c == bad_chars.toString().charAt(j)) {
                can_add = false;
                break;
            }
        }
        if (can_add) {
            result = result.concat(c);
        }
    }
    return result
 }

/**
 * Closes the reference window if it exists and opens a new one, according to
 * inputs [result], [type], and [language]
 *
 * [result] - The word being looked up
 * [type] - One of 'dictionary' or 'conjugation', determining what kind of
 * reference to display. Note that 'conjugation' can't be used when the
 * language is Mandarin, for linguistic reasons
 * [language] - The language to use; must be an element of [languages_enum]
 */
function display_reference(result, type, language) {
    var link;
    if (type === "dictionary") {
        link = languages_enum[language].to_english_url + result;
    }
    else if (type === "conjugation" && language != "MANDARIN") {
        link = languages_enum[language].conjugation_url + result;
    }
    else return;

    //This could probably be done without creating a new window each time
    if (new_window_ID != null) {
        chrome.windows.remove(
            new_window_ID,
            function() {if (chrome.runtime.lastError) {}}); //do nothing! This error is created when the user manually closes the window
    }
    chrome.windows.create(
        {url: link, width: 480, height: 480, focused: true, type: "popup"},
        function(new_window) {new_window_ID = new_window.id;}
    );
}

/**
 * Runs the code injection to get text [result] and then processes [result]
 * according to [type], [language], [html], and the state of the program.
 *
 * [type] - One of 'dictionary' or 'conjugation', determining what kind of
 * reference to display. Note that 'conjugation' can't be used when the language is Mandarin, for linguistic reasons
 * [language] - The language to use; must be an element of [languages_enum]
 * [html] - The old HTML code
 */
function process_input(type, language, html) {
    chrome.tabs.executeScript(
        {code: '(' + code_injection + ')()', allFrames: true},
        function(result) {
            //If there was an error, figure out whether or not to display it
            if (chrome.runtime.lastError) {
                if (chrome.runtime.lastError.message != "Cannot access a chrome:// URL") {
                    alert("BabelFix error: " + chrome.runtime.lastError.message);
                }
                return;
            }
            result = clean_string(result)
            if (result != "" && result != last_word_added) {
                if (type == "dictionary") {
                    display_reference(result, "dictionary", language);
                    var new_html = html + '<tr><td>' + result + '</td></tr>';
                    chrome.storage.local.set({html: new_html});
                }
                else if (type == "conjugation") {
                    display_reference(result, "conjugation", language);
                    var new_html = html + '<tr><td> (conjugate) ' + result + '</td></tr>';
                    chrome.storage.local.set({html: new_html});
                }
                else return;
            }
            else if (result != "" && result == last_word_added) {
                if (type == "dictionary") {
                    display_reference(result, "dictionary", language);
                }
                else if (type == "conjugation") {
                    display_reference(result, "conjugation", language);
                }
                else return;
            }
            else return; //It must be that result == ""

            //If result wasn't the empty string, update the [last word added]
            last_word_added = result;
        }
    );
}

/**
 * Gives the user a notification matching [type]
 * [type] - One of "installation" or "language_needed"
 */
function give_notification(type) {

    //An object containing the notification sent upon BabelFix's installation
    var install_notification = {
        type: "basic",
        title: "BabelFix Installed",
        message: "Make sure to select a language!",
        iconUrl: "images/icon.png",
    };

    //An object containing a notification saying to select a language
    var language_unset_notification = {
        type: "basic",
        title: "BabelFix could have saved that word...",
        message: "Select a language from the extension icon to start using BabelFix",
        iconUrl: "images/icon.png",
    };

    if (type == "installation") {
        chrome.notifications.create(install_notification);
    }
    else if (type == "language_needed") {
        chrome.notifications.create(language_unset_notification);
    }
    else return;
}

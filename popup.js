var html_string = "";

document.addEventListener('DOMContentLoaded', function () {
    var background_page = chrome.extension.getBackgroundPage();
    html_string = background_page.stored_html;
    document.getElementById("table").innerHTML = html_string;
});

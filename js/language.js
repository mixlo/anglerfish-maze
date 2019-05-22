var currentLanguage;

// from: https://www.w3schools.com/js/js_json_parse.asp
// loads the needed language file from disk and puts the values into the translation variable.
// Additionally it is stored in the local storage when changing the url
function readLanguageFileFromDisk(languageCode) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            currentLanguage = JSON.parse(this.responseText);
            localStorage.setItem('current_language', JSON.stringify(currentLanguage));
        }
    }
    languageFilePath = "js/" + languageCode + ".json";
    xmlhttp.open("GET", languageFilePath, true);
    xmlhttp.overrideMimeType("application/json");
    xmlhttp.send();
}

function translateByAttribute() {
    //without jquery, might not work in older browsers

    // this first loop translates all the text strings on the html page
    currObj2 = document.querySelectorAll('[i18n-data]');
    for (var i = 0; i < currObj2.length; i++) {
        var currAttrName = currObj2[i].getAttribute("i18n-data");
        currObj2[i].innerHTML = currentLanguage[currAttrName];
    }

    // this second loop switches all the images depending on the language by using the url in the language file
    currObj3 = document.querySelectorAll('[i18n-picture-data]');
    for (var i = 0; i < currObj3.length; i++) {
        var currAttrName = currObj3[i].getAttribute("i18n-picture-data");
        currObj3[i].src = currentLanguage[currAttrName];
    }
}

function switchLanguage(languageCode) {
    // load language depending on the language code
    if (languageCode == "en") {
        currentLanguage = JSON.parse(localStorage.getItem('en_lang'));
    } else if (languageCode == "sv") {
        currentLanguage = JSON.parse(localStorage.getItem('sv_lang'));
    } else {
        currentLanguage = JSON.parse(localStorage.getItem('en_lang'));
    }

    // save to local storage for switching the sites
    localStorage.setItem('current_language', JSON.stringify(currentLanguage));

    translateByAttribute();
}

function translateToCurrentLanguage(languageStringKey) {
    var languageStringValue = "";
    if (currentLanguage.hasOwnProperty(languageStringKey)) {
        languageStringValue = currentLanguage[languageStringKey];
    } else {
        languageStringValue = "no translation found ...";
    }

    return languageStringValue;
}

// call this to set the language
function initLanguage() {
    var currentLanguageString = localStorage.getItem('current_language');

    // load english as default when no language is set yet
    if (!currentLanguageString) {
	var en_string = localStorage.getItem('en_lang');
	localStorage.setItem('current_language', en_string);
        currentLanguage = JSON.parse(en_string);
    } else {
        //console.log(currentLanguageString);
        currentLanguage = JSON.parse(currentLanguageString);
    }
}

// loads the language, needs a delay to wait for all items to load
$(document).ready(function () {
    //var delayInMilliseconds = 10;
    //setTimeout(function () {
        translateByAttribute();
    //}, delayInMilliseconds);

});

initLanguage();

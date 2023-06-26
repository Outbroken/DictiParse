// Get Dictionary
var dictPath = './Dictionaries/English.txt';
var dictionary;

$.ajax({
    url: dictPath,
    type: 'get',
    async: false,
    success: function(text) {  
        dictionary = text.split("\n");
    }
});

var filteredDictionary = [];

// Initialize Other Variables
var currentSearchQuery = "";

var OrderingModes = ["A_TO_Z", "Z_TO_A"];
var currentOrderingIndex = 0;

var numberOfPages = 0;
var currentPage = 0;
var wordsPerPage = 100;

var minLength = 1;
var maxLength = 9999;

var mustBeginWith = "";
var mustEndWith = "";

var patternFrameOpen = false;
var currentWordSelected = "";

function refreshFilteredDictionary() {
    // Initializing
    filteredDictionary = [];

    // Filtering
    var numberOfValidWords = 0;

    for (var i = 0; i < dictionary.length; i++)
    {
        let v = dictionary[i];

        if (v.includes(currentSearchQuery) > 0 && v.length >= minLength && v.length <= maxLength && v.startsWith(mustBeginWith) && v.endsWith(mustEndWith))
        {
            filteredDictionary[numberOfValidWords] = v;
            numberOfValidWords++;
        }
    }

    // Ordering
    if (OrderingModes[currentOrderingIndex] == "Z_TO_A") 
    {
        var inter = [];
        var filteredDictionaryLength = filteredDictionary.length;
        
        filteredDictionary.sort();

        for (var i = 0; i < filteredDictionaryLength; i++) 
        {
            inter[filteredDictionaryLength - 1 - i] = filteredDictionary[i];
        }

        filteredDictionary = inter;
    }

    // Finalizing
    numberOfPages = Math.ceil(filteredDictionary.length / wordsPerPage);

    if (numberOfPages == 0) 
    {
        clearPage();
        document.getElementById("PageText").textContent = "None";
        return;
    }

    currentPage = Math.max(Math.min(currentPage, numberOfPages - 1), 0);
}

function clearPage() {
    //document.getElementById("WordInteractPanel").style.top = "-100%";
    currentWordSelected = "";

    while (document.getElementById("Words").firstChild) 
    {
        document.getElementById("Words").lastChild.removeEventListener("click", null);
        document.getElementById("Words").removeChild(document.getElementById("Words").lastChild);
    }
}

function handlePageIcons(number) {
    if (number == 0) 
    {
        document.getElementById("pageStart").style.opacity = "30%";
        document.getElementById("pageDec").style.opacity = "30%";
    } else 
    {
        document.getElementById("pageStart").style.opacity = "100%";
        document.getElementById("pageDec").style.opacity = "100%";
    }
    
    if(number == numberOfPages - 1) 
    {
        document.getElementById("pageEnd").style.opacity = "30%";
        document.getElementById("pageInc").style.opacity = "30%";
    } else 
    {
        document.getElementById("pageEnd").style.opacity = "100%";
        document.getElementById("pageInc").style.opacity = "100%";
    }
}

function loadPage(number) 
{
    clearPage();
    handlePageIcons(number);
    document.documentElement.scrollTop = 0;
    
    for (var i = number * wordsPerPage; i < number * wordsPerPage + wordsPerPage; i++) 
    {
        var newElement = document.createElement("button");

        if (!filteredDictionary[i]) 
        {
            break;
        }

        var firstLetter = filteredDictionary[i].substring(0, 1).toUpperCase();
        var restOfWord = filteredDictionary[i].substring(1);
        newElement.textContent = firstLetter + restOfWord;
        newElement.classList.add('Word');

        document.getElementById("Words").appendChild(newElement);

        /*
        newElement.addEventListener("mouseover", function(ev) {
            document.getElementById("WordInteractPanel").style.top = ev.target.getBoundingClientRect().top - (document.documentElement.clientHeight * 0.035) + "px";

            currentWordSelected = ev.target.textContent.toLowerCase();
        })
        */
    }

    document.getElementById("CurrentPageLabel").textContent = (number + 1) + "/" + numberOfPages;
}

// RUNTIME
refreshFilteredDictionary();
loadPage(currentPage);

document.getElementById("pageStart").addEventListener("click", function() {
    if (numberOfPages == 0) {
        return;
    }

    currentPage = 0;

    loadPage(currentPage);
})

document.getElementById("pageEnd").addEventListener("click", function() {
    if (numberOfPages == 0) {
        return;
    }

    currentPage = numberOfPages - 1;

    loadPage(currentPage);
})

document.getElementById("pageInc").addEventListener("click", function() {
    if (numberOfPages == 0) {
        return;
    }

    currentPage = Math.min(currentPage + 1, numberOfPages - 1);

    loadPage(currentPage);
})

document.getElementById("pageDec").addEventListener("click", function() {
    if (numberOfPages == 0) {
        return;
    }

    currentPage = Math.max(currentPage - 1, 0);
    
    loadPage(currentPage);
})

document.getElementById("SearchBar").addEventListener("input", function(ev) {
    if (ev.data == " ") {
        document.getElementById("SearchBar").value = document.getElementById("SearchBar").value.replace(" ", "")
        return;
    }

    document.documentElement.scrollTop = 0;
    newSearchQuery = document.getElementById("SearchBar").value;

    if (newSearchQuery === "") 
    {
        currentSearchQuery = "";
    } else 
    {
        currentSearchQuery = newSearchQuery.toLowerCase();
    }

    refreshFilteredDictionary();
    loadPage(currentPage);
})

document.getElementById("OrderButton").addEventListener("click", function() {
    if (currentOrderingIndex + 1 > OrderingModes.length - 1)
    {
        currentOrderingIndex = 0;
    } else 
    {
        currentOrderingIndex++;
    }

    if (OrderingModes[currentOrderingIndex] == "A_TO_Z") 
    {
        document.getElementById("OrderIcon").src = "images/arrow-down-a-z-solid.svg";
    } else if (OrderingModes[currentOrderingIndex] == "Z_TO_A") 
    {
        document.getElementById("OrderIcon").src = "images/arrow-down-z-a-solid.svg";
    }

    refreshFilteredDictionary();
    loadPage(currentPage);
})

document.getElementById("MinLengthInput").addEventListener("input", function(ev) {
    var input = document.getElementById("MinLengthInput");
    var numeralizedInput = Number(input.value);

    if (input.value === "") {
        minLength = 1;
        loadPage(currentPage);
        return;
    }

    if (isNaN(numeralizedInput) || ev.data == "." || numeralizedInput == 0)
    {
        input.value = input.value.substring(0, input.value.length - 1)
        return;
    }

    minLength = numeralizedInput;
    refreshFilteredDictionary()
    loadPage(currentPage);
})

document.getElementById("MaxLengthInput").addEventListener("input", function(ev) {
    var input = document.getElementById("MaxLengthInput");
    var numeralizedInput = Number(input.value);

    if (input.value === "") {
        maxLength = 9999;
        loadPage(currentPage);
        return;
    }

    if (isNaN(numeralizedInput) || ev.data == "." || numeralizedInput == 0)
    {
        input.value = input.value.substring(0, input.value.length - 1)
        return;
    }
    
    maxLength = numeralizedInput;
    refreshFilteredDictionary()
    loadPage(currentPage);
})

document.getElementById("BeginsWith").addEventListener("input", function(ev) {
    var input = document.getElementById("BeginsWithInput");

    if (ev.data == " ") {
        input.value = input.value.replace(" ", "")
        return;
    }

    if (input.value === "") 
    {
        mustBeginWith = "";
    } else 
    {
        mustBeginWith = input.value.toLowerCase();
    }

    refreshFilteredDictionary();
    loadPage(currentPage);
})

document.getElementById("EndsWith").addEventListener("input", function(ev) {
    var input = document.getElementById("EndsWithInput");

    if (ev.data == " ") {
        input.value = input.value.replace(" ", "")
        return;
    }

    if (input.value === "") 
    {
        mustEndWith = "";
    } else 
    {
        mustEndWith = input.value.toLowerCase();
    }

    refreshFilteredDictionary();
    loadPage(currentPage);
})

document.getElementById("LanguageButton").addEventListener("click", function() {
    
})
/*

document.getElementById("WordCopyButton").addEventListener("click", function() {
    if (currentWordSelected == "") {
        return;
    }

    navigator.clipboard.writeText(currentWordSelected);
    document.getElementById("WordInteractPanel").style.top = "-100%";
})

document.getElementById("WordDefineButton").addEventListener("click", function() {
    if (currentWordSelected == "") {
        return;
    }

    window.open("https://www.dictionary.com/browse/" + currentWordSelected);
    document.getElementById("WordInteractPanel").style.top = "-100%";
})
*/
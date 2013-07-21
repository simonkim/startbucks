/* AJAX Demonstration: load tagline.txt and display under the product name. div tag id=tagline */


function createXmlHttp() {
    var xmlhttp;
    if (window.XMLHttpRequest) {
        // code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
    } else {
        // code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    return xmlhttp;
}

function loadURLToElement( url, elementId ) {
    console.log( 'loadURLToElement:' + url + ',' + elementId );
    var xmlhttp = createXmlHttp();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            document.getElementById(elementId).innerHTML=xmlhttp.responseText;
            console.log( 'loadURLToElement done:' + url + ',' + elementId );
        }
    } 
    xmlhttp.open("GET", url ,true); 
    xmlhttp.send();
}

loadURLToElement( "tagline.txt", "tagline" );
loadURLToElement( "modals/about.html", "modal_about" );
loadURLToElement( "modals/submitproject.html", "modal_submitproject" );

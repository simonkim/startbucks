/* AJAX Demonstration: load tagline.txt and display under the product name. div tag id=tagline */


function create_xmlhttp() {
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

function load_element_from_url( url, elementId, done ) {
    console.log( 'load_element_from_url:' + url + ',' + elementId );
    var xmlhttp = create_xmlhttp();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            document.getElementById(elementId).innerHTML=xmlhttp.responseText;
            console.log( 'load_element_from_url done:' + url + ',' + elementId );
            if ( done ) done();
        }
    } 
    xmlhttp.open("GET", url ,true); 
    xmlhttp.send();
}

load_element_from_url( "templates/project-header.html", "template_header", function() {
    load_element_from_url( "tagline.txt", "tagline" );
    load_element_from_url( "modals/about.html", "modal_about" );
});
load_element_from_url( "templates/project-footer.html", "template_footer" );

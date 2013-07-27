var readyFB = false;

  window.fbAsyncInit = function() {
    readyFB = true;

    // init the FB JS SDK
    FB.init({
      appId      : '475639489199248',                        // App ID from the app dashboard
      channelUrl : '//staging-startbucks.herokuapp.com:window/channel.html', // Channel file for x-domain comms
      status     : true,                                 // Check Facebook Login status
      xfbml      : true                                  // Look for social plugins on the page
    });

    // Additional initialization code such as adding Event Listeners goes here
  };

  // Load the SDK asynchronously
  (function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "//connect.facebook.net/en_US/all.js";
     fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));

function update_fbcomments()
{
    var href = window.location.href;
    /* for test on localhost */
    //var href = 'http://staging-startbucks.herokuapp.com';
    var fbcomments = '<div class="fb-comments" data-href="' + href + '" data-width="800" data-num-posts="10"></div>';
    $('#fb-comments').html(fbcomments);
    if (readyFB) {
        FB.XFBML.parse(document.getElementById('fb-comments'));
    }

}

/* Twitter API: Tweet Button */

!function(d,s,id){
  var js,fjs=d.getElementsByTagName(s)[0];
  if(!d.getElementById(id)){js=d.createElement(s);
    js.id=id;
    js.src="https://platform.twitter.com/widgets.js";
    fjs.parentNode.insertBefore(js,fjs);
  }
}(document,"script","twitter-wjs");

function update_twbutton()
{
    var href = encodeURIComponent(window.location.href);
    //var href = encodeURIComponent('http://staging-startbucks.herokuapp.com/#/projects/2');
    var twbutton ='<iframe allowtransparency="true" frameborder="0" scrolling="no"' +
    ' src="https://platform.twitter.com/widgets/tweet_button.html' + 
    '?url=' + href + 
    '&text=' + document.title + 
    '"' +
    ' style="width:130px; height:20px;"></iframe>';
    $('#twbutton').html( twbutton );
}
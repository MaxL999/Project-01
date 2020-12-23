// Firebase config
var firebaseConfig = {
  apiKey: "AIzaSyCeshwfwLmlh2uwM6BLs7J4SmoUbmZvoGQ",
  authDomain: "unboreme-b99d9.firebaseapp.com",
  databaseURL: "https://unboreme-b99d9.firebaseio.com",
  projectId: "unboreme-b99d9",
  storageBucket: "unboreme-b99d9.appspot.com",
  messagingSenderId: "1080038770107",
  appId: "1:1080038770107:web:4c8db7157faf340aaa309e"
};

firebase.initializeApp(firebaseConfig);

database = firebase.database()


// function to load bouncing dots to display on DOM to show user site is working on finding results
var loaderBounce = function () {
  $("#resultCard").html("<div class='bouncing-loader'><div></div><div></div><div></div></div>")
}


// These variables hold will feed data to the querlyURL. The variable values come from user input.
// API key needed for Eventful API
var API_KEY = "vMvwtd4qCcNr8hZL";
var proxyURL = "https://cors-anywhere.herokuapp.com/"


// Search query URL built from info from submitData. API is from Eventful.com. 
const createQueryURL = (info) => {
  console.log(info);
  // &t=future
  var string = `http://api.eventful.com/json/events/search?app_key=${API_KEY}`;
  if (info.category) string += `&q=${info.category}`;
  if (info.location) string += `&l=${info.location}`;
  if (info.radius) string += `&within=${info.radius}`;
  if (info.category) string += `&c=${info.category}`;
  if (info.limit) string += `&page_size=${info.limit}`;
  console.log(string)
  return string;
}


function searchEvents(data) {
  // queryURL to pull data from Eventful.com. The proxy URL is necessary to circumvent CORS rejection errors.
  var queryURL = proxyURL + createQueryURL(data);
  console.log(queryURL);
  $.ajax({
    url: queryURL,
    method: "GET",
    crossDomain: true
  }).then(function (response) {
    $("#resultCard").empty();

    // First the entire response must be parsed from the JSON origin
    temp = JSON.parse(response)
    console.log(temp)
    // Event information is stored in a variable called eventData
    var eventData = temp.events.event
    // console.log(eventData)
    // Dynamically inserts event info into web page

    // We iterate throught the JSON data
    for (var i = 0; i < eventData.length; i++) {

      console.log(eventData[i].image)

      // Chooses which image to use, if no image is supplied, we use a stock image we created      
      let imgSRC;


      if (eventData[i].image) {
        if (eventData[i].image.url) {
          imgSRC = "http:" + eventData[i].image.url;
        } else if (eventData[i].image.medium.url) {
          imgSRC = "http:" + eventData[i].image.medium.url;
        } else if (eventData[i].image.small.url) {
          imgSRC = "http:" + eventData[i].image.small.url;
        } else if (eventData[i].image.thumb.url) {
          imgSRC = "http:" + eventData[i].image.thumb.url;
        }
      } else {
        imgSRC = "assets/images/unboremini.png";
      }

      // Grabs country data from event API
      newCountry = $("<p>")
      newCountry.text(eventData[i].country_name)

      // Grabs city data from event API
      newCity = $("<p>")
      newCity.text(eventData[i].city_name)

      // Grabs event start time
      newTime = $("<p>")
      newTime.text(eventData[i].start_time)
      newTime.addClass("startTime")

      // Populates the event title
      newTitle = $("<h5>")
      newTitle.addClass("truncate-text")
      newTitle.text(eventData[i].title)

      // Populates event address
      newAddress = $("<p>")
      newAddress.text(eventData[i].venue_address)
      newAddress.addClass("location")

      // populates event/placeholder image
      newImage = $("<img src='" + imgSRC + "'>")
      newImage.addClass("eventPic")
      eventData[i].url

      // create facebook share button
      newShareButton = $("<div>")
      newShareButton.addClass("fb-share-button")
      newShareButton.attr({
        "data-href": eventData[i].url,
        "data-layout": "button",
        "data-size": "large"
      })
      shareAnchor = $("<a>")
      shareAnchor.attr("target", "_blank")
      // Creates link to share to facebook which is fed from event JSON
      var shareURL = "https://www.facebook.com/sharer/sharer.php?u=" + eventData[i].url
      shareAnchor.attr("href", shareURL)
      shareAnchor.addClass("fb-xfbml-parse-ignore")
      shareAnchor.text("Share")
      newShareButton.append(shareAnchor)

      // creates anchor with event info link
      newURL = $("<a>")
      newURL.attr("target", "_blank")
      newURL.attr("href", eventData[i].url)
      newURL.text("Event Info")
      newURL.addClass("button primary")

      // useless???
      // Creates div holder for Google map, initially does not display
      newMap = $("<div>")
      newMap.attr("id", "map")
      newMap.attr("style", "display:none")

      // Creates Google map button. THis button holds the event cordinates which will feed the Google map function
      newButton = $("<button type='button' data-toggle='modal' data-target='#myModal' data-lat='" + eventData[i].latitude + "' data-lng='" + eventData[i].longitude + "'>")
      newButton.text("View Map")
      newButton.attr("value", eventData[i].venue_address)
      newButton.addClass("map button primary")

      // footer used to stick links to bottom of the card
      // cardFooter = $("<div>")
      // cardFooter.addClass("card-footer")
      // cardFooter.append()

      // Appends all above to individual cards for each event
      newEvent = $("<div>")
      newEvent.append(newImage, newTitle, newAddress, newTime, newShareButton, newButton, newURL)
      newEvent.addClass("card cardSize text-center p-3 m-3")

      // appends dynamically generated divs to DOM
      $("#resultCard").append(newEvent)

      // This is the piece of code needed to make the Facebook button work
      // FB.XFBML.parse()
    }

    // Toggles event Google map display
    $('.map').click(function (e) {
      e.preventDefault();

      // Initializes and appends Google Maps to a Modal
      // Initial Google map variables
      var map = null;
      var myMarker;
      var myLatlng;

      //Grabs coordinates from Sumbit button
      function initializeGMap(lat, lng) {
        myLatlng = new google.maps.LatLng(lat, lng);

        // Google maps options
        var myOptions = {
          zoom: 15,
          zoomControl: true,
          center: myLatlng,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        // Targets div with Google map
        map = new google.maps.Map(document.getElementById("map"), myOptions);

        // Creates Google map marker
        myMarker = new google.maps.Marker({
          position: myLatlng
        });
        myMarker.setMap(map);

        //Sets center of Google map based on coordinates
        map.setCenter(myLatlng);
      }

      // Get the modal
      var modal = document.getElementById("myModal");

      // Get the button that opens the modal
      var btn = $(this);

      // Get the <span> element that closes the modal
      var span = document.getElementsByClassName("close")[0];

      // When the user clicks the button, open the modal 
      btn.onclick = function () {
        modal.style.display = "block";
      }

      // When the user clicks on <span> (x), close the modal
      span.onclick = function () {
        modal.style.display = "none";
      }

      // When the user clicks anywhere outside of the modal, close it
      window.onclick = function (event) {
        if (event.target == modal) {
          modal.style.display = "none";
        }
      }

      // Re-init map before show modal
      $('#myModal').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget);
        initializeGMap(button.data('lat'), button.data('lng'));
        $("#location-map").css("width", "100%");
        $("#map_canvas").css("width", "100%");
      });

      // Trigger map resize event after modal shown
      $('#myModal').on('shown.bs.modal', function () {
        google.maps.event.trigger(map, "resize");

      });

    });
  });
};


// when the page bootsup/loads/value changes the local variables update
// records values for display
database.ref().on("value", function (snapshot) {
  Food = snapshot.val().food
  Music = snapshot.val().music
  Comedy = snapshot.val().comedy
  Literature = snapshot.val().literature
  Art = snapshot.val().art
  Carnival = snapshot.val().carnival
  Cultural = snapshot.val().cultural
  TradeShow = snapshot.val().tradeShow
  Sports = snapshot.val().sports

  // finds highest number of all categories and then finds it and adds what people find most interseting into the page
  var pplSearch = Math.max(Food, Music, Comedy, Literature, Art, Carnival, Cultural, TradeShow, Sports)

  switch (pplSearch) {
    case Food:
      $("#favSearch").text("People are hungry! Food is the most searched topic")
      break;
    case Music:
      $("#favSearch").text("Everyone loves music! Music is the most searched event")
      break;
    case Comedy:
      $("#favSearch").text("Who couldent use a good laugh? People seem to be searching for comedy!")
      break;
    case Literature:
      $("#favSearch").text("Books are good for you! Everyone has been searching for literature")
      break;
    case Art:
      $("#favSearch").text("Seen a work of art recently? Everyone is searching for art events")
      break;
    case Carnival:
      $("#favSearch").text("The state fair is my favorite! Find a carnival near you!")
      break;
    case TradeShow:
      $("#favSearch").text("Seems everyone wants a job! People are searching most for trade shows")
      break;
    case Sports:
      $("#favSearch").text("Find a new sports group! Get moving!")
      break;
  }
})


// user inputs allowed when document is ready
// some user inputs are created inside the searchEvents function, might need to change that
$(document).ready(function () {

  // Event handler for user clicking the submit button
  $("#submitSearch").click(function (event) {
    event.preventDefault();


    // empties result card div    
    $("#resultCard").empty();
    // runs loaderBounce function        
    loaderBounce();
    // Storing the search queries  
    var submitData = {
      category: $("#category option:selected").text().trim(),
      location: $("#location").val().trim(),
      radius: $("#radius").val().trim(),
      keyword: $("#keyword").val().trim(),
      limit: $("#limit").val().trim(),
    }

    // Running the searchEvents function(passing search queries as arguments)      
    searchEvents(submitData);

    // finds the chosen catagory and updates firebase
    switch (submitData.category) {
      case "Food":
        Food++
        database.ref().update({
          food: Food
        })
        break;
      case "Music":
        Music++
        database.ref().update({
          music: Music
        })
        break;
      case "Comedy":
        Comedy++
        database.ref().update({
          comedy: Comedy
        })
        break;
      case "Literature":
        Literature++
        database.ref().update({
          literature: Literature
        })
        break;
      case "Art":
        Art++
        database.ref().update({
          art: Art
        })
        break;
      case "Carnival":
        Carnival++
        database.ref().update({
          carnival: Carnival
        })
        break;
      case "Cultural":
        Cultural++
        database.ref().update({
          cultural: Cultural
        })
        break;
      case "TradeShow":
        TradeShow++
        database.ref().update({
          tradeShow: TradeShow
        })
        break;
      case "Sports":
        Sports++
        database.ref().update({
          sports: Sports
        })
        break;
    }
  });
});
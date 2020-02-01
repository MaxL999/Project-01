$(document).ready(function () {

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


  // These variables hold will feed data to the querlyURL. The variable values will come from user input. Currently some of the variables hold temporary data for testing purposes.

  var API_KEY = "vMvwtd4qCcNr8hZL";
  var proxyURL = "https://cors-anywhere.herokuapp.com/"


  // Search query URL built from info from submitData. 
  const createQueryURL = (info) => {
    console.log(info);
    return `http://api.eventful.com/json/events/search?app_key=${API_KEY}&q=${info.category}&l=${info.location}&within=${info.radius}&t=future&c=${info.category}&page_size=25`;
  }

  function searchEvents(data) {
    // queryURL to pull data from Eventful.com. The proxy URL is necessary to circumvent CORS rejection.
    var queryURL = proxyURL + createQueryURL(data);
    console.log(queryURL);
    $.ajax({
      url: queryURL,
      method: "GET",
      crossDomain: true
    }).then(function (response) {
      $("#resultCard").empty();

      // first the entire response must be parsed from its JSON origin
      temp = JSON.parse(response)
      // then we can grab the important event information from the nest
      eventData = temp.events.event
      console.log(eventData)
      // Dynamically inserts event info into web page

      for (var i = 0; i < eventData.length; i++) {

        var imgSRC;

        // chooses which image to use
        if (eventData[i].image === null) {
          imgSRC = "assets/images/unboremini.png";
        } else {
          imgSRC = "http:" + eventData[i].image.medium.url;
        }

        // grabs country data from event API
        newCountry = $("<p>")
        newCountry.text(eventData[i].country_name)

        // grabs city data from event API
        newCity = $("<p>")
        newCity.text(eventData[i].city_name)

        // grabs event start time
        newTime = $("<p>")
        newTime.text(eventData[i].start_time)

        // populates the event title
        newTitle = $("<h5>")
        newTitle.addClass("truncate-text")
        newTitle.text(eventData[i].title)

        // populates event address
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
        newShareButton.attr({ "data-href": eventData[i].url, "data-layout": "button", "data-size": "large" })
        shareAnchor = $("<a>")
        shareAnchor.attr("target", "_blank")
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
        newURL.addClass("btn btn-primary")

        // creates map button to address
        newMap = $("<div>")
        newMap.attr("id", "map")
        newMap.attr("style", "display:none")

        newButton = $("<button type='button' data-toggle='modal' data-target='#myModal' data-lat='" + eventData[i].latitude + "' data-lng='" + eventData[i].longitude + "'>")
        newButton.text("View Map")
        newButton.attr("value", eventData[i].venue_address)
        newButton.addClass("map btn btn-primary")


        // appends all above to individual divs
        newEvent = $("<div>")
        newEvent.append(newImage, newTitle, newAddress, newTime, newURL, newShareButton, newButton)
        newEvent.addClass("column cards")

        // appends dynamically generated divs to DOM
        $("#resultCard").append(newEvent)
        FB.XFBML.parse()
      }

      // Toggles event map display
      $('.map').click(function (e) {
        e.preventDefault();

        // Initializes and appends Google Maps to a Modal

        var map = null;
        var myMarker;
        var myLatlng;

        function initializeGMap(lat, lng) {
          myLatlng = new google.maps.LatLng(lat, lng);

          var myOptions = {
            zoom: 15,
            zoomControl: true,
            center: myLatlng,
            mapTypeId: google.maps.MapTypeId.ROADMAP
          };

          map = new google.maps.Map(document.getElementById("map"), myOptions);

          myMarker = new google.maps.Marker({
            position: myLatlng
          });
          myMarker.setMap(map);

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


  // Event handler for user clicking the submit button
  $("#submitSearch").click(function (event) {
    event.preventDefault();


    if ($("#state").val() === "") {
      alert("location needed")
      return false;
    } else {
      // empties result card div
      $("#resultCard").empty();
      // runs loaderBounce function
      loaderBounce();
      // Storing the search queries
      var submitData = {
        category: $("#category option:selected").text().trim(),
        location: $("#state").val().trim(),
        radius: $("#radius").val().trim(),
      }

      // Running the searchEvents function(passing search queries as arguments)
      searchEvents(submitData);

      // finds the chosen catagory and updates firebase      
      if (submitData.category === "Food") {
        Food++
        database.ref().update({
          food: Food
        })
      } else if (submitData.category === "Music") {
        Music++
        database.ref().update({
          music: Music
        })
      } else if (submitData.category === "Comedy") {
        Comedy++
        database.ref().update({
          comedy: Comedy
        })
      } else if (submitData.category === "Literature") {
        Literature++
        database.ref().update({
          literature: Literature
        })
      } else if (submitData.category === "Art") {
        Art++
        database.ref().update({
          art: Art
        })
      } else if (submitData.category === "Carnival") {
        Carnival++
        database.ref().update({
          carnival: Carnival
        })
      } else if (submitData.category === "Cultural") {
        Cultural++
        database.ref().update({
          cultural: Cultural
        })
      } else if (submitData.category === "TradeShow") {
        TradeShow++
        database.ref().update({
          tradeShow: TradeShow
        })
      } else if (submitData.category === "Sports") {
        Sports++
        database.ref().update({
          sports: Sports
        })
      } else {
        console.log("firebase logic update error")
      }
    }
  });

  // when the page bootsup/loads/value changes the local variables update
  database.ref().on("value", function (snapshot) {
    console.log(snapshot.val())
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
    if (pplSearch === Food) {
      $("#favSearch").html("People enjoy searching for food")
    } else if (pplSearch === Music) {
      $("#favSearch").html("People enjoy searching for music")
    } else if (pplSearch === Comedy) {
      $("#favSearch").html("People enjoy searching for comedy")
    } else if (pplSearch === Literature) {
      $("#favSearch").html("People enjoy searching for literatur")
    } else if (pplSearch === Art) {
      $("#favSearch").html("People enjoy searching for art")
    } else if (pplSearch === Carnival) {
      $("#favSearch").html("People enjoy searching for carnival")
    } else if (pplSearch === Cultural) {
      $("#favSearch").html("People enjoy searching for cultural")
    } else if (pplSearch === TradeShow) {
      $("#favSearch").html("People enjoy searching for trade shows")
    } else if (pplSearch === Sports) {
      $("#favSearch").html("People enjoy searching for sports")
    } else {
      console.log("highest search record error")
    }
  })







});
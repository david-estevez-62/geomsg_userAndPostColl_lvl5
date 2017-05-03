

(function(){



    var readyStatus = false,
        firstRound = true,
        exploreMode = false,
        msgImgSample,
        markers = [],
        explorePos,
        lastPos;




    document.addEventListener("keydown", function(e) {
      if(e.keyCode ===  13 && window.location.href.substr(-12)=="modalOverlay"){

        if( !(document.querySelector("[name=imgurl]").value.indexOf("http://") > -1  ||  
          document.querySelector("[name=imgurl]").value.indexOf("https://") > -1) ) {
                return;
        }
        $("#addMsgForm").trigger("submit");
      }

    });

    document.getElementById("send-status").addEventListener("click", function() {
          //make sure map exists before start to toggling
          if(map){

            if(!readyStatus){
              this.style.background = "white";

              this.value = "message on";
              readyStatus = true;
            }else{
              this.style.background = "darkgrey";

              this.value = "message off";
              readyStatus = false;
            }

          }

    });

    // Switch between img upload mechanism and adding a url image 
    // ext link when filling out the form when creating a message
    document.getElementById("imgMethodTog").addEventListener("change", function() {

        var y = this.parentNode.querySelector("[name=imgdescrip]");

        if(y) {
              this.parentNode.removeChild(document.querySelector("#addMsgForm img"));
              this.parentNode.removeChild(document.querySelector("[name=imgdescrip]"));
        }

        if(document.querySelector("[name=imgurl]").className === "hidden"){
            document.querySelector("[name=imgurl]").className = "";
            document.querySelector("[name=uploadedimg]").className = "hidden";
            document.querySelector("[name=uploadedimg]").value = "";
        }else {
            document.querySelector("[name=imgurl]").className = "hidden";
            document.querySelector("[name=uploadedimg]").className = "";
            document.querySelector("[name=imgurl]").value = "";
        }
    });


    document.querySelector("[name=uploadedimg]").addEventListener("change", function() {
      
        if(this.value !== ""){
          var self = this;

          function readURL(input) {
              if (input.files && input.files[0]) {
                  var imgDetails = new FileReader();

                  imgDetails.onload = function (e) {
                    addMsgFormImgElems(e.target.result, self);
                  }

                  imgDetails.readAsDataURL(input.files[0]);
              }
          }

          readURL(self);

        }

    });

    document.querySelector("[name=imgurl]").addEventListener("input", function(e) {

        if(this.value.indexOf("http://") > -1 || this.value.indexOf("https://") > -1){
          // set e.target.result = to value this so it can follow pattern of "[name=uploadedimg]"
          // and so we can move common functionality into own function
          e.target.result = this.value;

          if(!document.querySelector("#addMsgForm img")){
            addMsgFormImgElems(e.target.result, this);
          } else {
            msgImgSample.src = this.value;
          }

        }
    });


    // document.getElementById("show-limit").addEventListener("click", function() {
    //       //make sure map exists before start to toggling
    //       if(map){

    //         if(!showField){
    //             if(!fieldRadius){
    //                 fieldRadius = new google.maps.Circle({
    //                                       strokeColor: "yellow",
    //                                       strokeOpacity: 0.1,
    //                                       strokeWeight: 6,
    //                                       fillColor: "yellow",
    //                                       map: map,
    //                                       center: lastPos,
    //                                       radius: 200
    //                                     });
    //             } else {
    //                 fieldRadius.setMap(map);
    //                 fieldRadius.setCenter(lastPos);
    //             }

    //           showField = true;
    //         }else{
    //           fieldRadius.setMap(null);

    //           showField = false;
    //         }

    //     }

    // });


    document.getElementById("explore").addEventListener("click", function() {

    });
    

    // handle msg form submission with javascript if enabled otherwise
    // attach coords to hidden field on form to be submitted the old fashion way
    document.getElementById("addMsgForm").addEventListener("submit", function(e) {
           e.preventDefault();


           if(document.querySelector("[name=uploadedimg]").className === "hidden" && 
              !(document.querySelector("[name=imgurl]").value.indexOf("http://") > -1  ||  
              document.querySelector("[name=imgurl]").value.indexOf("https://") > -1) ){
              return;
            }

           $.ajax({
              // Your server script to process the upload
              url: '/addmsg',
              type: 'POST',
              // Form data
              data: new FormData($('form')[0]),
              // Tell jQuery not to process data or worry about content-type
              // You *must* include these options!
              cache: false,
              contentType: false,
              processData: false,

              // Custom XMLHttpRequest
              xhr: function() {
                  var myXhr = $.ajaxSettings.xhr();
                  if (myXhr.upload) {
                      // For handling the progress of the upload
                  }
                  return myXhr;
              },
              success: function(data){

                $('#addMsgForm')[0].reset();

                resetAddMsgForm();
                       
                var scaleFactor = map.getZoom();
                var img = new Image();

                img.src = data.contents.imgFile;

                img.onload = function(file){

                  var icon = {
                      url: data.contents.imgFile,   origin: new google.maps.Point(0,0),   anchor: new google.maps.Point(0,0),
                      scaledSize: new google.maps.Size(((scaleFactor/80)*200), (((scaleFactor/80)*200)/file.path[0].width)*file.path[0].height)
                  };

                  var marker = new google.maps.Marker({ position: {lat: data.location.coordinates[0], lng: data.location.coordinates[1]}, map: map, icon: icon });


                  attachMsg(marker, data.contents.text+"<img src='"+data.contents.imgFile+"' width='250px' alt='"+data.contents.imgFileDescrip+"'/><br/>"+data.datetime);
                  // augmentedView(marker);
                  markers.push({marker: marker, width: file.path[0].width, height: file.path[0].height, url: data.contents.imgFile});


                window.location.href = "#!";
              }
          }

        });

    });


    document.getElementById("close").addEventListener("click", function() {
        $('#addMsgForm')[0].reset();
        resetAddMsgForm();
    });



    function resetAddMsgForm() {
          var x = document.querySelector("#addMsgForm img");
          var y = document.querySelector("#addMsgForm [name=imgdescrip]");

          if(x){
            x.parentNode.removeChild(x);
            y.parentNode.removeChild(y); 
          }

          if(document.querySelector("[name=uploadedimg]").className === "hidden"){
            document.querySelector("[name=uploadedimg]").className = "";
            document.querySelector("[name=imgurl]").className = "hidden";
            document.getElementById("imgMethodTog").checked=false;
          }
    }


    function addMsgFormImgElems(inputVal, self) {
          // create image element to sample chosen file input
          msgImgSample = document.createElement("img");
          msgImgSample.src = inputVal;
          msgImgSample.style.width = "200px";

          // create txt input elem to add a descri[tion for img
          var msgImgDescrip = document.createElement("input");

          msgImgDescrip.type = "text";
          msgImgDescrip.placeholder = "add image description";
          msgImgDescrip.name = "imgdescrip";
          msgImgDescrip.required = "required";

          self.parentNode.insertBefore(msgImgDescrip, document.querySelector("[type=submit]"));
          self.parentNode.insertBefore(msgImgSample, document.querySelector("#addMsgForm label"));
    }


    var attachMsg = function (marker, note) {
         var infowindow = new google.maps.InfoWindow({  content: note  });

         marker.addListener('click', function() {
             infowindow.open(marker.get('map'), marker);
         });
    };

    // var augmentedView = function (marker) {
    //    marker.addListener('click', function() {

    //    });
    // }



    function initialize() {

          function getLocation() {
              if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(showPosition);
                  // navigator.geolocation.watchPosition(showPosition);
              }
          } 

          function showPosition(position) {

              lastPos = { lat:position.coords.latitude, lng:position.coords.longitude};
              // Map options here
              var mapOptions = {
                center: lastPos,
                zoom: 16,
                disableDefaultUI:true
              };

              if(firstRound){
                // Create a new map that gets injected into #map in our HTML
                map = new google.maps.Map(document.getElementById('map'), mapOptions);
                map.set("styles",[{featureType:"all",elementType:"labels.text.fill",stylers:[{color:"#ffffff"}]},{featureType:"all",elementType:"labels.text.stroke",stylers:[{color:"#000000"},{lightness:13}]},{featureType:"administrative",elementType:"geometry.fill",stylers:[{color:"#000000"}]},{featureType:"administrative",elementType:"geometry.stroke",stylers:[{color:"#144b53"},{lightness:14},{weight:1.4}]},{featureType:"landscape",elementType:"all",stylers:[{color:"#08304b"}]},{featureType:"poi",elementType:"geometry",stylers:[{color:"#0c4152"},{lightness:5}]},{featureType:"road.highway",elementType:"geometry.fill",stylers:[{color:"#000000"}]},{featureType:"road.highway",elementType:"geometry.stroke",stylers:[{color:"#0b434f"},{lightness:25}]},{featureType:"road.arterial",elementType:"geometry.fill",stylers:[{color:"#000000"}]},{featureType:"road.arterial",elementType:"geometry.stroke",stylers:[{color:"#0b3d51"},{lightness:16}]},{featureType:"road.local",elementType:"geometry",stylers:[{color:"#000000"}]},{featureType:"transit",elementType:"all",stylers:[{color:"#146474"}]},{featureType:"water",elementType:"all",stylers:[{color:"#021019"}]}]);
              
                google.maps.event.addListener(map, 'click', function(event) {
                  if(readyStatus){
                    var clickedPos = event.latLng;

                    window.location.href = "#modalOverlay";

                    // set the hidden coord field equal to the corresponding lat lng coords that were clicked
                    // this will allow us to post the old fashion way in case JavaScript is disabled.
                    document.getElementById("coordLatField").value = clickedPos["lat"]();
                    document.getElementById("coordLngField").value = clickedPos["lng"]();
                  }
                });


                setMapProps();
                attachMapListener();


                firstRound = false;


              } else {
                    map.setOptions(mapOptions);

                    for(var i = 0; i < markers.length; i++){
                      markers[i].marker.setMap(null);
                    }
                    markers = [];

                    setMapProps();

              }

          } 




          getLocation();
       

    }

          

              
    function setMapProps(){

        
          $.post('/locate', lastPos, function(){
                  $.get('/msgs', function(messages){
                    var scaleFactor = map.getZoom();

                    (function loop(i){

                      if(i == messages.length){
                          return;
                      }

                      var img = new Image();

                      img.src = messages[i].contents.imgFile;

                      img.onload = function(file){

                        var icon = {
                            url: messages[i].contents.imgFile, // url
                            scaledSize: new google.maps.Size(((scaleFactor/80)*200), (((scaleFactor/80)*200)/file.path[0].width)*file.path[0].height), // scaled size
                            origin: new google.maps.Point(0,0), // origin
                            anchor: new google.maps.Point(0,0) // anchor
                        };

                        var marker = new google.maps.Marker({
                          position: {lat: messages[i].location.coordinates[0], lng: messages[i].location.coordinates[1]},
                          map: map,
                          icon: icon
                        });


                        attachMsg(marker, messages[i].contents.text+"<img src='"+messages[i].contents.imgFile+"' width='250px' alt='"+messages[i].contents.imgFileDescrip+"'/><br/>"+messages[i].datetime);
                        // augmentedView(marker);
                        markers.push({marker: marker, width: file.path[0].width, height: file.path[0].height, url: messages[i].contents.imgFile});

                        loop(++i);
                      }

                    })(0)
               
                      
                })

          });

          if(firstRound){
            var circle = new google.maps.Circle({
              center: lastPos,
              map: map,
              radius: 930,          // IN METERS.
              fillColor: '#FF6600',
              fillOpacity: 0.3,
              strokeColor: "#FFF",
              strokeWeight: 0         // DON'T SHOW CIRCLE BORDER.
            });
          }

                
    }



    function attachMapListener() {
              google.maps.event.addListener(map, 'zoom_changed', function() {
                  var scaleFactor = map.getZoom();

                  for (var i = 0; i < markers.length; i++) {

                    if( ((scaleFactor/80)*200) <= 20 ||  ((((scaleFactor/80)*200)/markers[i].width)*markers[i].height) <= 20){
                      markers[i].marker.setMap(null);
                      continue;
                    }else if(markers[i].marker.getMap() == null){
                      markers[i].marker.setMap(map);
                    }

                    var icon = {
                              url: markers[i].url, // url
                              scaledSize: new google.maps.Size(((scaleFactor/80)*200), ((((scaleFactor/80)*200)/markers[i].width)*markers[i].height)) // scaled size
                          };

                    markers[i].marker.setIcon(icon);
                  };
              });


              google.maps.event.addDomListener(window, "resize", function() {
                 google.maps.event.trigger(map, "resize");
                 map.setCenter(lastPos);
              });


    }
                

                


    google.maps.event.addDomListener(window, 'load', initialize);
    window.setInterval(initialize, 20000);
}());


// Event handling
/*document.addEventListener("DOMContentLoaded",
  function (event) {

    // Unobtrusive event binding
    document.querySelector("#usb")
      .addEventListener("click", function () {

        // Call server to get the name
        $ajaxUtils
          .sendGetRequest("http://127.0.0.1:8000/upload/transfer/",
            function (request) {
              //var name = request.responseText;
            console.log(request.responseText);

              //document.querySelector("#content")
                //.innerHTML = "<h2>Hello " + name + "!</h2>";
            });


      });
  }
);



document.querySelector("#usb")
      .addEventListener("click", function () {

        window.open("/upload/transfer/", "_self");
});*/

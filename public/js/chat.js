const socket = io()

//Elelemnts
//Elements
const $messageForm = document.querySelector("#message-form");
const $messageFormInput=$messageForm.querySelector('input')
const $messgaeFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector("#send-location");
const $message = document.querySelector("#messages");
const $messageTemplates = document.querySelector("#message-template").innerHTML;
const $locationTemplates = document.querySelector("#location-message-template").innerHTML;
const $sidebartemplate = document.querySelector("#sidebar-template").innerHTML
//Options
const {username,room}= Qs.parse(location.search,{ignoreQueryPrefix:true})

const autoScroll=() => {
  //New message elements
  const $newMessage=$message.lastElementChild

  //Height of the new message
  const $newMessageStyle= getComputedStyle($newMessage)
  const newMessageMargin=parseInt($newMessageStyle.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  //visible height of the new message
  const visibleHeight=$message.offsetHeight

  //Total height of the container
  const containerHeight =$message.scrollHeight

  //How far I have scrolled the
  const scrollOffset =$message.scrollTop+visibleHeight

  if(containerHeight - newMessageHeight <= scrollOffset){
    $message.scrollTop= $message.scrollHeight
  }



}

socket.on("message", (message) => {
  // console.log(message);
  const html = Mustache.render($messageTemplates, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm:ss a"),
  });
  $message.insertAdjacentHTML("beforeEnd", html);
  autoScroll()
});

socket.on("roomData", ({ room, users }) => {
  
  const html = Mustache.render($sidebartemplate,{
    room,
    users
  });
  document.querySelector('#sidebar').innerHTML = html;
});

socket.on("locationmessage", (data) => {
//   console.log(url);
  const html = Mustache.render($locationTemplates, {
    username: data.username,
    url: data.url,
    createdAt: moment(data.createdAt).format("h:mm:ss a"),
  });
  $message.insertAdjacentHTML("beforeEnd", html);
  autoScroll()
});

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  // disable the form submit
    $messgaeFormButton.setAttribute('disabled', 'disabled')
  const message = e.target.elements.message.value;
  socket.emit("sendMessage", message, (error) => {
    //enable the form submit
    $messgaeFormButton.removeAttribute("disabled");
    $messageFormInput.value=''
    $messageFormInput.focus();

    if (error) {
      console.log(error);
    }
    console.log("message is delieverd");
  });
});

$sendLocationButton.addEventListener("click", (e) => {
if (!navigator.geolocation) {
    return alert("geolocation is not supported on this browser");
}

$sendLocationButton.setAttribute("disabled", "disabled");

navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
    "sendlocation",
    {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
    },
    () => {
        console.log("Location Shared");
    $sendLocationButton.removeAttribute("disabled");

    }
    );
});
});

socket.emit('join',{username,room},(error) => {
    if(error){
        alert(error);
        location.href ="/"
    }
})
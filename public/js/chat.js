const socket = io();

// ELEMENTS
const inputForm = document.getElementById("inputForm"),
  chatInput = document.getElementById("chatInput"),
  sendBtn = document.getElementById("sendBtn"),
  locationBtn = document.getElementById("locationBtn"),
  messages = document.getElementById("messages");


// TEMPLATES
const messageTemplate = document.getElementById("message-template").innerHTML;
const locationTemplate = document.getElementById("location-template").innerHTML;
const sidebarTemplate = document.getElementById("sidebar-template").innerHTML;

// Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoscroll = () => {
  // new message element
  const newMessage = messages.lastElementChild;

  // get height of new message
  const newMessageStyles = getComputedStyle(newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = newMessage.offsetHeight + newMessageMargin;

  // get visible height
  const visibleHeight = messages.offsetHeight;

  //height of messages container
  const containerHeight = messages.scrollHeight;

  // How far have I scrolled?
  const scrollOffset = messages.scrollTop + visibleHeight;

  if(containerHeight - newMessageHeight <= scrollOffset) {
    messages.scrollTop = messages.scrollHeight;
  }
};

socket.on("message", info => {

  if (!info.username) {
    const html = Mustache.render(messageTemplate, {
      username: "ADMINISTRATOR",
      message: info,
      createdAt: function () {
        return moment(new Date().getTime()).format("h:mma");
      },
    });
    messages.insertAdjacentHTML("beforeend", html);
  } else {
    const html = Mustache.render(messageTemplate, {
      username: info.username,
      message: info.message,
      createdAt: function () {
        return moment(new Date().getTime()).format("h:mma");
      },
    });

    messages.insertAdjacentHTML("beforeend", html);
  }

  autoscroll();
});

socket.on("acknowledgement", message => {
  alert(message);
  location.href = "/";
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  document.getElementById("sidebar").innerHTML = html;
});

socket.on("locationLink", info => {
  const locationMessage = "My current location";
  const html = Mustache.render(locationTemplate, {
    username: info.username,
    link: info.link,
    locationMessage,
    locationCreatedAt: function () {
      return moment(new Date().getTime()).format("h:mma");
    },
  });

  messages.insertAdjacentHTML("beforeend", html);

  autoscroll();
});

// send message
sendBtn.addEventListener("click", e => {
  // disable message input temporarily
  sendBtn.setAttribute("disabled", "disabled");
  socket.emit("messageSent", chatInput.value, acknowledgement => {


    //reenable message iput
  });
  sendBtn.removeAttribute("disabled");
  chatInput.value = "";
});

// send location to users
locationBtn.addEventListener("click", e => {
  if (!navigator.geolocation) {
    return alert("Your browser does not support geolocation services.");
  }

  navigator.geolocation.getCurrentPosition(position => {
    let latitude = position.coords.latitude;
    let longitude = position.coords.longitude;
    let currentPosition = `${latitude},${longitude}`;
    socket.emit("sendLocation", currentPosition, acknowledgement => {
      messages.insertAdjacentHTML("beforeend", html);
      locationBtn.removeAttribute("disabled");
    });
  });
});

// Emit room
socket.emit("join", { username, room });

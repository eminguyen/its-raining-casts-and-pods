var body = document.querySelector("body");

var interval = window.setInterval(function() {
var drop = document.createElement("div");
drop.style.left = Math.round(Math.random() * 100) + "%";
body.appendChild(drop);
drop.className = "drop layer" + Math.floor(Math.random() * 3);
}, 500);

window.setTimeout(function() {
window.clearInterval(interval);
}, 20000);

// jquery stuff
$(document).ready(function () {
  $('#playButton').on('click', function() {
    $(this).toggleClass('fa-play fa-stop');
  });
  $('.fa-refresh').on('click', function() {
    window.location.reload();
  });
});

let constraints = {
  audio: true
};

/*
var dbRef = new Firebase("https://sb-hacks-19.firebaseio.com/");

dbRef.child('title').on('value', function(snapshot){
  $('#title').html(snapshot.val());
});

dbRef.child('description').on('value', function(snapshot){
  $('#description').html(snapshot.val());
});

$('[contenteditable]')
  .on('focus', function(){
    var $this = $(this);
    $this.data('before', $this.html());
    return $this;
  })
  .on('blur keyup paste input', function(){
    var $this = $(this),
    field     = $this.data('field'),
    keyValue  = {};

    if ($this.data('before') !== $this.html()) {
      $this.data('before', $this.html());
      keyValue[field] = $this.html();
      dbRef.update(keyValue);
    }

    return $this;
  })
;*/




navigator.mediaDevices.getUserMedia(constraints).then(function(mediaStream) {
  /*let audio = document.querySelector('audio');
  if('srcObject' in audio) {
    audio.srcObject = mediaStream;
  }
  else {
    audio.src = window.URL.createObjectURL(mediaStream)
  }*/
  let mediaRecorder = new MediaRecorder(mediaStream);
  let chunks = [];
  let button = document.getElementById('playButton');
  let audioSave = document.getElementById('audioSaver');
  button.addEventListener('click', (ev) => {
    if(button.classList.contains('fa-stop')) {
      mediaRecorder.start();
      console.log('STARTING');
    }
    else {
      mediaRecorder.stop();
      console.log('STOPPING');
    }
  });
  mediaRecorder.ondataavailable = function(ev) {
    chunks.push(ev.data);
  }
  mediaRecorder.onstop = (ev) => {
    let blob = new Blob(chunks, {'type' : 'video/mp4;'});
    chunks = [];
    let audioURL = window.URL.createObjectURL(blob);
    audioSave.src = audioURL;
    console.log(audioURL);
    var video = blob;
    var formdata = new FormData();
    formdata.append('video', video);
    $.ajax({
      url: 'public/videos/',
      data: formdata,
      contentType: false,
      processData: false,
      type: 'POST',
      'success':function(data){
        alert('Done recording podcast! Refresh the page or replay it below');
      },
      error: function(jqXHR, textStatus, errorMessage) {
        alert('Error uploading: ' + errorMessage);
      }
    });
  }
})
.catch(err => {
  console.log(err);
});

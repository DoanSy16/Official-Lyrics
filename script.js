const carousel = document.querySelector('.carousel');
const menu = document.querySelector('.menu');
let data = [];

document.addEventListener('DOMContentLoaded', async () => {

  const fetchSongs = async () => {
    const response = [];
    const dbRef = firebase.database().ref().child("Official-Lyrics");

    return new Promise((resolve, reject) => {
      dbRef.once(
        "value",
        (snapshot) => {
          snapshot.forEach((childSnapshot) => {
            const key = childSnapshot.key;
            const value = snapshot.child(key).val();
            response.push(value);
          });
          resolve(response);
        },
        (errorObject) => {
          reject(new Error("The read failed: " + errorObject.name));
        }
      );
    });
  };


  try {
    const songs = await fetchSongs();
    data = songs;
    songs.forEach((song) => {
      const item = document.createElement('div');
      item.classList.add('carousel__item');
      item.setAttribute('data-song-name', song.name);
      const item_button = document.createElement('button');
      item_button.classList.add('button-search-img');
      item_button.setAttribute('data-song-name', song.name);


      const item_button_div = document.createElement('div');
      item_button_div.classList.add('button-content');

      const img = document.createElement('img');
      img.src = song.image;
      img.alt = song.name;

      const img_button = document.createElement('img');
      img_button.classList.add('search_img');
      img_button.src = song.image;
      img_button.alt = song.name;

      const p_button = document.createElement('p');
      p_button.classList.add('text-button');
      p_button.textContent = song.name;

      const audio = document.createElement('audio');
      audio.src = song.audio;
      audio.controls = false;

      const caption = document.createElement('p');
      caption.textContent = `${song.name} - ${song.artist}`;

      item.appendChild(img);
      item.appendChild(audio);
      item.appendChild(caption);
      
      item_button_div.appendChild(img_button);
      item_button_div.appendChild(p_button);
      item_button.appendChild(item_button_div);

      carousel.appendChild(item);
      menu.appendChild(item_button);

    });

    const items = Array.from(document.querySelectorAll('.carousel__item'));
    if (typeof initializeCarousel === 'function') {
      initializeCarousel(items);
    } else {
      console.warn('initializeCarousel is not defined');
    }
  } catch (error) {
    console.error("Error fetching songs: ", error);
  }
});


function createElementButton(value) {
  const item_buttons = document.querySelectorAll('.button-search-img');
  item_buttons.forEach(button => button.remove());

  data.forEach((song) => {
    if (song.name.toLocaleLowerCase().includes(value.toLocaleLowerCase())) {



      const item_button = document.createElement('button');
      item_button.classList.add('button-search-img');
      item_button.setAttribute('data-song-name', song.name);


      const item_button_div = document.createElement('div');
      item_button_div.classList.add('button-content');


      const img_button = document.createElement('img');
      img_button.classList.add('search_img');
      img_button.src = song.image;
      img_button.alt = song.name;

      const p_button = document.createElement('p');
      p_button.classList.add('text-button');
      p_button.textContent = song.name;




      item_button_div.appendChild(img_button);
      item_button_div.appendChild(p_button);
      item_button.appendChild(item_button_div);


      menu.appendChild(item_button);
    }
  }
  );
  const items = Array.from(document.querySelectorAll('.carousel__item'));
    if (typeof initializeCarousel === 'function') {
      initializeCarousel(items);
    } else {
      console.warn('initializeCarousel is not defined');
    }
}




function initializeCarousel(items) {
  let angle = 0;
  const angleStep = 360 / items.length;
  let activeIndex = 0;
  let currentAudio = items[0].querySelector('audio');

  const prevButton = document.querySelector('.control.prev');
  const nextButton = document.querySelector('.control.next');
  const progressBar = document.querySelector(".progress-bar");
  const playPauseButton = document.querySelector(".play-pause");
  const rewindButton = document.querySelector(".rewind");
  const forwardButton = document.querySelector(".forward");
  const songTitle = document.querySelector(".song-title");
  const songArtist = document.querySelector(".song-artist");

  const choices = document.querySelectorAll(".button-search-img");

  function updateCarousel() {
    items.forEach((item, index) => {
      const rotation = (index * angleStep + angle) % 360;
      item.style.transform = `rotateY(${rotation}deg) translateZ(300px)`;
    });

    activeIndex = ((-angle / angleStep) % items.length + items.length) % items.length;
    updatePlayerAudio();
    autoPlay();
  }

  function onTimeUpdate() {
    if (!currentAudio.duration) return;
    const progress = (currentAudio.currentTime / currentAudio.duration) * 100;
    progressBar.value = progress;
  }

  // Hàm chuyển bài kế tiếp
  function nextSong() {
    angle += angleStep;
    updateCarousel();
  }

  function updatePlayerAudio() {
    items.forEach((item, i) => {
      const audio = item.querySelector('audio');
      if (i === activeIndex) {
        // Tắt nhạc cũ
        if (currentAudio && currentAudio !== audio) {
          currentAudio.pause();
          currentAudio.removeEventListener("timeupdate", onTimeUpdate);
          currentAudio.removeEventListener("ended", nextSong); // Bỏ listener cũ
        }

        currentAudio = audio;

        // Gắn sự kiện bài hát kết thúc
        currentAudio.addEventListener("ended", nextSong);

        // Update title & artist
        const [title, artist] = item.querySelector('p').textContent.split(' - ');
        songTitle.textContent = title;
        songArtist.textContent = artist || '';

        progressBar.value = 0;
        playPauseButton.textContent = "⏯";

        currentAudio.addEventListener("timeupdate", onTimeUpdate);

      } else {
        audio.pause();
        audio.removeEventListener("ended", nextSong);
      }
    });
  }

  function autoPlay() {
    currentAudio.play();
    playPauseButton.textContent = "⏸";
  }

  playPauseButton.addEventListener("click", () => {
    if (currentAudio.paused) {
      autoPlay();
    } else {
      currentAudio.pause();
      playPauseButton.textContent = "⏯";
    }
  });

  rewindButton.addEventListener("click", () => {
    currentAudio.currentTime = Math.max(0, currentAudio.currentTime - 10);
  });

  forwardButton.addEventListener("click", () => {
    currentAudio.currentTime = Math.min(currentAudio.duration, currentAudio.currentTime + 10);
  });

  progressBar.addEventListener("input", () => {
    if (!currentAudio.duration) return;
    const newTime = (progressBar.value / 100) * currentAudio.duration;
    currentAudio.currentTime = newTime;
  });

  prevButton.addEventListener('click', () => {
    angle -= angleStep;
    updateCarousel();
  });

  nextButton.addEventListener('click', () => {
    angle += angleStep;
    updateCarousel();
  });

  choices.forEach((choice, index) => {
    choice.addEventListener('click', () => {
      let i = 0;
      for (i = 0; i < items.length; i++) {
        const name = items[i].getAttribute('data-song-name');
        if (name === choice.getAttribute('data-song-name')) {
          break;
        }
      }
      angle = (360 / items.length) * index;
      activeIndex = i;
      updateCarousel();
    });
  });

  updateCarousel();
}

const sidebar = document.querySelector('.sidebar');
const openSidebarButton = document.querySelector('.open-sidebar');
const closeSidebarButton = document.querySelector('.close-sidebar');

// Open sidebar
openSidebarButton.addEventListener('click', () => {
  sidebar.classList.add('active');
});

// Close sidebar
closeSidebarButton.addEventListener('click', () => {
  sidebar.classList.remove('active');
});

// Close sidebar when clicking outside
document.addEventListener('click', (event) => {
  if (!sidebar.contains(event.target) && !openSidebarButton.contains(event.target)) {
    sidebar.classList.remove('active');
  }
});


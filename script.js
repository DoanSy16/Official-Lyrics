document.addEventListener('DOMContentLoaded',async () => {
  const carousel = document.querySelector('.carousel');

  // Mảng bài hát có name, artist, audio, image
//   const songs = [
//     { name: "Cao Ốc 20", artist: "Artist 1", audio: "audio/1.mp3", image: "images/1.PNG" },
//     { name: "Mùa Hè Năm Đó", artist: "Artist 2", audio: "audio/2.mp3", image: "images/2.PNG" },
//     { name: "Hoàn Hảo", artist: "Artist 3", audio: "audio/3.mp3", image: "images/3.PNG" }
//   ];

const response = await fetch('data.json');
    const songs = await response.json();

  // Tạo carousel__item cho từng bài
  songs.forEach(song => {
    const item = document.createElement('div');
    item.classList.add('carousel__item');

    const img = document.createElement('img');
    img.src = song.image;
    img.alt = song.name;

    const audio = document.createElement('audio');
    audio.src = song.audio;
    audio.controls = false;

    const caption = document.createElement('p');
    caption.textContent = `${song.name} - ${song.artist}`;

    item.appendChild(img);
    item.appendChild(audio);
    item.appendChild(caption);

    carousel.appendChild(item);
  });

  const items = Array.from(document.querySelectorAll('.carousel__item'));
  initializeCarousel(items);
});

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

  function updateCarousel() {
    items.forEach((item, index) => {
      const rotation = (index * angleStep + angle) % 360;
      item.style.transform = `rotateY(${rotation}deg) translateZ(300px)`;
    });

    activeIndex = ((-angle / angleStep) % items.length + items.length) % items.length;
    updatePlayerAudio();
  }

  function onTimeUpdate() {
    if (!currentAudio.duration) return;
    const progress = (currentAudio.currentTime / currentAudio.duration) * 100;
    progressBar.value = progress;
  }

  function updatePlayerAudio() {
    items.forEach((item, i) => {
      const audio = item.querySelector('audio');
      if (i === activeIndex) {
        // Tắt nhạc cũ
        if (currentAudio && currentAudio !== audio) {
          currentAudio.pause();
          currentAudio.removeEventListener("timeupdate", onTimeUpdate);
        }

        currentAudio = audio;

        // Update title & artist
        const [title, artist] = item.querySelector('p').textContent.split(' - ');
        songTitle.textContent = title;
        songArtist.textContent = artist || '';

        progressBar.value = 0;
        playPauseButton.textContent = "⏯";

        // Thêm event timeupdate cho audio mới
        currentAudio.addEventListener("timeupdate", onTimeUpdate);

      } else {
        audio.pause();
      }
    });
  }

  playPauseButton.addEventListener("click", () => {
    if (currentAudio.paused) {
      currentAudio.play();
      playPauseButton.textContent = "⏸";
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

  updateCarousel();
}

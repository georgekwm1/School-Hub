import React, { useState } from 'react';
import Modal from 'react-modal';


export default function StudyWithMe() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <span onClick={() => setIsOpen(true)}>
        <img
          width="64"
          height="64"
          src="https://img.icons8.com/external-flaticons-lineal-color-flat-icons/64/external-technique-productivity-flaticons-lineal-color-flat-icons.png"
          alt="external-technique-productivity-flaticons-lineal-color-flat-icons"
        />
        Study with me
      </span>
      <Modal
        appElement={document.getElementById('root')}
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        style={{
          overlay: {
            zIndex: 1000,
          },
        }}
      >
        <button onClick={() => setIsOpen(false)}>&times;</button>
        <h2>Study With Me</h2>
        <p>
          Study with me vieos.. with Pomodoro Timer and white noise Rain.. wind,
          calm music and more.. Focus and get encouraged
        </p>

        <div>
          <p>2 Hours 50/10 pomodor with Birds sounds or rain...</p>
          <iframe
            width="1109"
            height="624"
            src="https://www.youtube.com/embed/LLf3wPHrKus"
            title="ذاكر معي ساعتين بتقنية البومودورو - Study with me"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen
          ></iframe>

          <hr />
        </div>

        <div>
          <p>2 Hours 25/5 pomodoro with lofi music</p>
          <iframe
            width="1109"
            height="624"
            src="https://www.youtube.com/embed/sScDYHeXpvA"
            title="study with me with lofi music | Pomodoro (25 min study x 5 min rest)"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen
          ></iframe>

          <hr />
        </div>

        <div>
          <p>2 Hours 25/5 pomodoro with fire crackling sounds</p>
          <iframe
            width="1109"
            height="624"
            src="https://www.youtube.com/embed/497ntkZbUlQ"
            title="🗃️2HR STUDY WITH MEㅣpomodoro 25/5ㅣrelaxing fire crackling soundsㅣwith bell + timer"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen
          ></iframe>

          <hr />
        </div>

        <div>
          <p>2 Hours 25/5 pomodoro with calm piano and rain sounds</p>
          <iframe
            width="1109"
            height="624"
            src="https://www.youtube.com/embed/5vGT-sZlgpo"
            title="2-HOUR STUDY WITH ME  Late Night / calm piano🎹 + Rain Sounds 🌧️ / Pomodoro 25-5"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen
          ></iframe>

          <hr />
        </div>

        <button onClick={() => setIsOpen(false)}>Close</button>
      </Modal>
    </>
  );
}

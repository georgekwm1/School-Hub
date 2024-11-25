import React from 'react';
import { Brain, Sparkles } from 'lucide-react';
import StudyWithMe from './StudyWithMe';

export default function Featured() {
  return (
    <details>
      <summary className="text-sm font-semibold leading-6 text-gray-900">
        <Sparkles /> Featured
      </summary>
      <ul>
        <li>
          {/* Notion Icon */}
          <a href="https://www.notion.so/" target="_blank" rel="noreferrer">
            <img
              src="https://www.notion.com/front-static/favicon.ico"
              alt="Notion"
            />
            Notion
          </a>
        </li>
        <li>
          <a
            href="https://ticktick.com/webapp/#q/all/habit"
            target="_blank"
            rel="noreferrer"
          >
            <img
              height="48"
              src="https://img.icons8.com/fluency/48/tick-tick.png"
              alt="tick-tick"
            />
            Tic Tic
          </a>
        </li>
        <li>
          <a
            href="https://www.coursera.org/learn/learning-how-to-learn-youth/"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src="https://d3njjcbhbojbot.cloudfront.net/web/images/favicons/favicon-v2-32x32.png"
              alt="Coursera"
            />
            Learn How To Learn for Youth
          </a>
        </li>
        <li>
          <a
            href="https://www.coursera.org/learn/learning-how-to-learn"
            target="_blank"
            rel="noreferrer"
          >
            <Brain />
            Learn How To Learn
          </a>
        </li>
        <li>
          <a href="https://flocus.com/" target="_blank" rel="noreferrer">
            <img
              src="https://flocus.com/assets/favicon.jpg"
              alt="Flocus"
              height="48"
            />
            Flocus
          </a>
        </li>
        <li>
          <a href="https://studytogether.com/" target="_blank" rel="noreferrer">
            <img
              src="https://cdn.prod.website-files.com/60890f6ac44206aef9237eb4/60bf58e7f22ec73793160127_Favicon-small.png"
              alt="StudyTogether"
              height="48"
            />
            Study Together
          </a>
        </li>
        <li>
          <a href="https://forestapp.cc" target="_blank" rel="noreferrer">
            <img
              src="https://www.forestapp.cc/favicon.ico"
              alt="Forest App.. Stay focused.. Be present"
              height="48"
            />
            Forest
          </a>
        </li>
        <li>
          <StudyWithMe />
        </li>

        <li>
          <a
            href="https://sleeptown.seekrtech.com/"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src="https://sleeptown.seekrtech.com/img/icon_128_round.png"
              alt="SleepTown...Build Healthy Sleep Habits"
              height="48"
            />
            SleepTown
          </a>
        </li>
        <li>
          <a
            href="https://remindme-l.vercel.app"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src="https://custom-images.strikinglycdn.com/res/hrscywv4p/image/upload/17746265/ai_logo_1726750030_AyBzw8.png"
              alt="RemindMe"
              height="48"
            />
            RemindMe
          </a>
        </li>
      </ul>
    </details>
  );
}

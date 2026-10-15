'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion, useScroll, useSpring } from 'motion/react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

const services = [
  { id: '01', title: 'Find the story.', tag: 'STRATEGY & CONCEPT', text: 'Start with a feeling. Shape it into a story worth watching.', detail: 'A clear idea, a visual direction, and a narrative that connects the first frame to the last.', type: 'orbit' },
  { id: '02', title: 'Make it move.', tag: 'MOTION & ANIMATION', text: 'Give every shape, frame and transition a reason to move.', detail: 'Expressive motion, deliberate pacing, and small details that bring the whole experience to life.', type: 'blocks' },
  { id: '03', title: 'Leave a feeling.', tag: 'EDIT & FINISH', text: 'Bring the pieces together. Make the final moment stay.', detail: 'Rhythm, colour, and sound come together in a finish that feels considered from beginning to end.', type: 'rings' },
];

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export default function Home() {
  const reduced = useReducedMotion();
  const [replay, setReplay] = useState(0);
  const [active, setActive] = useState<string | null>(null);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  useEffect(() => {
    if (reduced) return;
    const lenis = new Lenis({ autoRaf: true, anchors: true, duration: 1.05, smoothWheel: true });
    return () => lenis.destroy();
  }, [reduced]);

  const repeat = () => {
    setReplay(v => v + 1);
    setActive(null);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return <>
    <motion.div className="progress" style={{ scaleX: reduced ? scrollYProgress : progress }} />
    <a href="#main" className="skip">Skip to content</a>
    <header className="header">
      <a className="brand" href="#main" aria-label="Endorphin, back to top"><span className="brand-mark" aria-hidden="true">✳</span> endorphin<span className="brand-dot">®</span></a>
      <nav aria-label="Main navigation"><a href="#brief">Для Марка</a><a href="#implementation">Що реалізовано</a></nav>
      <button className="replay" onClick={repeat}><span aria-hidden="true">↻</span> Replay motion</button>
    </header>

    <main id="main">
      <section className="personal-brief" id="brief" aria-labelledby="brief-title">
        <div className="brief-label"><span className="status-dot" /> СПЕЦІАЛЬНО ДЛЯ MARK GETMAN · ENDORPHIN</div>
        <div className="brief-intro">
          <div><h2 id="brief-title">Марку, це демо —<br /><em>під ваше завдання.</em></h2><p>Ви запитали про живі приклади Next.js з анімаціями та підхід до їх реалізації. Підготував окремий інтерактивний концепт для Endorphin, щоб ви могли оцінити рух безпосередньо в браузері.</p></div>
          <div className="brief-signature"><span>ПІДГОТУВАВ</span><strong>Валентин Соломко</strong><span>valpere · Software Engineer</span><a href="#hero">Переглянути анімації <span aria-hidden="true">↓</span></a></div>
        </div>
        <p className="brief-caption">ВАШ ЗАПИТ → ЩО МОЖНА ПЕРЕВІРИТИ</p>
        <div className="requirements">
          <a href="#hero"><span className="requirement-number">01 / NEXT.JS</span><strong>Живий приклад</strong><p>Ця сторінка працює на Next.js App Router. Відкрийте на комп’ютері або телефоні.</p><span className="requirement-link">До демонстрації ↗</span></a>
          <a href="#experience"><span className="requirement-number">02 / АНІМАЦІЇ</span><strong>Рух, який можна оцінити</strong><p>Поява заголовка, почергова поява карток під час скролу, ховери та реакція на натискання.</p><span className="requirement-link">До інтерактивних карток ↗</span></a>
          <a href="#implementation"><span className="requirement-number">03 / ПІДХІД</span><strong>Власний код + бібліотеки</strong><p>Нижче пояснив, які ефекти написані на CSS/JS, а де використані Motion for React та Lenis.</p><span className="requirement-link">До пояснення реалізації ↗</span></a>
        </div>
        <p className="brief-note">Це один спеціально підготовлений приклад для вашого проєкту. Він не є добіркою з 2–3 завершених клієнтських робіт.</p>
      </section>
      <section id="hero" lang="en" className="hero" aria-labelledby="hero-title" key={`hero-${replay}`}>
        <div className="hero-top"><span><i /> A LITTLE MOTION. A LOT OF FEELING.</span><span>CONCEPT / 001</span></div>
        <h1 id="hero-title"><span className="line"><span>More than</span></span><span className="line"><span>just a <em>video.</em></span></span></h1>
        <div className="hero-bottom"><p>An endorphin-fueled experience.<br />Made to move you.</p><a className="pill" href="#experience">Feel the motion <Arrow /></a></div>
        <div className="hero-art" aria-hidden="true">
          <div className="art-grid" />
          <div className="molecule"><div className="hex hex-one" /><div className="hex hex-two" /><div className="hex hex-three" /><div className="hex hex-four" /><div className="hex hex-five" /></div>
          <span className="art-coordinate">E / 01 — ENERGY IN MOTION</span><span className="art-plus">+</span>
        </div>
        <div className="hero-caption"><span>SCROLL TO EXPLORE</span><span aria-hidden="true">↓</span><span>INDEPENDENT MOTION STUDY</span></div>
      </section>

      <section lang="en" className="experience" id="experience" aria-labelledby="experience-title">
        <motion.div className="section-heading" key={`heading-${replay}`} initial={reduced ? false : { opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .5 }} transition={{ duration: .7 }}>
          <p className="eyebrow">01 / THE EXPERIENCE</p><div><h2 id="experience-title">Good stories.<br /><em>Great chemistry.</em></h2><p>From the first spark to the final frame.<br />Explore the cards. Feel the details.</p></div>
        </motion.div>
        <motion.div className="cards" key={`cards-${replay}`} initial="hidden" whileInView="visible" viewport={{ once: true, amount: .15 }} variants={{ visible: { transition: { staggerChildren: reduced ? 0 : .14 } } }}>
          {services.map(service => <motion.article key={service.id} className={`card ${active === service.id ? 'is-open' : ''}`} variants={{ hidden: { opacity: reduced ? 1 : 0, y: reduced ? 0 : 45 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 85, damping: 20 } } }}>
            <div className="card-top"><span>{service.id}</span><span>{service.tag}</span></div>
            <div className={`card-art ${service.type}`} aria-hidden="true"><i /><i /><i /><i /></div>
            <h3>{service.title}</h3><p>{service.text}</p>
            <button className="card-action" aria-expanded={active === service.id} aria-controls={`detail-${service.id}`} onClick={() => setActive(active === service.id ? null : service.id)}><span>{active === service.id ? 'A little less' : 'A little more'}</span><span className="circle" aria-hidden="true">{active === service.id ? '−' : '+'}</span></button>
            <div className="card-detail" id={`detail-${service.id}`} hidden={active !== service.id}><p>{service.detail}</p></div>
          </motion.article>)}
        </motion.div>
      </section>

      <section className="implementation" id="implementation" aria-labelledby="implementation-title">
        <p className="eyebrow">ДЛЯ МАРКА / ЩО САМЕ РЕАЛІЗОВАНО</p>
        <h2 id="implementation-title">Як це зроблено<br /><em>і що це показує.</em></h2>
        <div className="implementation-grid">
          <div><span className="implementation-tag">ВЛАСНИЙ CSS / JS</span><h3>Текст, композиція, ховери</h3><p>Поява рядків заголовка, рух геометричних фігур, реакція карток і кнопок на наведення та фокус — власний CSS. Розкриття деталей і повторний запуск — логіка на React / TypeScript.</p></div>
          <div><span className="implementation-tag">MOTION FOR REACT + LENIS</span><h3>Поява карток і плавний скрол</h3><p>Motion for React (Framer Motion) керує почерговою появою карток із пружною динамікою та появою секцій. Lenis забезпечує плавний скрол колесом миші; на телефоні збережено нативний скрол.</p></div>
        </div>
        <div className="scope-grid">
          <div><h3><span className="status-dot" /> Показано в демо</h3><ul><li>Next.js з реальними інтерактивними анімаціями.</li><li>Власні ефекти та бібліотеки з поясненням їхньої ролі.</li><li>Адаптивний інтерфейс і розкриття карток дотиком.</li><li>Керування клавіатурою та режим зменшеного руху.</li></ul></div>
          <div><h3>Для завершення основного сайту</h3><p>Точні сценарії та таймінги за коментарями Figma погодимо після доступу до макета. Інтеграція в наявний код Endorphin, Payload CMS, фінальна оптимізація та реліз — наступні роботи за основним завданням.</p><p>Це демо показує підхід до анімацій; перелічені роботи в ньому ще не виконані.</p></div>
        </div>
      </section>
      <section lang="en" className="closing" id="motion" aria-labelledby="motion-title">
        <p className="eyebrow">02 / ONCE MORE, WITH FEELING</p>
        <motion.h2 id="motion-title" initial={reduced ? false : { opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .8 }}>Small details.<br /><em>Big difference.</em></motion.h2>
        <button className="pill" onClick={repeat}>Play it again <span aria-hidden="true">↻</span></button>
      </section>
    </main>
    <footer><span>ENDORPHIN / MOTION CONCEPT</span><p>Спеціально для Марка Гетмана та Endorphin<br />Валентин Соломко · Демонстраційний концепт</p><a href="https://freelancehunt.com/freelancer/valpere.html" target="_blank" rel="noreferrer">Let’s talk <Arrow /></a></footer>
  </>;
}

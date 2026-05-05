import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const useScrollAnimation = (options = {}) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const {
      y = 60,
      opacity = 0,
      duration = 0.8,
      start = 'top 80%',
      stagger = 0,
      children = false,
    } = options;

    if (children) {
      gsap.from(el.children, {
        y,
        opacity,
        duration,
        stagger: stagger || 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start,
        },
      });
    } else {
      gsap.from(el, {
        y,
        opacity,
        duration,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start,
        },
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === el) t.kill();
      });
    };
  }, []);

  return ref;
};

export default useScrollAnimation;

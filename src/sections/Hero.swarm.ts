import { box } from "@/swarm/actions/box";
import { type, typeAll } from "@/swarm/actions/type";
import { pick } from "@/swarm/dom";
import { track, type Script } from "@/swarm/runner";
import { sleep } from "@/swarm/time";

/**
 * The nav and the hero, with all three agents at once. frontend types the name and
 * builds the two buttons under it. backend types the logo and the links and boxes the
 * nav's two buttons. ai builds the status pill, then types the role line and the intro.
 *
 * Still to come with their actions: frontend's guide and font swap, backend's nav line.
 * Until then the line appears when the section finishes.
 */
export const hero: Script = async (T, { fe, be, ai }, [nav, header]) => {
  await Promise.all([
    track(fe, T, async () => {
      await type(fe, pick(header, "h1"), T);
      for (const button of header.querySelectorAll<HTMLElement>('a[data-b="box"]')) {
        await box(fe, button, T);
        await type(fe, pick(button, '[data-b="text"]'), T);
      }
    }),
    track(be, T, async () => {
      await type(be, pick(nav, ':scope > [data-b="text"]'), T);
      await typeAll(be, nav.querySelectorAll<HTMLElement>('a[data-b="text"]'), T);
      const ask = pick(nav, 'a[data-b="box"]');
      await box(be, ask, T);
      await type(be, pick(ask, '[data-b="text"]'), T);
      await box(be, pick(nav, 'button[data-b="box"]'), T);
    }),
    track(ai, T, async () => {
      await sleep(300, T);
      const pill = pick(header, ':scope > [data-b="box"]');
      await box(ai, pill, T);
      await type(ai, pick(pill, '[data-b="text"]'), T);
      for (const line of header.querySelectorAll<HTMLElement>(":scope > p")) {
        await type(ai, line, T);
      }
    }),
  ]);
};

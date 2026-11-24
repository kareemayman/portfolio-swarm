import { box } from "@/swarm/actions/box";
import { font } from "@/swarm/actions/font";
import { hline, vguide } from "@/swarm/actions/guide";
import { type, typeAll } from "@/swarm/actions/type";
import { docRect, pick } from "@/swarm/dom";
import { fadeOut } from "@/swarm/overlay";
import { track, type Script } from "@/swarm/runner";
import { sleep } from "@/swarm/time";

/**
 * The nav and the hero, with all three agents at once. frontend drags a guide in to the
 * left edge, types the name in a draft font and swaps in Raleway through a font picker,
 * then builds the two buttons under it. backend types the logo and the links, boxes the
 * nav's two buttons and draws the nav's bottom line. ai builds the status pill, then
 * types the role line and the intro.
 */
export const hero: Script = async (T, { fe, be, ai }, [nav, header]) => {
  await Promise.all([
    track(fe, T, async () => {
      const name = pick(header, "h1");
      const top = docRect(nav);
      const bottom = docRect(header);
      const guide = await vguide(fe, docRect(name).x, top.y + top.h + 30, bottom.y + bottom.h - 70, T);
      try {
        await type(fe, name, T, { draft: true, keep: true });
        await sleep(240, T);
        await font(fe, name, T);
      } finally {
        fadeOut(guide);
      }
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
      await hline(be, nav, T);
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

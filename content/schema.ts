import { z } from "zod";

/** The three agents. Also the layers a project can belong to. */
export const Layer = z.enum(["fe", "be", "ai"]);
export type Layer = z.infer<typeof Layer>;

export const Project = z
  .object({
    slug: z.string(),
    title: z.string(),
    kind: z.string(),
    context: z.string(),
    when: z.string().optional(),
    status: z.enum(["shipped", "in-progress"]),
    live: z.boolean().default(false),
    confidential: z.boolean().default(false),
    layer: Layer,
    layers: z.array(Layer).min(1),
    featured: z.boolean().default(false),
    role: z.string(),
    stack: z.array(z.string()).min(1),
    line: z.string(),
    summary: z.string(),
    problem: z.string(),
    built: z.array(z.string()).min(1).max(6),
    results: z.array(z.tuple([z.string(), z.string()])).length(3),
    architecture: z.object({
      nodes: z.array(
        z.object({
          id: z.string(),
          label: z.string(),
          sub: z.string(),
          x: z.number().min(0).max(100),
          y: z.number().min(0).max(100),
          layer: z.enum(["fe", "be", "ai", "ink"]),
        }),
      ),
      edges: z.array(z.tuple([z.string(), z.string()])),
    }),
    media: z.object({
      url: z.string(),
      shots: z
        .array(
          z.object({
            label: z.string(),
            video: z.string().optional(),
            // Optional until the recordings exist. The handoff makes it required.
            poster: z.string().optional(),
          }),
        )
        .length(3),
    }),
    link: z.object({ label: z.string(), href: z.url() }).nullable(),
    // Copy that only the featured card shows. Not in the handoff's schema,
    // but the prototype's cards use different wording from the project page.
    card: z
      .object({
        tag: z.string(),
        text: z.string(),
        chips: z.array(z.string()).min(1),
        linkLabel: z.string().optional(),
      })
      .optional(),
  })
  .refine((p) => !p.featured || p.card !== undefined, {
    message: "A featured project needs its card copy",
    path: ["card"],
  })
  .refine(
    (p) => {
      const ids = new Set(p.architecture.nodes.map((n) => n.id));
      return p.architecture.edges.every(([a, b]) => ids.has(a) && ids.has(b));
    },
    { message: "An edge points at a node that does not exist", path: ["architecture", "edges"] },
  );
export type Project = z.infer<typeof Project>;
export type ProjectInput = z.input<typeof Project>;

/** Text with a bold lead-in, as in "**faster Tseppas**, mostly from image and bundle work". */
const Lead = z.object({ lead: z.string(), rest: z.string() });

export const Profile = z.object({
  name: z.string(),
  logo: z.string(),
  github: z.string(),
  hero: z.object({
    status: z.string(),
    // "Software engineer. **Full stack, building with AI.**"
    role: z.object({ plain: z.string(), strong: z.string() }),
    intro: z.string(),
  }),
  proof: z
    .array(z.object({ value: z.string(), unit: z.string(), caption: Lead }))
    .length(3),
  experience: z.object({
    span: z.string(),
    rows: z
      .array(
        z.object({
          when: z.string(),
          role: z.string(),
          where: z.string(),
          what: z.string(),
        }),
      )
      .min(1),
  }),
  now: z.object({
    updated: z.string(),
    items: z.array(z.object({ key: z.string(), layer: Layer, text: Lead })).length(3),
  }),
  stack: z.array(z.object({ label: z.string(), layer: Layer, items: z.array(z.string()).min(1) })),
  outside: z.object({
    music: z.object({
      big: z.string(),
      bigNote: z.string(),
      title: z.string(),
      text: z.string(),
    }),
    programming: z.object({
      big: z.string(),
      bigNote: z.string(),
      title: z.string(),
      text: z.string(),
    }),
  }),
  contact: z.object({
    where: z.string(),
    heading: z.string(),
    intro: z.string(),
    email: z.email(),
    links: z.array(z.object({ label: z.string(), href: z.url() })),
    suggestions: z.array(z.string()),
    placeholder: z.string(),
  }),
});
export type Profile = z.infer<typeof Profile>;
export type ProfileInput = z.input<typeof Profile>;

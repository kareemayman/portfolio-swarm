import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProject, projects } from "@content/projects";
import { ProjectPage } from "@/project/ProjectPage";

// The whole page must come from static output. For a slug that isn't a project this
// also makes Next wait for the render instead of sending a fallback shell first, so
// notFound() below can still answer with a real 404 status.
export const ensureStatic = "navigation";

// This page reads `params` with no Suspense boundary around it, on purpose: behind a
// boundary the content ships as a late chunk and disappears when JavaScript is off.
// The cost is that a navigation here waits for the (static) page instead of showing
// a placeholder first, so tell Next's dev validation that blocking is expected.
export const instant = false;

// Every project is known at build time, so all nine pages are prerendered.
export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return { title: project.title, description: project.summary };
}

export default async function Page({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <main>
      <ProjectPage project={project} />
    </main>
  );
}

import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

// The pages stay in pages/ (one copy, also read by build_html.py), not src/content/docs/.
export const collections = {
	docs: defineCollection({
		loader: glob({ pattern: '**/*.md', base: './pages' }),
		schema: docsSchema(),
	}),
};

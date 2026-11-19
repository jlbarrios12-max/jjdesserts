import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './src/sanity/schemas';
import { estructura } from './src/sanity/structure';
import { accionesPedido, ACCIONES_QUITADAS } from './src/sanity/accionesPedido';

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID || 'your-project-id';
const dataset = import.meta.env.PUBLIC_SANITY_DATASET || 'production';

export default defineConfig({
  name: 'jjdesserts',
  title: 'JJ Desserts CMS',
  projectId,
  dataset,
  plugins: [structureTool({ structure: estructura })],
  schema: {
    types: schemaTypes,
  },
  document: {
    // Pedidos: botones de estado primero; sin duplicar, borrar ni despublicar.
    actions: (anteriores, { schemaType }) =>
      schemaType === 'order'
        ? [...accionesPedido, ...anteriores.filter((a) => !ACCIONES_QUITADAS.includes(a.action ?? ''))]
        : anteriores,
    // Los pedidos solo los crea la web: fuera del botón global "Crear".
    newDocumentOptions: (anteriores) => anteriores.filter((t) => t.templateId !== 'order'),
  },
});

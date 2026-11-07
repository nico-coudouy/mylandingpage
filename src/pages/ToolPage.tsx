import { lazy, Suspense } from 'react';
import { useParams } from 'react-router';
import { toolBySlug } from '../tools/registry';
import ToolShell from '../components/tools/ToolShell';
import NotFound from './NotFound';

// Each tool and its libraries load only when someone opens it.
const COMPONENTS: Record<string, ReturnType<typeof lazy>> = {
  'unir-y-separar-pdf': lazy(() => import('../tools/PdfTool')),
  'fotos-a-pdf': lazy(() => import('../tools/PhotosToPdf')),
  'qr-whatsapp': lazy(() => import('../tools/QrTool')),
  'calculadora-video': lazy(() => import('../tools/VideoCalculator')),
};

export default function ToolPage() {
  const { slug } = useParams();
  const tool = toolBySlug(slug);
  const Component = slug ? COMPONENTS[slug] : undefined;
  if (!tool || !Component) return <NotFound />;
  return (
    <ToolShell tool={tool} local={tool.files}>
      <Suspense fallback={<div className="tool-loading" aria-busy="true" />}>
        <Component />
      </Suspense>
    </ToolShell>
  );
}

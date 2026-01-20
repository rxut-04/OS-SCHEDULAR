import { Suspense } from 'react';
import KineticModulesList from '@/components/ui/kinetic-team-hybrid';

function ModulesLoading() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <div className="animate-pulse text-neutral-500">Loading modules...</div>
    </div>
  );
}

export default function ModulesPage() {
  return (
    <Suspense fallback={<ModulesLoading />}>
      <KineticModulesList />
    </Suspense>
  );
}

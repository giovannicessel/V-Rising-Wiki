import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Home } from 'lucide-react';
import { useLocation } from 'wouter';
import { useTranslation } from '@/contexts/LocaleContext';

export default function NotFound() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0a] text-white">
      <Card className="w-full max-w-lg mx-4 shadow-lg border border-[#333] bg-[#111]/90">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="flex justify-center mb-6">
            <AlertCircle className="h-16 w-16 text-[#c41e3a]" />
          </div>

          <h1 className="text-4xl font-gothic font-bold mb-2">{t('notFound.title')}</h1>

          <h2 className="text-xl font-semibold text-[#ccc] mb-4">
            {t('notFound.heading')}
          </h2>

          <p className="text-[#888] mb-8 leading-relaxed">{t('notFound.body')}</p>

          <Button
            onClick={() => setLocation('/')}
            className="bg-[#c41e3a] hover:bg-[#a01729] text-white px-6 py-2.5"
          >
            <Home className="w-4 h-4 mr-2" />
            {t('notFound.home')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}


'use client';

import { useParams, useRouter } from 'next/navigation';
import { firstAidCategories, FirstAidTopic } from '@/lib/first-aid-data';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckSquare } from 'lucide-react';
import { useEffect, useState }from 'react';

export default function FirstAidDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { slug } = params;

  const [topic, setTopic] = useState<FirstAidTopic | undefined>(undefined);

  useEffect(() => {
    if (slug) {
      const foundTopic = firstAidCategories.find((t) => t.slug === slug);
      setTopic(foundTopic);
    }
  }, [slug]);

  if (!topic) {
    return (
        <div className="flex flex-col h-screen bg-background">
            <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background border-b">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-6 w-6" />
                </Button>
            </header>
            <div className="flex-1 flex items-center justify-center">
                <p>Emergency guide not found.</p>
            </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
        <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background border-b">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-xl font-bold truncate">{topic.title}</h1>
            <div className="w-8"></div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-500/20 rounded-lg">
                            <topic.icon className="h-8 w-8 text-red-500" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl">{topic.title}</CardTitle>
                            <CardDescription>{topic.description}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {topic.videoUrl && (
                        <div className="aspect-video mb-6">
                        <iframe
                            className="w-full h-full rounded-lg"
                            src={topic.videoUrl}
                            title={`First aid video for ${topic.title}`}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                        </div>
                    )}
                    
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg">What to do:</h3>
                        {topic.steps.map((step, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 rounded-md bg-card/80">
                                <CheckSquare className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                                <p>{step}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </main>
    </div>
  );
}


"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Check, Languages } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { cn } from '@/lib/utils';
import { languageOptions } from '@/locales/language-options';


export default function LanguagePage() {
    const router = useRouter();
    const { language, setLanguage } = useLanguage();

    return (
        <div className="flex flex-col h-screen bg-background">
            <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background border-b border-border/80">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <h1 className="text-xl font-bold">Select Language</h1>
                <div className="w-8"></div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Languages /> Select a Language
                        </CardTitle>
                         <CardDescription>
                            Your selected language will be used across the app.
                         </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {languageOptions.map((lang) => (
                             <button 
                                key={lang.code} 
                                className={cn(
                                    "w-full flex items-center p-4 rounded-xl bg-card/80 hover:bg-card/50 transition-colors text-left",
                                    language === lang.code && "ring-2 ring-primary"
                                )}
                                onClick={() => setLanguage(lang.code)}
                            >
                                <div className="flex-1">
                                    <p className="font-semibold">{lang.name}</p>
                                    <p className="text-sm text-muted-foreground">{lang.nativeName}</p>
                                </div>
                                {language === lang.code && <Check className="h-5 w-5 text-primary" />}
                            </button>
                        ))}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}


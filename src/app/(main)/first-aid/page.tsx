
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { firstAidCategories } from '@/lib/first-aid-data';
import { ArrowRight, Search, HeartPulse } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function FirstAidPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = firstAidCategories.filter(
    (category) =>
      category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 md:py-8 space-y-6">
      <div className="text-center space-y-2">
        <HeartPulse className="mx-auto h-12 w-12 text-red-500" />
        <h1 className="text-3xl font-bold">First Aid Help</h1>
        <p className="text-muted-foreground">
          Quick guides for common medical emergencies. This is not a substitute for professional medical help.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search for an emergency..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCategories.map((category) => (
          <Link href={`/first-aid/${category.slug}`} key={category.slug}>
            <Card className="hover:border-primary hover:bg-card/50 transition-all">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-500/20 rounded-lg">
                    <category.icon className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <CardTitle>{category.title}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
       {filteredCategories.length === 0 && (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
          </div>
        )}
    </div>
  );
}

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import albumsData from '@/data/albums.json';

export default function Photos() {
  return (
    <div className="pb-6">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold">📷 Team Photos</h1>
        </div>
      </div>

      <div className="px-4 pt-4">
        {albumsData.length > 0 ? (
          <div className="space-y-4">
            {albumsData.map(album => (
              <Card key={album.id} className="overflow-hidden">
                <CardContent className="p-0">
                  {/* Placeholder for cover image */}
                  <div className="w-full h-48 bg-gradient-to-br from-mercury-green to-green-800 flex items-center justify-center text-white">
                    <div className="text-center">
                      <p className="text-6xl mb-2">📷</p>
                      <p className="text-lg font-semibold">{album.photoCount} photos</p>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1">{album.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {album.date} • {album.photoCount} photos
                    </p>
                    {album.photographer && (
                      <p className="text-xs text-gray-500 mb-3">
                        Photos by {album.photographer}
                      </p>
                    )}

                    <Button
                      className="w-full bg-mercury-green hover:bg-mercury-green/90"
                      asChild
                    >
                      <a
                        href={album.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Album
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-6xl mb-4">📷</p>
            <p className="text-gray-500 mb-2">No photo albums yet</p>
            <p className="text-sm text-gray-400">Check back after games!</p>
          </div>
        )}
      </div>
    </div>
  );
}
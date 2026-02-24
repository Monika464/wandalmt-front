import React from "react";
import type { IResource } from "../../types/types";
import VideoTitle from "../video/VideoTitle";
import { useVideoNavigation } from "../../hooks/useVideoNavigation";

interface Props {
  resource: IResource;
}

const ViewPublicResource: React.FC<Props> = ({ resource }) => {
  const { handlePlayVideo } = useVideoNavigation();
  return (
    <div className="p-4 border rounded-md bg-gray-50">
      {/* <h2 className="text-xl font-bold mb-2">{resource.title}</h2>
      <p className="mb-2">{resource.content}</p> */}
      {/* 
      <h3 className="text-lg font-semibold mb-2">Chapters</h3> */}
      {resource.chapters && resource.chapters.length > 0 ? (
        <ul className="space-y-2">
          {resource.chapters.map((ch, index) => (
            <li key={ch._id} className="border p-2 rounded bg-white shadow-sm">
              <h4 className="font-semibold">{ch.title}</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Video:</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                    {ch.videoId && <VideoTitle videoId={ch.videoId} />}
                  </code>
                  {index === 0 && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handlePlayVideo(ch)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                      >
                        ▶️ Play Video
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">Brak rozdziałów</p>
      )}
    </div>
  );
};

export default ViewPublicResource;

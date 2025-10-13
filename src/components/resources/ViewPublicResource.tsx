import React from "react";
import type { IResource } from "../../types";

interface Props {
  resource: IResource;
}

const ViewPublicResource: React.FC<Props> = ({ resource }) => {
  return (
    <div className="p-4 border rounded-md bg-gray-50">
      <h2 className="text-xl font-bold mb-2">{resource.title}</h2>
      <p className="mb-2">{resource.content}</p>

      {/* {resource.imageUrl && (
        <img
          src={resource.imageUrl}
          alt={resource.title}
          className="w-full h-48 object-cover rounded mb-2"
        />
      )} */}

      {resource.videoUrl && (
        <video controls className="w-full rounded mb-4">
          <source src={resource.videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}

      <h3 className="text-lg font-semibold mb-2">Chapters</h3>
      {resource.chapters && resource.chapters.length > 0 ? (
        <ul className="space-y-2">
          {resource.chapters.map((ch) => (
            <li key={ch._id} className="border p-2 rounded bg-white shadow-sm">
              <h4 className="font-semibold">{ch.title}</h4>
              <p className="text-sm text-gray-600">{ch.description}</p>
              {ch.videoUrl && (
                <video controls className="w-full mt-2 rounded">
                  <source src={ch.videoUrl} type="video/mp4" />
                </video>
              )}
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

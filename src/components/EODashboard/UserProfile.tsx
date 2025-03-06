import React from "react";

interface UserProfileProps {
  name: string;
  userId: string;
  establishmentCount: number;
  lastLogin: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  name,
  userId,
  establishmentCount,
  lastLogin,
}) => {
  return (
    <div className="bg-white/80 rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-bold mb-2">{name}</h3>
      <div className="space-y-1 text-sm">
        <p>
          <span className="text-gray-600">User ID Number: </span>
          <span className="font-semibold">{userId}</span>
        </p>
        <p>
          <span className="text-gray-600">No. of Establishment: </span>
          <span className="font-semibold">{establishmentCount}</span>
        </p>
        <p>
          <span className="text-gray-600">Last Log In: </span>
          <span className="font-semibold">{lastLogin}</span>
        </p>
      </div>
    </div>
  );
};

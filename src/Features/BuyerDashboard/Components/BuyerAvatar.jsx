import { memo, useState } from 'react';

function BuyerAvatar({
  profile,
  src = profile?.avatar_url,
  name = profile?.full_name || profile?.name || 'Buyer',
  alt = `${name} profile`,
  className = '',
  imageClassName = '',
  loading = 'lazy',
}) {
  const [failedSrc, setFailedSrc] = useState('');
  const avatarUrl = typeof src === 'string' ? src.trim() : '';
  const initial = (name?.trim()?.charAt(0) || 'B').toUpperCase();
  const showImage = avatarUrl && avatarUrl !== failedSrc;

  return (
    <div
      className={`overflow-hidden bg-gradient-to-br from-violet-400 to-indigo-600 text-white ${className}`}
    >
      {showImage ? (
        <img
          src={avatarUrl}
          alt={alt}
          loading={loading}
          decoding="async"
          className={`h-full w-full object-cover ${imageClassName}`}
          onError={() => setFailedSrc(avatarUrl)}
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center">{initial}</span>
      )}
    </div>
  );
}

export default memo(BuyerAvatar);

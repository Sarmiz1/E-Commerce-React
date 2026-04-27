export const formatStoreName = (name = "") => {
  const length = name.length;

  return {
    name,

    isShort: length <= 20,
    isMedium: length > 20 && length <= 40,
    isLong: length > 40,

    // UI hints (important)
    shouldWrap: length > 20,
    shouldTruncate: length > 40,
  };
};
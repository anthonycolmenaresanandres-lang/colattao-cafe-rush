export function getFallLayout(width: number, height: number) {
  // 448px was the playable height below the original 560px page minimum.
  const compact = height < 448;
  const hudHeight = compact ? 64 : 132;
  const regularSize = Math.min(160, Math.max(136, width * 0.39));
  // Leave at least two drink heights for catching below the compact HUD.
  const itemSize = compact ? Math.min(regularSize, Math.max(44, (height - hudHeight) / 3)) : regularSize;
  return { compact, hudHeight, itemSize };
}

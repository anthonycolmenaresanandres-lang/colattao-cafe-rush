import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getFallLayout } from '../../src/game/scenes/fallLayout.ts';

for (const [viewport, width, height] of [['568x320',460,208], ['844x390',454,278]]) {
  test(`${viewport}: a fully visible drink stays tappable across a substantial fall band`, () => {
    const { hudHeight, itemSize } = getFallLayout(width,height);
    const enabledCenter = hudHeight + itemSize / 2;
    const lastFullyVisibleCenter = height - itemSize / 2;
    const fullBand = lastFullyVisibleCenter - enabledCenter;
    const travel = height + 2 * (itemSize * 0.58 + 8);
    assert.ok(itemSize >= 44, 'touch target must remain at least 44px');
    assert.ok(fullBand >= itemSize, 'reserve at least a whole target height after input activates');
    assert.ok(fullBand / travel >= 0.3, 'fully visible input must cover at least 30% of the fall');
    assert.ok(enabledCenter < height, 'input must activate before the center leaves the canvas');
    const oldSize = Math.min(160,Math.max(136,width*0.39));
    assert.ok(height-oldSize/2 <= 132+oldSize/2, 'the production baseline fails this fully visible catch invariant');
  });
}

test('portrait and desktop preserve the original HUD and collectible dimensions', () => {
  for (const [width,height] of [[312,456],[382,732],[454,788],[460,448]]) {
    const layout=getFallLayout(width,height);
    assert.equal(layout.compact,false);
    assert.equal(layout.hudHeight,132);
    assert.equal(layout.itemSize,Math.min(160,Math.max(136,width*0.39)));
  }
});

test('responsive sizes leave good and bad hit targets at their established relative scale', () => {
  for (let height=208;height<448;height+=10) {
    const {hudHeight,itemSize}=getFallLayout(460,height);
    assert.ok(itemSize*0.94 >= 44);
    assert.ok(hudHeight+itemSize*2 <= height);
  }
});

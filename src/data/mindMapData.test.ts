import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterNodesByPreset,
  getIntersectionsForNode,
  getNextNodeId,
  MIND_MAP_NODES,
  MIND_MAP_PRESETS,
  STRATEGIC_INTERSECTIONS,
} from './mindMapData';

test('mind map defines 8 distinct marketing nodes within safe SVG canvas bounds', () => {
  assert.equal(MIND_MAP_NODES.length, 8);
  assert.equal(MIND_MAP_PRESETS.length, 4);
  assert.ok(STRATEGIC_INTERSECTIONS.length >= 8);

  const ids = new Set(MIND_MAP_NODES.map((n) => n.id));
  assert.equal(ids.size, 8);

  for (const node of MIND_MAP_NODES) {
    assert.ok(node.x >= 80 && node.x <= 780, `node ${node.id} x out of safe margin`);
    assert.ok(node.y >= 50 && node.y <= 490, `node ${node.id} y out of safe margin`);
    assert.ok(node.primaryMetric.length > 0);
    assert.ok(node.guerrillaGives.length > 15);
    assert.ok(node.channelGives.length > 15);
  }
});

test('all strategic intersections link valid nodes and avoid self-loops', () => {
  const validIds = new Set(MIND_MAP_NODES.map((n) => n.id));
  for (const edge of STRATEGIC_INTERSECTIONS) {
    assert.ok(validIds.has(edge.fromId), `missing fromId ${edge.fromId}`);
    assert.ok(validIds.has(edge.toId), `missing toId ${edge.toId}`);
    assert.notEqual(edge.fromId, edge.toId);
    assert.ok(edge.impactMetric.length > 0);
  }
});

test('preset filtering returns expected strategic subsets', () => {
  assert.equal(filterNodesByPreset('all').length, 8);

  const virality = filterNodesByPreset('virality');
  assert.ok(virality.some((n) => n.id === 'ugc'));
  assert.ok(virality.some((n) => n.id === 'pr'));
  assert.ok(virality.some((n) => n.id === 'social'));

  const conversion = filterNodesByPreset('conversion');
  assert.ok(conversion.some((n) => n.id === 'digital'));
  assert.ok(conversion.some((n) => n.id === 'affiliate'));
  assert.ok(conversion.some((n) => n.id === 'crm'));

  const ugcEdges = getIntersectionsForNode('ugc');
  assert.ok(ugcEdges.length >= 2);
});

test('getNextNodeId cycles cleanly across all nodes', () => {
  const first = MIND_MAP_NODES[0].id;
  const last = MIND_MAP_NODES[MIND_MAP_NODES.length - 1].id;
  assert.equal(getNextNodeId(first), MIND_MAP_NODES[1].id);
  assert.equal(getNextNodeId(last), first);
  assert.equal(getNextNodeId('unknown_node'), first);
});

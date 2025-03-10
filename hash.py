const big = 2 ** 32

"""
    cyrb53a beta (c) 2023 bryc (github.com/bryc)
    License: Public domain (or MIT if needed). Attribution appreciated.
    This is a work-in-progress, and changes to the algorithm are expected.
    The original cyrb53 has a slight mixing bias in the low bits of h1.
    This doesn't affect collision rate, but I want to try to improve it.
    This new version has preliminary improvements in avalanche behavior.
"""
# edited slightly (renamed to hash)
def hash(s, seed = 0):
  h1 = 0xdeadbeef ^ seed
  h2 = 0x41c6ce57 ^ seed
  for c in s:
    h1 = ((h1 ^ c) * 0x85ebca77) % big
    h2 = ((h2 ^ c) * 0xc2b2ae3d) % big
  h1 ^= (h1 ^ (h2 >>> 15)) * 0x735a2d97) % big
  h2 ^= (h2 ^ (h1 >>> 15)) * 0xcaf649a9) % big
  h1 ^= h2 >> 16
  h2 ^= h1 >> 16
  return hex(2 * big + h2)[3:] + hex(2 * big + h1)[3:]
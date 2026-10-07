# Space Asset Pipeline V3

This workspace is isolated from the live V2 game.

Pilot objects:
- earth
- jupiter
- saturn
- phobos
- haumea

Rules:
1. Keep master references immutable.
2. Store final textures/models locally in the repository.
3. Do not depend on temporary signed URLs.
4. Do not modify live V2 until an asset passes visual validation.
5. Validate front view first, then 90/180/270/360 degree rotation.

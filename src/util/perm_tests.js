let permBitfield = 0;

permBitfield = permBitfield ^ 0x1;
permBitfield = permBitfield ^ 0x2;
permBitfield = permBitfield | 0x4;

console.log((permBitfield & 0x1) === 0x1);

permBitfield = permBitfield ^ 0x1;

console.log((permBitfield & 0x1) === 0x1);
console.log((permBitfield & 0x2) === 0x2);
console.log(typeof permBitfield);

/**
 *
 * Attendee bitfield:
 * View Party = 0x1
 * Edit Party = 0x2
 * Manage Attendees = 0x4
 * View Attendees = 0x8
 * Start | End Party = 0x10
 * Cancel Party = 0x20
 *
 *
 * UserProfile bitfield:
 * Join Party = 0x1
 * Leave Party = 0x2
 * View Party = 0x4
 * Confirm Party = 0x8
 * Overlord Moderator = 0x10
 * View Profiles = 0x40
 * Edit Profiles = 0x80
 *
 */

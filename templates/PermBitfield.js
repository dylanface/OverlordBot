class PermBitfield {
  constructor(bitDefs, bits = 0) {
    this.bits = bits;
    this.bitDefs = bitDefs;
  }

  checkPerm(permBitfield) {
    return (this.bits & permBitfield) === permBitfield;
  }

  addPerms(bitfield) {
    if (typeof bitfield !== "number")
      throw new Error("Invalid bitfield provided.");

    this.bits = this.bits | bitfield;
    return this;
  }

  removePerm(bitfield) {
    if (typeof bitfield !== "number")
      throw new Error("Invalid bitfield provided.");

    this.bits = this.bits & ~bitfield;
    return this;
  }

  translatePerms() {
    const perms = [];
    const bitfields = [];
    for (const [perm, bit] of Object.entries(this.bitDefs)) {
      if (this.checkPerm(bit)) perms.push(perm);
    }

    for (const role in DefaultPartyBitfields) {
      const bitfield = DefaultPartyBitfields[role];
      if (this.checkPerm(bitfield)) bitfields.push(role);
    }

    for (const role in DefaultUserProfileBitfields) {
      const bitfield = DefaultUserProfileBitfields[role];
      if (this.checkPerm(bitfield)) bitfields.push(role);
    }

    return {
      perms: perms,
      bitfields: bitfields,
    };
  }

  toString() {
    return this.bits.toString();
  }
}

const AttendeeBits = {
  VIEW_PARTY: 0x1,
  EDIT_PARTY: 0x2,
  MANAGE_ATTENDEES: 0x4,
  VIEW_ATTENDEES: 0x8,
  BAN_ATTENDEE: 0x10,
  KICK_ATTENDEE: 0x20,
  START_PARTY: 0x40,
  END_PARTY: 0x80,
  CANCEL_PARTY: 0x100,
  FORCE_ANNOUNCEMENT: 0x200,
};

const UserProfileBits = {
  JOIN_PARTY: 0x1,
  LEAVE_PARTY: 0x2,
  CONFIRM_PARTY: 0x4,
  VIEW_PROFILES: 0x10,
  EDIT_PROFILES: 0x20,
  MANAGE_ANNOUNCEMENTS: 0x40,
  EDIT_ANNOUCEMENT: 0x80,
  VIEW_ANNOUNCEMENTS: 0x100,
  IGNORE_EDITS: 0x10000,
};

const DefaultPartyBitfields = {
  DEFAULT: AttendeeBits.VIEW_PARTY,
  PARTY_HOST:
    AttendeeBits.VIEW_PARTY |
    AttendeeBits.EDIT_PARTY |
    AttendeeBits.VIEW_ATTENDEES |
    AttendeeBits.KICK_ATTENDEE |
    AttendeeBits.START_PARTY |
    AttendeeBits.END_PARTY |
    AttendeeBits.CANCEL_PARTY,
  PARTY_MODERATOR:
    AttendeeBits.VIEW_PARTY |
    AttendeeBits.EDIT_PARTY |
    AttendeeBits.VIEW_ATTENDEES |
    AttendeeBits.KICK_ATTENDEE |
    AttendeeBits.START_PARTY |
    AttendeeBits.END_PARTY |
    AttendeeBits.CANCEL_PARTY |
    AttendeeBits.MANAGE_ATTENDEES |
    AttendeeBits.BAN_ATTENDEE |
    AttendeeBits.FORCE_ANNOUNCEMENT,
};

const DefaultUserProfileBitfields = {
  DEFAULT: UserProfileBits.JOIN_PARTY | UserProfileBits.LEAVE_PARTY,
  PARTY_AUDITOR:
    UserProfileBits.JOIN_PARTY |
    UserProfileBits.LEAVE_PARTY |
    UserProfileBits.CONFIRM_PARTY |
    UserProfileBits.VIEW_ANNOUNCEMENTS,
  PARTY_ADMIN:
    UserProfileBits.JOIN_PARTY |
    UserProfileBits.LEAVE_PARTY |
    UserProfileBits.CONFIRM_PARTY |
    UserProfileBits.VIEW_ANNOUNCEMENTS |
    UserProfileBits.MANAGE_ANNOUNCEMENTS |
    UserProfileBits.EDIT_ANNOUCEMENT,
  OVERLORD_ADMIN:
    UserProfileBits.JOIN_PARTY |
    UserProfileBits.LEAVE_PARTY |
    UserProfileBits.EDIT_PROFILES |
    UserProfileBits.VIEW_PROFILES |
    UserProfileBits.IGNORE_EDITS,
};

module.exports.PermBitfield = PermBitfield;
module.exports.AttendeeBits = AttendeeBits;
module.exports.UserProfileBits = UserProfileBits;
module.exports.DefaultPartyBitfields = DefaultPartyBitfields;
module.exports.DefaultUserProfileBitfields = DefaultUserProfileBitfields;
